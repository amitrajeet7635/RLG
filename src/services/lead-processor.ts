import { db } from "../lib/db";
import { env } from "../config/env";
import { RawRedditPost } from "../lib/reddit-client";
import { generateContentHash, isPostDuplicate } from "../lib/deduplication";
import { analyzePostHeuristically, HeuristicAnalysisResult } from "../lib/heuristics";
import { analyzeWithGemini } from "../lib/gemini";
import { sendTelegramAlert } from "../lib/telegram";
import { sendDiscordWebhookAlert } from "../lib/discord";

export interface ProcessedLeadResult {
  postId: string;
  isOpportunity: boolean;
  score: number;
  leadId?: string;
  notified: boolean;
}

export async function processRedditPost(
  post: RawRedditPost,
  subredditMinScore: number = 70
): Promise<ProcessedLeadResult> {
  const contentHash = generateContentHash(post.title, post.body);

  // 1. Deduplication check
  const duplicate = await isPostDuplicate(post.id, contentHash);
  if (duplicate) {
    return { postId: post.id, isOpportunity: false, score: 0, notified: false };
  }

  // 2. Persist Raw Reddit Post
  try {
    await db.redditPost.create({
      data: {
        redditPostId: post.id,
        subreddit: post.subreddit,
        author: post.author,
        title: post.title,
        body: post.body,
        url: post.url,
        createdAtUtc: post.createdAtUtc,
        contentHash,
      },
    });
  } catch (err: any) {
    // If unique constraint triggered by concurrent poll, ignore and skip
    return { postId: post.id, isOpportunity: false, score: 0, notified: false };
  }

  // 3. Increment Subreddit totalPosts count
  await db.subreddit.updateMany({
    where: { name: { equals: post.subreddit } },
    data: { totalPosts: { increment: 1 } },
  });

  // 4. Run Heuristic Analysis
  let analysis: HeuristicAnalysisResult = analyzePostHeuristically(
    post.title,
    post.body
  );
  let isAiAnalyzed = false;
  let aiConfidence: number | null = null;

  // 5. Two-Stage Smart Pipeline: ONLY invoke Gemini AI for candidate leads (score >= 50)
  // This drastically cuts API calls and prevents Gemini Free Tier 429 (5 requests/min) rate limits
  if (
    analysis.isOpportunity &&
    analysis.score >= 50 &&
    env.GEMINI_API_KEY &&
    env.GEMINI_API_KEY.trim() !== ""
  ) {
    // 2-second rate-limiting spacer for Google Gemini Free Tier
    await new Promise((r) => setTimeout(r, 2000));
    const geminiResult = await analyzeWithGemini(post.title, post.body);
    if (geminiResult) {
      analysis = {
        isOpportunity: geminiResult.isOpportunity,
        score: geminiResult.score,
        commercialIntent: geminiResult.commercialIntent,
        opportunityType: geminiResult.opportunityType,
        budgetDetected: geminiResult.budgetDetected || analysis.budgetDetected,
        currency: geminiResult.currency || "USD",
        timeline: geminiResult.timeline || analysis.timeline,
        summary: geminiResult.summary || analysis.summary,
        requirements:
          geminiResult.requirements.length > 0
            ? geminiResult.requirements
            : analysis.requirements,
        technologies:
          geminiResult.technologies.length > 0
            ? geminiResult.technologies
            : analysis.technologies,
        reasons:
          geminiResult.reasons.length > 0
            ? geminiResult.reasons
            : analysis.reasons,
        outreachPitch: geminiResult.outreachPitch || analysis.outreachPitch,
      };
      isAiAnalyzed = true;
      aiConfidence = geminiResult.confidence;
    }
  }

  // 6. Qualification check
  const minRequiredScore = Math.min(subredditMinScore, env.MIN_OPPORTUNITY_SCORE);
  const isQualified = analysis.isOpportunity && analysis.score >= minRequiredScore;

  if (!isQualified) {
    return {
      postId: post.id,
      isOpportunity: false,
      score: analysis.score,
      notified: false,
    };
  }

  // 7. Save Qualified Lead to Database
  const lead = await db.lead.create({
    data: {
      redditPostId: post.id,
      subreddit: post.subreddit,
      author: post.author,
      title: post.title,
      body: post.body,
      url: post.url,
      createdAtUtc: post.createdAtUtc,
      commercialIntent: analysis.commercialIntent,
      opportunityType: analysis.opportunityType,
      score: analysis.score,
      budget: analysis.budgetDetected,
      currency: analysis.currency,
      timeline: analysis.timeline,
      summary: analysis.summary,
      requirements: JSON.stringify(analysis.requirements),
      technologies: JSON.stringify(analysis.technologies),
      outreachPitch: analysis.outreachPitch,
      aiConfidence,
      isAiAnalyzed,
      status: "NEW",
    },
  });

  // Update subreddit qualified count
  await db.subreddit.updateMany({
    where: { name: { equals: post.subreddit } },
    data: { qualifiedLeads: { increment: 1 } },
  });

  // 8. Notification dispatch if score meets threshold
  let notified = false;
  if (analysis.score >= env.MIN_NOTIFICATION_SCORE) {
    const alertData = {
      title: post.title,
      subreddit: post.subreddit,
      author: post.author,
      url: post.url,
      score: analysis.score,
      commercialIntent: analysis.commercialIntent,
      opportunityType: analysis.opportunityType,
      budget: analysis.budgetDetected,
      timeline: analysis.timeline,
      summary: analysis.summary,
      requirements: analysis.requirements,
      technologies: analysis.technologies,
      outreachPitch: analysis.outreachPitch,
    };

    const tgRes = await sendTelegramAlert(alertData);
    if (tgRes.success) {
      notified = true;
      await db.lead.update({
        where: { id: lead.id },
        data: { notifiedAt: new Date() },
      });
    }

    if (env.DISCORD_WEBHOOK_URL) {
      await sendDiscordWebhookAlert(alertData);
    }
  }

  // Log event
  await db.systemLog.create({
    data: {
      level: "SUCCESS",
      event: "LEAD_QUALIFIED",
      message: `Qualified lead in r/${post.subreddit}: "${post.title.substring(0, 60)}" (Score: ${analysis.score})`,
      data: JSON.stringify({ leadId: lead.id, score: analysis.score, notified }),
    },
  });

  return {
    postId: post.id,
    isOpportunity: true,
    score: analysis.score,
    leadId: lead.id,
    notified,
  };
}
