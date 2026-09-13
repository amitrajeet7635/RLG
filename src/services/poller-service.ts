import { db } from "../lib/db";
import { env } from "../config/env";
import { redditClient } from "../lib/reddit-client";
import { processRedditPost } from "./lead-processor";
import { seedDatabaseIfEmpty } from "./seed";

class PollerService {
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;
  private lastCursor: string | undefined = undefined;

  public async pollOnce(): Promise<{
    fetched: number;
    qualified: number;
    notified: number;
  }> {
    await seedDatabaseIfEmpty();

    const enabledSubs = await db.subreddit.findMany({
      where: { enabled: true },
    });

    if (enabledSubs.length === 0) {
      console.log("No enabled subreddits found.");
      return { fetched: 0, qualified: 0, notified: 0 };
    }

    const subNames: string[] = enabledSubs.map((s: { name: string }) => s.name);
    const subMap = new Map<string, number>(
      enabledSubs.map((s: { name: string; minScore: number }) => [s.name.toLowerCase(), s.minScore])
    );

    const posts = await redditClient.fetchNewPosts(subNames, this.lastCursor);

    if (posts.length > 0) {
      this.lastCursor = posts[0].id;
    }

    let qualifiedCount = 0;
    let notifiedCount = 0;

    for (const post of posts) {
      const minScore: number = subMap.get(post.subreddit.toLowerCase()) ?? 70;
      try {
        const res = await processRedditPost(post, minScore);
        if (res.isOpportunity) qualifiedCount++;
        if (res.notified) notifiedCount++;
      } catch (err) {
        console.error(`Error processing post ${post.id}:`, err);
      }
    }

    // Update lastPolledAt timestamp for active subreddits
    const now = new Date();
    await db.subreddit.updateMany({
      where: { name: { in: subNames } },
      data: { lastPolledAt: now },
    });

    return {
      fetched: posts.length,
      qualified: qualifiedCount,
      notified: notifiedCount,
    };
  }

  public startDaemon(intervalSeconds: number = env.POLL_INTERVAL_SECONDS) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`Starting Reddit Lead Poller daemon (interval: ${intervalSeconds}s)...`);

    const run = async () => {
      try {
        const stats = await this.pollOnce();
        if (stats.fetched > 0) {
          console.log(
            `[Poller] Fetched: ${stats.fetched} | Qualified: ${stats.qualified} | Notified: ${stats.notified}`
          );
        }
      } catch (err) {
        console.error("[Poller] Loop error:", err);
      } finally {
        if (this.isRunning) {
          this.timer = setTimeout(run, intervalSeconds * 1000);
        }
      }
    };

    run();
  }

  public stopDaemon() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    console.log("Reddit Lead Poller daemon stopped.");
  }
}

export const pollerService = new PollerService();
