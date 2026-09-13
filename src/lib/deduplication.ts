import crypto from "crypto";
import { db } from "./db";

export function generateContentHash(title: string, body: string): string {
  const normalized = `${title.toLowerCase().trim()}:::${body.toLowerCase().trim()}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export async function isPostDuplicate(
  redditPostId: string,
  contentHash: string
): Promise<boolean> {
  const existingPost = await db.redditPost.findFirst({
    where: {
      OR: [{ redditPostId }, { contentHash }],
    },
  });

  return existingPost !== null;
}
