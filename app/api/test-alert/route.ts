import { NextRequest, NextResponse } from "next/server";
import { sendTelegramTestAlert } from "@/src/lib/telegram";
import { env } from "@/src/config/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || env.TELEGRAM_BOT_TOKEN;
    const chatId = body.chatId || env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide Telegram Bot Token and Chat ID in .env or the form.",
        },
        { status: 400 }
      );
    }

    const res = await sendTelegramTestAlert(token, chatId);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Test Telegram alert sent successfully! Check your Telegram chat.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
