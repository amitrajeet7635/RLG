import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { env } from "@/src/config/env";

export async function GET() {
  const dbSettings = await db.setting.findMany();
  const settingsMap: Record<string, string> = {};
  dbSettings.forEach((s: { key: string; value: string }) => {
    settingsMap[s.key] = s.value;
  });

  return NextResponse.json({
    telegramConfigured: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    geminiConfigured: Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== ""),
    redditConfigured: Boolean(env.REDDIT_CLIENT_ID && env.REDDIT_CLIENT_SECRET && env.REDDIT_CLIENT_ID.trim() !== ""),
    discordConfigured: Boolean(env.DISCORD_WEBHOOK_URL && env.DISCORD_WEBHOOK_URL.trim() !== ""),
    pollInterval: settingsMap["POLL_INTERVAL_SECONDS"] || String(env.POLL_INTERVAL_SECONDS),
    minOpportunityScore: settingsMap["MIN_OPPORTUNITY_SCORE"] || String(env.MIN_OPPORTUNITY_SCORE),
    minNotificationScore: settingsMap["MIN_NOTIFICATION_SCORE"] || String(env.MIN_NOTIFICATION_SCORE),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pollInterval, minOpportunityScore, minNotificationScore } = body;

    if (pollInterval) {
      await db.setting.upsert({
        where: { key: "POLL_INTERVAL_SECONDS" },
        update: { value: String(pollInterval) },
        create: { key: "POLL_INTERVAL_SECONDS", value: String(pollInterval) },
      });
    }

    if (minOpportunityScore) {
      await db.setting.upsert({
        where: { key: "MIN_OPPORTUNITY_SCORE" },
        update: { value: String(minOpportunityScore) },
        create: { key: "MIN_OPPORTUNITY_SCORE", value: String(minOpportunityScore) },
      });
    }

    if (minNotificationScore) {
      await db.setting.upsert({
        where: { key: "MIN_NOTIFICATION_SCORE" },
        update: { value: String(minNotificationScore) },
        create: { key: "MIN_NOTIFICATION_SCORE", value: String(minNotificationScore) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
