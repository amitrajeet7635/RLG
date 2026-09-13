import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { env } from "@/src/config/env";

export async function GET() {
  try {
    const [subredditsCount, leadsCount, postsCount] = await Promise.all([
      db.subreddit.count({ where: { enabled: true } }),
      db.lead.count(),
      db.redditPost.count(),
    ]);

    return NextResponse.json({
      status: "HEALTHY",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      stats: {
        activeSubreddits: subredditsCount,
        totalQualifiedLeads: leadsCount,
        totalScannedPosts: postsCount,
      },
      integrations: {
        geminiEnabled: Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== ""),
        telegramEnabled: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
        discordEnabled: Boolean(env.DISCORD_WEBHOOK_URL && env.DISCORD_WEBHOOK_URL.trim() !== ""),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "UNHEALTHY", error: err.message },
      { status: 500 }
    );
  }
}
