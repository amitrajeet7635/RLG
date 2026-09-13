import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().default("file:./dev.db"),
  GEMINI_API_KEY: z.string().optional().default(""),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(""),
  TELEGRAM_CHAT_ID: z.string().optional().default(""),
  DISCORD_WEBHOOK_URL: z.string().optional().default(""),
  REDDIT_CLIENT_ID: z.string().optional().default(""),
  REDDIT_CLIENT_SECRET: z.string().optional().default(""),
  REDDIT_USER_AGENT: z
    .string()
    .default("webdev-freelance-bot:v1.0.0 (by /u/freelance_dev)"),
  POLL_INTERVAL_SECONDS: z.coerce.number().default(20),
  POSTS_PER_SUBREDDIT: z.coerce.number().default(5),
  MIN_OPPORTUNITY_SCORE: z.coerce.number().default(70),
  MIN_NOTIFICATION_SCORE: z.coerce.number().default(75),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default("development"),
});

export const env = envSchema.parse(process.env);
