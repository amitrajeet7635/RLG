# ⚡ Reddit Lead Genius (RLG)

<div align="center">

**Real-Time Reddit Opportunity Intelligence & Instant Client Acquisition Engine**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[🌐 Live Production Dashboard](https://rlg-black.vercel.app) • [📖 Architecture](#-system-architecture) • [🚀 Quickstart](#-quickstart-guide) • [⚙️ Configuration](#-environment-variables)

</div>

---

## 📌 Overview

**Reddit Lead Genius (RLG)** continuously monitors high-intent Reddit communities (`r/forhire`, `r/webdev`, `r/smallbusiness`, `r/startups`, `r/Wordpress`, etc.) to surface paid web development and software engineering opportunities within seconds of publication.

By pairing a deterministic **Regex & Heuristics Engine** with a **Two-Stage Gemini AI Evaluation Pipeline**, RLG eliminates spam, homework requests, and job-seeker posts (`[For Hire]`) without unnecessary LLM billing or rate-limit saturation. Qualified leads trigger instant **Telegram & Discord push notifications** and populate a modern cockpit with tailored, one-click outreach pitches.

---

## 🏗 System Architecture

```mermaid
flowchart TD
    subgraph Ingestion["1. Ingestion Layer"]
        sub1["r/forhire"] & sub2["r/webdev"] & sub3["r/smallbusiness"] & sub4["r/startups"]
        client["Reddit Client Engine<br/><i>(OAuth API + High-Speed Fallback)</i>"]
        sub1 & sub2 & sub3 & sub4 -->|Parallel Concurrent Poll| client
    end

    subgraph Pipeline["2. Intelligence & Filtering Pipeline"]
        dedup{"SHA-256 Hash<br/>& ID Check"}
        storeRaw[("Prisma: RedditPost<br/><i>Raw Archive</i>")]
        heuristics["Rule-Based Heuristic Filter<br/><i>• Negative Signal Pruning<br/>• Commercial Intent Detection<br/>• Budget Extraction</i>"]
        scoreCheck{"Heuristic Score<br/>≥ 50?"}
        gemini["Google Gemini AI<br/><i>• Deep Semantic Qualification<br/>• Requirement & Tech Extraction<br/>• Outreach Pitch Synthesis</i>"]
        qualCheck{"Total Score<br/>≥ Threshold?"}
        
        client --> dedup
        dedup -->|Duplicate| dropPost[("Discard")]
        dedup -->|New Post| storeRaw
        storeRaw --> heuristics
        heuristics --> scoreCheck
        scoreCheck -->|Score < 50| archiveOnly[("Archived / Unqualified")]
        scoreCheck -->|Score ≥ 50| gemini
        gemini --> qualCheck
    end

    subgraph Persistence["3. Storage & Notifications"]
        leadDB[("Prisma: Lead<br/><i>PostgreSQL / Supabase</i>")]
        notifyCheck{"Score ≥ Alert<br/>Threshold?"}
        telegram["📲 Telegram Bot Alert<br/><i>Markdown V2 + Direct Link</i>"]
        discord["💬 Discord Webhook<br/><i>Rich Embedded Card</i>"]

        qualCheck -->|Yes| leadDB
        leadDB --> notifyCheck
        notifyCheck -->|Yes| telegram & discord
        notifyCheck -->|No| silentSave[("Silent Feed Update")]
    end

    subgraph Interface["4. Management & Cockpit"]
        dashboard["Next.js Web Dashboard<br/><i>https://rlg-black.vercel.app</i>"]
        feedView["Live Opportunity Radar Feed"]
        pitchGen["1-Click Outreach Pitches<br/><i>(DM, Comment, Value Angle)</i>"]
        subConfig["Subreddit Matrix & Scoring"]

        leadDB <--> dashboard
        dashboard --> feedView & pitchGen & subConfig
    end
```

---

## ✨ Key Features

### 🔍 Real-Time Stream Ingestion
- Concurrent multi-subreddit polling with `Promise.allSettled` and per-request timeouts.
- Dual-mode connection: Official Reddit OAuth2 client or high-speed resilient public mirror.
- SHA-256 cryptographic post fingerprinting to guarantee zero duplicate processing.

### 🧠 Two-Stage Cost-Optimized AI Engine
- **Stage 1 (Deterministic Heuristics)**: Instant regex evaluation for commercial intent (`PAID`, `EQUITY`, `COMMISSION`), budget mentions (`$500`, `1k`, `€`), and strict negative pruning (`[For Hire]`, homework, amateur tutorials). Runs in `<5ms` with zero API cost.
- **Stage 2 (Gemini 1.5 Flash)**: Deep semantic verification triggered only for high-probability candidates ($\ge 50$ score). Extracts concrete project deliverables, detected tech stack, timeline, and candidate confidence.

### 📲 Instant Multi-Channel Alerts
- **Telegram Bot**: Clean formatted alerts with score badges, budget indicators, client requirements, and an instant `[Open Reddit Post]` deep link.
- **Discord Webhooks**: Embedded message payloads ready for digital agency team channels.

### 💼 Outreach Command Center
- **Lead Feed**: Searchable, filterable Kanban-like interface displaying score, status, budget, and source subreddit.
- **Custom Pitch Generator**: Automatically synthesizes three high-converting outreach angles per qualified lead:
  1. **Direct DM Pitch**: Concise, polite, and focused on immediate action.
  2. **Community Comment Pitch**: Public-friendly, helpful, adhering to subreddit rules.
  3. **Value-First Pitch**: Highlights relevant technical solutions before pitching.

---

## 🧭 Dashboard Page Overview

| Route | Purpose | Key Actions |
| :--- | :--- | :--- |
| [`/`](https://rlg-black.vercel.app/) | **Opportunity Radar** | Filter by score, commercial intent, subreddit; track lead pipeline status (`NEW`, `CONTACTED`, `CONVERTED`). |
| [`/leads/[id]`](https://rlg-black.vercel.app/leads) | **Deep Lead Inspection** | Review AI confidence, extracted requirements, technologies, and copy customized outreach drafts. |
| [`/subreddits`](https://rlg-black.vercel.app/subreddits) | **Subreddit Monitor** | Toggle individual subreddits on/off; configure custom minimum score thresholds per community. |
| [`/settings`](https://rlg-black.vercel.app/settings) | **System Settings & Tests** | Adjust global thresholds, test Telegram & Discord alerts, inspect system logs. |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: `v18.17` or later
- **Database**: PostgreSQL (e.g. [Supabase](https://supabase.com), [Neon](https://neon.tech), or local PostgreSQL)

### 2. Clone & Install
```bash
git clone https://github.com/amitrajeet7635/RLG.git
cd RLG
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

```env
# Database Connections (PostgreSQL / Supabase)
DATABASE_URL="postgresql://user:pass@pooler-host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/postgres"

# AI Intelligence (Google Gemini)
GEMINI_API_KEY="your-google-gemini-api-key"

# Instant Notifications
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHAT_ID="your-telegram-chat-id"
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Engine Thresholds
MIN_OPPORTUNITY_SCORE=70
MIN_NOTIFICATION_SCORE=75
POLL_INTERVAL_SECONDS=20
```

### 4. Push Database Schema
```bash
npm run db:push
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⏱ Automated Cron & Deployment

### Vercel Deployment (Recommended)
This repository is configured for zero-configuration deployment on Vercel:

1. Import the repository into [Vercel](https://vercel.com).
2. Set your environment variables in the Vercel Project Settings.
3. Deploy! The application uses Next.js App Router with Prisma.

### Automated Poller Trigger (`/api/cron`)
To keep the lead feed fresh without running a continuous server, trigger the secured cron endpoint:

- **Endpoint**: `GET /api/cron`
- **Security**: Send `Authorization: Bearer <CRON_SECRET>` header (if `CRON_SECRET` is set in your `.env`).
- **Function Timeout**: Configured with `maxDuration = 60` for complete parallel fetching and AI evaluation.

#### Setting up via cron-job.org:
1. Create a free account at [cron-job.org](https://cron-job.org).
2. Create a new cron job pointing to `https://your-domain.vercel.app/api/cron`.
3. Set the schedule to **Every 5 to 10 minutes**.
4. In **Advanced Settings**, set **Execution Timeout** to **60 seconds**.
5. (Optional) Add request header `Authorization: Bearer <CRON_SECRET>`.

### VPS / Long-Running Daemon Mode
For dedicated servers or Docker containers, a background worker script is included:
```bash
npm run worker
```
Or with Docker Compose:
```bash
docker-compose up -d
```

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string (pooler supported). |
| `DIRECT_URL` | **Yes** | — | Direct PostgreSQL connection string for Prisma migrations. |
| `GEMINI_API_KEY` | Optional | — | Google Gemini API key for deep AI analysis and pitch writing. |
| `TELEGRAM_BOT_TOKEN` | Optional | — | Telegram Bot token created via [@BotFather](https://t.me/BotFather). |
| `TELEGRAM_CHAT_ID` | Optional | — | Chat ID or channel ID for receiving push notifications. |
| `DISCORD_WEBHOOK_URL`| Optional | — | Discord channel webhook for backup team alerts. |
| `CRON_SECRET` | Optional | — | Bearer token secret to secure `/api/cron` from unauthorized hits. |
| `MIN_OPPORTUNITY_SCORE` | No | `70` | Minimum score required to persist a post as a qualified lead. |
| `MIN_NOTIFICATION_SCORE` | No | `75` | Minimum score required to trigger Telegram/Discord notifications. |
| `POLL_INTERVAL_SECONDS` | No | `20` | Interval in seconds when running in standalone daemon mode. |

---

## 🧪 Testing

Run the automated test suite covering heuristic classification, negative rejection, and scoring accuracy:

```bash
npm test
```

---

## 🛡️ Responsible Usage & Compliance

- **Zero Automation on Reddit**: This bot strictly reads publicly available post content. It **never** posts automated comments, mass messages, or automated DMs on Reddit.
- **Human-in-the-Loop**: All communications with prospective clients are performed manually by you through authentic, human-reviewed outreach.
- **Respectful Ingestion**: Ingestion respects Reddit rate limits and implements backoff throttling.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
