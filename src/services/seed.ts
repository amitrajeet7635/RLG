import { db } from "../lib/db";
import { DEFAULT_SUBREDDITS } from "../config/default-subreddits";

export async function seedDatabaseIfEmpty() {
  const count = await db.subreddit.count();
  if (count === 0) {
    console.log("Seeding default subreddits into database...");
    for (const sub of DEFAULT_SUBREDDITS) {
      await db.subreddit.upsert({
        where: { name: sub.name },
        update: {},
        create: {
          name: sub.name,
          minScore: sub.minScore,
          description: sub.description,
          enabled: true,
        },
      });
    }
    console.log(`Seeded ${DEFAULT_SUBREDDITS.length} subreddits.`);
  }
}
