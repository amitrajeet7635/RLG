import { env } from "../config/env";
import { TelegramAlertData } from "./telegram";

export async function sendDiscordWebhookAlert(
  data: TelegramAlertData,
  customWebhookUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = customWebhookUrl || env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.trim() === "") {
    return { success: false, error: "Discord webhook URL is not configured." };
  }

  const embed = {
    title: `🚨 Web Dev Lead [Score: ${data.score}/100]`,
    description: `**${data.title}**\n\n${data.summary || ""}`,
    url: data.url,
    color: data.score >= 90 ? 0xff4757 : data.score >= 80 ? 0xffa502 : 0x2ed573,
    fields: [
      { name: "📌 Subreddit", value: `r/${data.subreddit}`, inline: true },
      { name: "🧑 Author", value: `u/${data.author}`, inline: true },
      { name: "💰 Commercial Intent", value: data.commercialIntent, inline: true },
      { name: "💼 Opportunity Type", value: data.opportunityType.replace(/_/g, " "), inline: true },
      { name: "💵 Budget", value: data.budget || "Not specified", inline: true },
      { name: "⏰ Timeline", value: data.timeline || "Flexible / ASAP", inline: true },
      {
        name: "🛠 Technologies",
        value: data.technologies && data.technologies.length > 0 ? data.technologies.join(", ") : "Not specified",
        inline: false,
      },
    ],
    footer: {
      text: "Reddit Freelance Opportunity Intelligence Bot",
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!res.ok) {
      return { success: false, error: `Discord webhook HTTP error: ${res.statusText}` };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reach Discord Webhook" };
  }
}
