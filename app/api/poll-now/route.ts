import { NextResponse } from "next/server";
import { pollerService } from "@/src/services/poller-service";

export async function POST() {
  try {
    const stats = await pollerService.pollOnce();
    return NextResponse.json({
      success: true,
      stats,
      message: `Polled Reddit: Fetched ${stats.fetched} posts, found ${stats.qualified} qualified leads, sent ${stats.notified} notifications.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to poll Reddit" },
      { status: 500 }
    );
  }
}
