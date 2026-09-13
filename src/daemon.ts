import { pollerService } from "./services/poller-service";
import { env } from "./config/env";

console.log("=================================================");
console.log("  REDDIT FREELANCE OPPORTUNITY INTELLIGENCE BOT  ");
console.log("=================================================");
console.log(`• Poll Interval: ${env.POLL_INTERVAL_SECONDS} seconds`);
console.log(`• Min Lead Qualification Score: ${env.MIN_OPPORTUNITY_SCORE}`);
console.log(`• Min Notification Score: ${env.MIN_NOTIFICATION_SCORE}`);
console.log(
  `• Gemini AI Mode: ${
    env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== ""
      ? "ACTIVE"
      : "HEURISTIC (Zero API Key Mode)"
  }`
);
console.log(
  `• Telegram Alerts: ${
    env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID
      ? "CONFIGURED"
      : "DISABLED (Add token & chat_id to .env)"
  }`
);
console.log("=================================================\n");

pollerService.startDaemon(env.POLL_INTERVAL_SECONDS);

process.on("SIGINT", () => {
  console.log("\nShutting down poller...");
  pollerService.stopDaemon();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down poller...");
  pollerService.stopDaemon();
  process.exit(0);
});
