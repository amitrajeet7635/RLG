import { NextRequest, NextResponse } from "next/server";
import { pollerService } from "@/src/services/poller-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for external Reddit fetching and AI processing

export async function GET(req: NextRequest) {
  // Optional security check for Vercel Cron or external cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await pollerService.pollOnce();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
      message: `Cron poll complete: Fetched ${stats.fetched} posts, found ${stats.qualified} leads, sent ${stats.notified} alerts.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute cron poll" },
      { status: 500 }
    );
  }
}
