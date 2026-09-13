# 24/7 Cloud Deployment Guide (Zero Laptop Dependency)

Deploy this bot to the cloud so it runs continuously 24/7. You will receive instant Telegram alerts on your phone even when your laptop is completely powered off.

---

## Option 1: Deploy on Render (Recommended, Free / Lowest Effort)

1. Push this project to your **GitHub** account.
2. Go to **[render.com](https://render.com/)** and sign up / log in.
3. Click **"New +"** -> **"Web Service"** and connect your GitHub repository.
4. Settings:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Gemini API key)*
   - `TELEGRAM_BOT_TOKEN`: *(Your Telegram Bot token)*
   - `TELEGRAM_CHAT_ID`: *(Your Telegram Chat ID)*
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `file:./data/dev.db`
6. (Optional) Under **Disks**, add a 1 GB persistent disk mounted at `/app/data` so your SQLite database persists across redeploys.
7. Click **Deploy Web Service**!

> **How it runs 24/7**: The Next.js web server (`npm start`) automatically launches the background Reddit poller daemon on startup via `src/instrumentation.ts`. You don't need a separate worker server!

---

## Option 2: Deploy on Railway

1. Go to **[railway.app](https://railway.app/)**.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Add your Environment Variables (`GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).
4. Railway will automatically detect the `Dockerfile` and deploy both the Web Dashboard and background poller daemon.

---

## Option 3: Deploy on DigitalOcean Droplet (Dedicated VPS)

See the full, detailed step-by-step guide in [DIGITAL_OCEAN_GUIDE.md](file:///Users/amitrajeet/Downloads/Freelancing-Projects/Reddit%20Bot/docs/DIGITAL_OCEAN_GUIDE.md).

Quick summary:
```bash
# 1. Clone repository on your Droplet
git clone <your-repo-url> reddit-bot
cd reddit-bot

# 2. Add your credentials into .env
cp .env.example .env
nano .env

# 3. Start in background with Docker Compose
docker compose up -d --build
```

Your bot will start and automatically restart on server reboot (`restart: always`), scanning Reddit 24/7 and notifying your Telegram app.

---

## Option 4: Deploy on Vercel

You can host the dashboard and bot on **Vercel**, but because Vercel uses **Serverless Functions** (which sleep when not being requested), there are two differences from a traditional server:

### 1. Database Requirement (Cloud PostgreSQL)
Vercel serverless functions have an ephemeral filesystem (local SQLite `.db` files reset when the function goes to sleep).
- Create a free cloud PostgreSQL database on **[Neon.tech](https://neon.tech)** or **[Supabase.com](https://supabase.com)** (takes 60 seconds).
- In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
- Run `npx prisma db push` to initialize tables on your cloud database.
- In Vercel Project Settings -> **Environment Variables**, set:
  - `DATABASE_URL`: `postgresql://user:pass@ep-host.neon.tech/neondb?sslmode=require`

### 2. Autonomous Polling (Vercel Cron / External Cron)
Since Vercel cannot run a continuous infinite daemon (`setInterval`), it uses the endpoint we built at `/api/cron`:
- **Vercel Pro**: Automatically runs `vercel.json` crons every minute.
- **Vercel Free (Hobby)**: Free tier limits Vercel Cron to once per day. To get **1-minute real-time Reddit polling for free**:
  1. Create a free account on **[cron-job.org](https://cron-job.org)**.
  2. Create a cron job with URL: `https://your-app.vercel.app/api/cron`.
  3. Set execution interval to **Every 1 minute** (or 2 minutes).
  4. (Optional) In Vercel Environment Variables, set `CRON_SECRET=mysecretkey`, and in cron-job.org add header `Authorization: Bearer mysecretkey`.

### 3. Vercel Environment Variables to Set
- `DATABASE_URL`: *(Your Neon/Supabase PostgreSQL connection string)*
- `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
- `TELEGRAM_BOT_TOKEN`: *(Your Telegram Bot Token)*
- `TELEGRAM_CHAT_ID`: *(Your Telegram Chat ID)*
- `CRON_SECRET`: *(Optional secret for `/api/cron`)*
