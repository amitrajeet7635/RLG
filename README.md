# 🔥 Reddit Freelance Opportunity Intelligence Bot

> Real-time AI & Heuristic web development opportunity detection and instant lead alert bot for freelance developers and digital agencies.

Detect high-intent freelance gigs as close to publication time as possible across Reddit, qualify them instantly, extract technical requirements, and receive actionable alerts on Telegram before competing developers notice.

---

## ⚡ Key Capabilities

- **🚀 Real-Time Reddit Stream Ingestion**: Scans multiple top freelance & business communities (`r/forhire`, `r/smallbusiness`, `r/freelance`, `r/webdev`, `r/startups`, `r/shopify`, `r/Wordpress`, etc.) with cursor pagination and rate-limit backoff.
- **🧠 Hybrid Intelligence (Zero Mandatory LLM Cost)**:
  - **Rule-Based Heuristic Engine (Default)**: Fast positive/negative pattern matching, intent qualification, budget detection, urgency weighting, and automated scoring (0–100) with zero external API fees.
  - **Optional Google Gemini AI (`gemini-1.5-flash`)**: Zero-shot deep semantic opportunity qualification, structured requirement extraction, and custom outreach pitch generator.
- **🛡️ Strict Negative Filtering**: Automatically filters out job-seekers (`[For Hire]`), student homework, beginner tutorials, and tech troubleshooting discussions.
- **🔁 Deduplication**: Content hashing (`SHA-256`) and Reddit Post ID constraints guarantee you never get alerted twice for the same gig.
- **📲 Instant Telegram Push Alerts**: Richly formatted alerts with score badges, urgency markers, commercial intent (`PAID`, `FREE`, `EQUITY`), budget details, and direct `[OPEN REDDIT POST]` links.
- **💻 Sleek Dark Mode Web Dashboard**: Built with Next.js 14, Tailwind CSS, Lucide icons:
  - Live lead feed with live search and multi-criteria filters.
  - Deep lead review page with one-click copyable outreach pitches (DM, Comment, Value-first).
  - Subreddit manager with per-community scoring thresholds.
  - Settings page with interactive Telegram test alert sender.
- **🔒 Zero-Spam & Human-in-the-Loop**: The bot never posts automated comments or mass DMs. All outreach is manual and reviewed by you.

---

## 🛠️ Quickstart

```bash
# 1. Install packages
npm install

# 2. Setup SQLite Database
npx prisma db push

# 3. Start Web Dashboard
npm run dev

# 4. Start Background Poller Worker (Optional)
npm run worker
```

Open [http://localhost:3000](http://localhost:3000) to view your dashboard!

---

## 📋 Environment Configuration (`.env`)

```env
DATABASE_URL="file:./dev.db"

# (Optional) Google Gemini API Key for smart AI analysis & custom pitch writing
GEMINI_API_KEY=""

# (Optional) Telegram Instant Alert Credentials
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""

# Operational Settings
POLL_INTERVAL_SECONDS=20
MIN_OPPORTUNITY_SCORE=70
MIN_NOTIFICATION_SCORE=75
PORT=3000
```

---

## 🧪 Testing

```bash
npm test
```

Runs the test suite covering heuristics, positive/negative signal rejection, scoring accuracy, and deduplication.

---

## 📜 Compliance & Safety

- Respects Reddit Developer Terms and Data API rate limits.
- Zero model training on Reddit user content.
- Human-in-the-loop manual outreach only.
