export interface HeuristicAnalysisResult {
  isOpportunity: boolean;
  score: number;
  commercialIntent: "PAID" | "FREE" | "EQUITY" | "COLLABORATION" | "UNCLEAR";
  opportunityType: string;
  budgetDetected: string | null;
  currency: string;
  timeline: string | null;
  summary: string;
  requirements: string[];
  technologies: string[];
  reasons: string[];
  outreachPitch: string;
}

const HARD_REJECT_PATTERNS = [
  /\b\[for\s*hire\]/i,
  /\b\[forhire\]/i,
  /\bfor\s*hire\b/i,
  /\bhire\s*me\b/i,
  /\bseeking\s*(a\s*)?(job|work|internship|employment)\b/i,
  /\blooking\s*for\s*(a\s*)?(job|internship|employment)\b/i,
  /\bavailable\s*for\s*(hire|work|freelance)\b/i,
  /\bmy\s*portfolio\b/i,
  /\bi\s*am\s*a\s*(freelance|web\s*developer|software\s*engineer|designer)\b/i,
  /\bhow\s*(do\s*i|to|can\s*i)\s*(learn|start|code|build|program)\b/i,
  /\bbeginner\s*(tutorial|guide|question|advice)\b/i,
  /\bhomework\b/i,
  /\bfree\s*tutorial\b/i,
  /\bwhy\s*is\s*my\s*(code|css|javascript|react|server)\s*(failing|broken|not\s*working)\b/i,
];

const POSITIVE_PATTERNS = [
  { regex: /\b\[hiring\]/i, score: 35, reason: "Explicit [Hiring] tag" },
  { regex: /\b\[paid\]/i, score: 25, reason: "Explicit [Paid] tag" },
  { regex: /\b\[task\]/i, score: 20, reason: "Explicit [Task] tag" },
  {
    regex: /\b(need|seeking|hiring|want)\s+(?:a|an|to\s+hire|someone\s+to\s+build|someone\s+to\s+set\s+up|someone\s+to\s+help\s+with)?\s*(?:[a-z0-9\-\/,\s]{0,35})?\s*(website|web\s*developer|developer|programmer|landing\s*page|web\s*app|ecommerce|shopify|wordpress|mvp|store|frontend|full[\s\-]stack)\b/i,
    score: 30,
    reason: "Explicit website / developer hiring need",
  },
  {
    regex: /\blooking\s+for\s+(?:a|an|someone|volunteer|freelance|technical|co-founder)?\s*(?:[a-z0-9\-\/,\s]{0,30})?\s*(web\s*developer|developer|programmer|website\s*builder|freelancer|engineer|partner)\b/i,
    score: 30,
    reason: "Actively searching for web developer / partner",
  },
  {
    regex: /\bcan\s*someone\s*(build|make|create|design|code)\s*(me\s*)?(a\s*)?(website|site|landing\s*page|app|store)\b/i,
    score: 28,
    reason: "Requesting site creation",
  },
  {
    regex: /\bhelp\s*(me\s*|us\s*)?(build|fix|redesign|create)\s*(my\s*|our\s*)?(website|store|shopify|wordpress|app)\b/i,
    score: 25,
    reason: "Requesting website build or redesign",
  },
  {
    regex: /\blaunching\s+(?:a|an|my|our)?\s*(?:[a-z0-9\-\s]{0,25})?\s*(business|startup|brand|store|app|company|product)\b/i,
    score: 20,
    reason: "New business launch",
  },
  {
    regex: /\bredesign\s*(my|our)?\s*website\b/i,
    score: 25,
    reason: "Website redesign project",
  },
  {
    regex: /\bfix\s*(my|our)?\s*(website|wordpress|shopify|bug)\b/i,
    score: 20,
    reason: "Website bug fix / maintenance",
  },
];

const BUDGET_PATTERNS = [
  /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:\s*-\s*\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?)?)/,
  /\b(\d{2,6})\s*(usd|dollars|eur|gbp|inr|cad|aud)\b/i,
  /\b(budget\s*(?:is|of|:)?\s*[\$€£]?\s*\d+)/i,
  /\b(paid\s*gig|hourly\s*rate\s*[\$€£]?\d+)\b/i,
];

const URGENCY_PATTERNS = [
  /\basap\b/i,
  /\burgent\b/i,
  /\bimmediately\b/i,
  /\bthis\s*week\b/i,
  /\bdeadline\b/i,
  /\bwithin\s*(\d+)\s*(days|weeks)\b/i,
  /\bby\s*(tomorrow|monday|friday|next\s*week)\b/i,
];

const TECH_KEYWORDS: Record<string, RegExp> = {
  Shopify: /\bshopify\b/i,
  WordPress: /\bwordpress\b/i,
  WooCommerce: /\bwoocommerce\b/i,
  Webflow: /\bwebflow\b/i,
  Wix: /\bwix\b/i,
  Squarespace: /\bsquarespace\b/i,
  React: /\breact(?:\.js)?\b/i,
  "Next.js": /\bnext(?:\.js)?\b/i,
  Vue: /\bvue(?:\.js)?\b/i,
  "Tailwind CSS": /\btailwind(?:\s*css)?\b/i,
  "Node.js": /\bnode(?:\.js)?\b/i,
  PHP: /\bphp\b/i,
  Laravel: /\blaravel\b/i,
  Python: /\bpython\b/i,
  Django: /\bdjango\b/i,
  FastAPI: /\bfastapi\b/i,
  Stripe: /\bstripe\b/i,
  Supabase: /\bsupabase\b/i,
  Firebase: /\bfirebase\b/i,
};

