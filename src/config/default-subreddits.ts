export interface DefaultSubredditConfig {
  name: string;
  minScore: number;
  description: string;
}

export const DEFAULT_SUBREDDITS: DefaultSubredditConfig[] = [
  {
    name: "forhire",
    minScore: 70,
    description: "Main hiring subreddit. Look for [Hiring] tags.",
  },
  {
    name: "freelance",
    minScore: 75,
    description: "Freelance client requirements and hiring discussions.",
  },
  {
    name: "webdev",
    minScore: 75,
    description: "Web development community, startup inquiries.",
  },
  {
    name: "smallbusiness",
    minScore: 65,
    description: "Small business owners looking for websites and redesigns.",
  },
  {
    name: "startups",
    minScore: 70,
    description: "Founders seeking MVPs, landing pages, and web apps.",
  },
  {
    name: "SideProject",
    minScore: 70,
    description: "Makers needing developers or tech partners.",
  },
  {
    name: "Wordpress",
    minScore: 70,
    description: "WordPress site building, troubleshooting, and plugin gigs.",
  },
  {
    name: "shopify",
    minScore: 70,
    description: "Shopify store creation, customization, and apps.",
  },
  {
    name: "ecommerce",
    minScore: 70,
    description: "Ecommerce owners looking for online stores.",
  },
  {
    name: "web_design",
    minScore: 70,
    description: "UI/UX and frontend web design client projects.",
  },
];
