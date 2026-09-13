import { env } from "../config/env";

export interface RawRedditPost {
  id: string;
  subreddit: string;
  author: string;
  title: string;
  body: string;
  url: string;
  permalink: string;
  createdAtUtc: Date;
  numComments: number;
}

export class RedditClient {
  private lastRequestTime = 0;
  private minIntervalMs = 1500;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  private async getAccessToken(): Promise<string | null> {
    if (
      !env.REDDIT_CLIENT_ID ||
      !env.REDDIT_CLIENT_SECRET ||
      env.REDDIT_CLIENT_ID.trim() === ""
    ) {
      return null;
    }

    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(
        `${env.REDDIT_CLIENT_ID.trim()}:${env.REDDIT_CLIENT_SECRET.trim()}`
      ).toString("base64");

      const res = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": env.REDDIT_USER_AGENT,
        },
        body: "grant_type=client_credentials",
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      if (data.access_token) {
        this.accessToken = data.access_token;
        this.tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
        return this.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  }

  public async fetchNewPosts(
    subreddits: string[],
    beforeCursor?: string
  ): Promise<RawRedditPost[]> {
    if (subreddits.length === 0) return [];

    // Rate limit throttle
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minIntervalMs) {
      await new Promise((r) => setTimeout(r, this.minIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();

    const token = await this.getAccessToken();

    // 1. If Official OAuth is configured, use Reddit OAuth endpoint
    if (token) {
      const subString = subreddits.join("+");
      const url = new URL(`https://oauth.reddit.com/r/${subString}/new`);
      url.searchParams.set("limit", "25");
      url.searchParams.set("raw_json", "1");
      if (beforeCursor) url.searchParams.set("before", beforeCursor);

      try {
        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": env.REDDIT_USER_AGENT,
          },
        });

        if (res.ok) {
          const json = await res.json();
          const children = json?.data?.children;
          if (Array.isArray(children) && children.length > 0) {
            return children.map((item: any) => {
              const d = item.data;
              const permalink = d.permalink || `/r/${d.subreddit}/comments/${d.id}/`;
              return {
                id: d.name || `t3_${d.id}`,
                subreddit: d.subreddit,
                author: d.author || "[deleted]",
                title: d.title || "",
                body: d.selftext || "",
                url: `https://www.reddit.com${permalink}`,
                permalink: permalink,
                createdAtUtc: new Date(d.created_utc * 1000),
                numComments: d.num_comments || 0,
              };
            });
          }
        }
      } catch (err) {
        console.error("Reddit OAuth fetch error:", err);
      }
    }

    // 2. Real-Time Public Live Reddit Ingestion (100% Real Live Posts from Real Users)
    const allPosts: RawRedditPost[] = [];

    // Filter out known banned subreddits
    const activeSubs = subreddits.filter((s) => s.toLowerCase() !== "freelance_forhire");

    const limit = Math.min(Math.max(env.POSTS_PER_SUBREDDIT, 1), 50);
    for (const sub of activeSubs) {
      try {
        const res = await fetch(
          `https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=${encodeURIComponent(
            sub
          )}&limit=${limit}`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
            },
          }
        );

        if (res.ok) {
          const json = await res.json();
          const items = json.data || [];
          for (const d of items) {
            if (!d.author || d.author === "[deleted]" || d.author === "AutoModerator") {
              continue;
            }

            const permalink = d.permalink || `/r/${d.subreddit}/comments/${d.id}/`;
            allPosts.push({
              id: d.id.startsWith("t3_") ? d.id : `t3_${d.id}`,
              subreddit: d.subreddit,
              author: d.author,
              title: d.title || "",
              body: d.selftext || "",
              url: `https://www.reddit.com${permalink}`,
              permalink: permalink,
              createdAtUtc: d.created_utc ? new Date(d.created_utc * 1000) : new Date(),
              numComments: d.num_comments || 0,
            });
          }
        }
      } catch (err) {
        // Continue to next subreddit if one fails
      }
    }

    return allPosts;
  }
}

export const redditClient = new RedditClient();
