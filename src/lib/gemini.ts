import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { HeuristicAnalysisResult } from "./heuristics";

export interface GeminiAnalysisResult {
  isOpportunity: boolean;
  score: number;
  commercialIntent: "PAID" | "FREE" | "EQUITY" | "COLLABORATION" | "UNCLEAR";
  opportunityType: string;
  budgetDetected: string | null;
  currency: string;
  timeline: string | null;
  summary: string;
  requirements: string[];
  technologies: string[];
  reasons: string[];
  outreachPitch: string;
  confidence: number;
}

export async function analyzeWithGemini(
  title: string,
  body: string,
  apiKey?: string
): Promise<GeminiAnalysisResult | null> {
  const key = apiKey || env.GEMINI_API_KEY;
  if (!key || key.trim() === "") {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const prompt = `You are an expert AI Lead Intelligence Assistant for a freelance web developer.
Analyze the following Reddit post to determine if it is a genuine web development freelance opportunity (client looking to hire or find someone to build/fix/redesign a website or web app).

Reddit Post Title: ${JSON.stringify(title)}
Reddit Post Body: ${JSON.stringify(body)}

Evaluate:
1. Is this someone looking to hire / get a website built (TRUE) or a job-seeker / tutorial / coding question / irrelevant (FALSE)?
2. Commercial intent: "PAID", "FREE", "EQUITY", "COLLABORATION", "UNCLEAR".
3. Opportunity type: e.g., "WEBSITE_BUILD", "WEBSITE_REDESIGN", "LANDING_PAGE", "ECOMMERCE", "SHOPIFY", "WORDPRESS", "CUSTOM_WEB_APP", "BUG_FIX", "NOT_RELEVANT".
4. Opportunity Score (0 to 100) reflecting commercial value, hiring certainty, and urgency.
5. Budget details (exact amount or range if mentioned).
6. Timeline / Deadline.
7. Concise 1-2 sentence opportunity summary.
8. Extracted bullet-point requirements.
9. Mentioned technologies.
10. A personalized, polite, high-converting outreach message/DM pitch that specifically references their post without being spammy.

Return STRICT JSON matching this schema:
{
  "isOpportunity": boolean,
  "score": number,
  "commercialIntent": "PAID" | "FREE" | "EQUITY" | "COLLABORATION" | "UNCLEAR",
  "opportunityType": string,
  "budgetDetected": string | null,
  "currency": "USD",
  "timeline": string | null,
  "summary": string,
  "requirements": string[],
  "technologies": string[],
  "reasons": string[],
  "outreachPitch": string,
  "confidence": number
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return {
      isOpportunity: Boolean(parsed.isOpportunity),
      score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
      commercialIntent: parsed.commercialIntent || "UNCLEAR",
      opportunityType: parsed.opportunityType || "WEBSITE_BUILD",
      budgetDetected: parsed.budgetDetected || null,
      currency: parsed.currency || "USD",
      timeline: parsed.timeline || null,
      summary: parsed.summary || "",
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
      technologies: Array.isArray(parsed.technologies) ? parsed.technologies : [],
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
      outreachPitch: parsed.outreachPitch || "",
      confidence: Number(parsed.confidence) || 0.9,
    };
  } catch (error) {
    console.error("Gemini AI analysis error, falling back to heuristic:", error);
    return null;
  }
}