export function analyzePostHeuristically(
  title: string,
  body: string
): HeuristicAnalysisResult {
  const fullText = `${title}\n\n${body}`;
  const reasons: string[] = [];
  const requirements: string[] = [];
  const detectedTech: string[] = [];

  // 1. Hard Reject Patterns
  for (const neg of HARD_REJECT_PATTERNS) {
    if (neg.test(title) || neg.test(body)) {
      return {
        isOpportunity: false,
        score: 10,
        commercialIntent: "UNCLEAR",
        opportunityType: "NOT_RELEVANT",
        budgetDetected: null,
        currency: "USD",
        timeline: null,
        summary: "Rejected: Post is not a freelance hiring opportunity (job-seeker, question, or tutorial).",
        requirements: [],
        technologies: [],
        reasons: ["Author is job-seeking, asking learning questions, or self-promoting."],
        outreachPitch: "",
      };
    }
  }

  // 2. Score positive hiring patterns
  let score = 25; // baseline

  for (const pos of POSITIVE_PATTERNS) {
    if (pos.regex.test(title) || pos.regex.test(body)) {
      score += pos.score;
      reasons.push(pos.reason);
    }
  }

  // 3. Detect Commercial Intent & Budget
  let commercialIntent: HeuristicAnalysisResult["commercialIntent"] = "UNCLEAR";
  let budgetDetected: string | null = null;

  for (const bPattern of BUDGET_PATTERNS) {
    const match = fullText.match(bPattern);
    if (match) {
      budgetDetected = match[0];
      commercialIntent = "PAID";
      score += 18;
      reasons.push(`Budget mentioned: ${budgetDetected}`);
      break;
    }
  }

  if (!budgetDetected) {
    if (/\b(unpaid|volunteer|for\s*free|no\s*budget|no\s*money)\b/i.test(fullText)) {
      commercialIntent = "FREE";
      score += 10;
      reasons.push("Free / Unpaid project detected");
    } else if (/\b(equity|shares?|percentage\s*of\s*rev)\b/i.test(fullText)) {
      commercialIntent = "EQUITY";
      score += 10;
      reasons.push("Equity / Rev-share opportunity");
    } else if (/\b(collab|partner\s*up|co-founder)\b/i.test(fullText)) {
      commercialIntent = "COLLABORATION";
      score += 10;
      reasons.push("Collaboration / Partner opportunity");
    } else if (/\b(paid|rate|compensat(?:ed|ion)|hourly)\b/i.test(fullText)) {
      commercialIntent = "PAID";
      score += 15;
      reasons.push("Paid opportunity mentioned");
    }
  }

  // 4. Detect Urgency & Timeline
  let timeline: string | null = null;
  for (const urg of URGENCY_PATTERNS) {
    const match = fullText.match(urg);
    if (match) {
      timeline = match[0];
      score += 10;
      reasons.push(`Urgent timeline detected: ${timeline}`);
      break;
    }
  }

  // 5. Detect Technologies
  for (const [techName, regex] of Object.entries(TECH_KEYWORDS)) {
    if (regex.test(fullText)) {
      detectedTech.push(techName);
    }
  }
  if (detectedTech.length > 0) {
    score += Math.min(12, detectedTech.length * 5);
    reasons.push(`Tech stack: ${detectedTech.join(", ")}`);
  }

  // 6. Opportunity Type
  let opportunityType = "WEBSITE_BUILD";
  if (/\bshopify\b/i.test(fullText)) opportunityType = "SHOPIFY";
  else if (/\bwordpress\b/i.test(fullText)) opportunityType = "WORDPRESS";
  else if (/\becommerce|online\s*store|shop\b/i.test(fullText)) opportunityType = "ECOMMERCE";
  else if (/\blanding\s*page\b/i.test(fullText)) opportunityType = "LANDING_PAGE";
  else if (/\bredesign\b/i.test(fullText)) opportunityType = "WEBSITE_REDESIGN";
  else if (/\bfix|bug|troubleshoot|broken\b/i.test(fullText)) opportunityType = "BUG_FIX";
  else if (/\bweb\s*app|saas|dashboard|mvp\b/i.test(fullText)) opportunityType = "CUSTOM_WEB_APP";

  // Requirements extraction heuristic
  if (detectedTech.length > 0) requirements.push(`Tech: ${detectedTech.join(", ")}`);
  if (budgetDetected) requirements.push(`Budget: ${budgetDetected}`);
  if (timeline) requirements.push(`Timeline: ${timeline}`);
  requirements.push(`Type: ${opportunityType.replace(/_/g, " ")}`);

  // Cap score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, score));
  const isOpportunity = normalizedScore >= 60;

  // Generate clean summary
  const summary = `${opportunityType.replace(/_/g, " ")} opportunity in ${commercialIntent} tier. ${reasons.slice(0, 3).join(". ")}.`;

  // Generate Suggested Outreach Pitch
  const outreachPitch = `Hi! I saw your post regarding "${title}". I'm an experienced web developer specializing in ${detectedTech.length > 0 ? detectedTech.join(", ") : "modern responsive websites and web applications"}. I'd love to help you build this out efficiently. Let me know if you'd like to discuss the requirements or see relevant portfolio work!`;

  return {
    isOpportunity,
    score: normalizedScore,
    commercialIntent,
    opportunityType,
    budgetDetected,
    currency: "USD",
    timeline,
    summary,
    requirements,
    technologies: detectedTech,
    reasons,
    outreachPitch,
  };
}
