# Reddit Freelance Opportunity Intelligence Bot — Setup & Quickstart Guide

This guide will help you get your bot up and running in **under 2 minutes**.

---

## 1. Quick Start (Zero External API Fees)

By default, the bot runs using an ultra-fast, highly accurate **Rule-Based Heuristic Engine** and SQLite database. No external LLM key or database installation is required!

### Step 1: Install Dependencies & Setup Database

```bash
# 1. Install dependencies
npm install

# 2. Initialize the local database (SQLite)
npx prisma db push
```

### Step 2: Start the Web Dashboard

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You can click **"Poll Reddit Now"** anytime on the dashboard to immediately scan for new web development leads.

### Step 3: Run the Background Poller Daemon (Optional)

To automatically scan Reddit in the background continuously:

```bash
npm run worker
```

---

## 2. Instant Telegram Alerts Setup (Optional, 60 Seconds)

To receive real-time push alerts on your phone whenever a high-value freelance opportunity is published:

1. Open Telegram and search for **@BotFather**.
2. Send `/newbot`, follow the prompt, and copy your **Bot Token** (e.g. `789123456:AAH...`).
3. Search for **@userinfobot** on Telegram and hit Start to get your numeric **Chat ID** (e.g. `123456789`).
4. Add them to your `.env` file:
   ```env
   TELEGRAM_BOT_TOKEN="your_bot_token_here"
   TELEGRAM_CHAT_ID="your_chat_id_here"
   ```
5. Go to the **Settings** page on the dashboard and click **"Send Test Telegram Alert"** to confirm!

---

## 3. Google Gemini AI Enhancement (Optional)

If you have a Google Gemini API Key and want deep semantic analysis and automated tailored pitch generation:

1. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Add it to your `.env` file:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```
3. Restart the dev server or worker (`npm run dev` / `npm run worker`). The bot will automatically enhance summaries, extract requirements, and generate custom pitches using `gemini-1.5-flash`.

---

## 4. Monitored Subreddits

Default monitored subreddits include:
- `r/forhire`
- `r/freelance_forhire`
- `r/freelance`
- `r/webdev`
- `r/smallbusiness`
- `r/startups`
- `r/SideProject`
- `r/Wordpress`
- `r/shopify`
- `r/ecommerce`

You can add, pause, or remove subreddits and adjust per-subreddit score thresholds anytime from the **Subreddits** page in the Web UI.
