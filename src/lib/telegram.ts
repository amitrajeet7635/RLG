import { env } from "../config/env";

export interface TelegramAlertData {
  title: string;
  subreddit: string;
  author: string;
  url: string;
  score: number;
  commercialIntent: string;
  opportunityType: string;
  budget?: string | null;
  timeline?: string | null;
  summary?: string | null;
  requirements?: string[];
  technologies?: string[];
  outreachPitch?: string | null;
}

function escapeHtml(text: string): string {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendTelegramAlert(
  data: TelegramAlertData,
  customToken?: string,
  customChatId?: string
): Promise<{ success: boolean; error?: string }> {
  const token = customToken || env.TELEGRAM_BOT_TOKEN;
  const chatId = customChatId || env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { success: false, error: "Telegram bot token or chat ID is not configured." };
  }

  const scoreBadge =
    data.score >= 90
      ? "🔥 <b>CRITICAL LEAD</b>"
      : data.score >= 80
      ? "🚨 <b>HIGH OPPORTUNITY</b>"
      : "🟡 <b>NEW LEAD</b>";

  const cleanTitle = escapeHtml(data.title);
  const cleanSummary = escapeHtml(data.summary || "");
  const cleanAuthor = escapeHtml(data.author);
  const cleanSubreddit = escapeHtml(data.subreddit);
  const cleanType = escapeHtml(data.opportunityType.replace(/_/g, " "));
  const cleanBudget = escapeHtml(data.budget || "Not specified");
  const cleanTimeline = escapeHtml(data.timeline || "Flexible / ASAP");
  const cleanIntent = escapeHtml(data.commercialIntent);
  const cleanTech =
    data.technologies && data.technologies.length > 0
      ? `\n🛠 <b>Tech:</b> ${escapeHtml(data.technologies.join(", "))}`
      : "";

  const message = `
${scoreBadge} (Score: <b>${data.score}/100</b>)

📌 <b>Subreddit:</b> r/${cleanSubreddit}
🧑 <b>Author:</b> u/${cleanAuthor}
💼 <b>Type:</b> ${cleanType}
💰 <b>Intent:</b> ${cleanIntent}
💵 <b>Budget:</b> ${cleanBudget}
⏰ <b>Timeline:</b> ${cleanTimeline}

📝 <b>Post:</b>
${cleanTitle}

🧠 <b>Summary:</b>
${cleanSummary}${cleanTech}
`.trim();

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: false,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Open Exact Post",
                url: data.url,
              },
            ],
            [
              {
                text: "💬 DM Author on Reddit",
                url: `https://www.reddit.com/message/compose/?to=${encodeURIComponent(data.author)}&subject=${encodeURIComponent("Re: " + data.title.substring(0, 35))}`,
              },
              {
                text: "🧑 View Profile",
                url: `https://www.reddit.com/user/${encodeURIComponent(data.author)}`,
              },
            ],
          ],
        },
      }),
    });

    const resData = await res.json();
    if (!res.ok || !resData.ok) {
      console.error("Telegram send error:", resData);
      return { success: false, error: resData.description || "Telegram API error" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Telegram network error:", error);
    return { success: false, error: error.message || "Failed to reach Telegram API" };
  }
}

export async function sendTelegramTestAlert(
  token: string,
  chatId: string
): Promise<{ success: boolean; error?: string }> {
  return sendTelegramAlert(
    {
      title: "Need a modern Next.js and Shopify store built for new apparel brand",
      subreddit: "forhire",
      author: "sample_client",
      url: "https://www.reddit.com/r/forhire/comments/1i8z89k/hiring_need_a_modern_nextjs_and_shopify_store/",
      score: 95,
      commercialIntent: "PAID",
      opportunityType: "SHOPIFY",
      budget: "$1,500 - $3,000",
      timeline: "Within 2 weeks",
      summary: "Client is launching a direct-to-consumer apparel store and needs full development and payment integration.",
      requirements: ["Shopify Store Setup", "Next.js Custom Frontend", "Stripe Checkout"],
      technologies: ["Shopify", "Next.js", "Tailwind CSS", "Stripe"],
    },
    token,
    chatId
  );
}
