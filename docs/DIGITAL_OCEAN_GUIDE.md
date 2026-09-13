# DigitalOcean 24/7 Hosting Guide: Step-by-Step

This guide walks you through deploying your autonomous Reddit Opportunity Bot on **DigitalOcean** in less than 5 minutes using Docker. Once deployed, the bot runs 24/7 scanning Reddit, qualifying leads, and sending Telegram alerts to your phone even when your personal laptop is completely off.

---

## Method A: Deploy on a DigitalOcean Droplet (Recommended - $4-$6/mo)

This gives you a dedicated server with a persistent database, zero timeouts, and automatic restart on system reboot.

### Step 1: Create a DigitalOcean Droplet with Docker Pre-installed

1. Log into your **[DigitalOcean Cloud Console](https://cloud.digitalocean.com/)**.
2. Click **Create** (top green button) -> **Droplets**.
3. Choose your options:
   - **Region**: Pick the closest region to you (e.g., New York, Frankfurt, Bangalore, Singapore).
   - **Choose an Image**: Click the **Marketplace** tab, search for **Docker**, and select **Docker on Ubuntu** (this comes with `docker` and `docker compose` pre-installed).
     *(Or select regular **Ubuntu 22.04 LTS / 24.04 LTS**)*.
   - **Droplet Type**: Select **Basic** -> **Regular** -> **$4/mo or $6/mo (1 GB RAM / 1 vCPU / 25 GB SSD)**. This is more than enough for this bot!
   - **Authentication**: Choose **SSH Key** (recommended) or set a secure **Root Password**.
4. Click **Create Droplet** and wait 30 seconds.
5. Copy your Droplet's **IPv4 Address** (e.g., `165.22.100.200`).

---

### Step 2: SSH into your Droplet

Open your computer's terminal and connect to your server:

```bash
ssh root@YOUR_DROPLET_IP
```
*(Enter your SSH passphrase or root password when prompted)*.

---

### Step 3: Clone Your Code

If your repository is on GitHub:

```bash
# Clone the repository
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git reddit-bot
cd reddit-bot
```

> **Alternative (Upload from local without GitHub)**:
> From your local Mac terminal, you can copy this folder directly using `rsync` or `scp`:
> ```bash
> rsync -avz --exclude 'node_modules' --exclude '.next' --exclude 'data' . root@YOUR_DROPLET_IP:/root/reddit-bot/
> ```

---

### Step 4: Configure Your Environment Variables

On the Droplet inside `/root/reddit-bot`:

```bash
# Create your .env file
nano .env
```

Paste your production credentials:

```env
NODE_ENV=production
DATABASE_URL=file:/app/data/dev.db

# AI & Telegram Keys
GEMINI_API_KEY=your_actual_gemini_api_key_here
TELEGRAM_BOT_TOKEN=your_actual_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_actual_telegram_chat_id_here

# Tuning & Intervals
POLL_INTERVAL_SECONDS=20
MIN_OPPORTUNITY_SCORE=70
MIN_NOTIFICATION_SCORE=75
```

Save and exit `nano` by pressing:
- `Ctrl + O`, then `Enter` (Save)
- `Ctrl + X` (Exit)

---

### Step 5: Launch the 24/7 Container

Run this single command:

```bash
docker compose up -d --build
```

Docker will:
1. Build the production multi-stage Next.js image.
2. Initialize Prisma SQLite on a persistent Docker volume (`bot_data`).
3. Start the Next.js server on port 3000.
4. Automatically boot the Reddit poller daemon in the background (`src/instrumentation.ts`).

---

### Step 6: Verify Everything is Running

#### Check Container Status:
```bash
docker compose ps
```
*(You will see `reddit_opportunity_bot` with status `Up`)*.

#### Stream Live Scraper & Alert Logs:
```bash
docker compose logs -f
```
You will see output like:
```text
[Reddit Poller] Background poller daemon started (interval: 20s)
[Reddit Poller] Polling 3 active subreddits: r/forhire, r/freelance, r/webdev
[Classifier] Ingested live post: "Need a full-stack Next.js developer..." -> Score: 85 (COMMERCIAL: PAID)
[Telegram] Alert dispatched successfully to chat ID
```
Press `Ctrl + C` to exit logs (the bot keeps running in the background!).

---

### Step 7: Open the Dashboard & Install PWA

Open your browser and navigate to:
```text
http://YOUR_DROPLET_IP:3000
```

1. You will see your dark obsidian dashboard with live leads.
2. If you are on Chrome or mobile, click the **"Install App"** button in the header to install the PWA directly to your home screen or desktop.

---

### Step 8: (Optional) Set Up a Free Domain with SSL / HTTPS (Caddy)

If you want a secure HTTPS URL (e.g. `https://bot.yourdomain.com`) with automated SSL:

1. Point an `A` record of your domain to `YOUR_DROPLET_IP` in Cloudflare / Namecheap / GoDaddy.
2. On your Droplet, install Caddy (super fast reverse proxy):
   ```bash
   apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
   apt update
   apt install -y caddy
   ```
3. Edit `/etc/caddy/Caddyfile`:
   ```bash
   nano /etc/caddy/Caddyfile
   ```
   Add:
   ```caddy
   bot.yourdomain.com {
       reverse_proxy localhost:3000
   }
   ```
4. Restart Caddy:
   ```bash
   systemctl restart caddy
   ```
Caddy will automatically generate free Let's Encrypt SSL certificates and keep your dashboard secured with HTTPS!

---

## Useful Maintenance Commands

| Action | Command |
| :--- | :--- |
| **View real-time logs** | `docker compose logs -f` |
| **Restart the bot** | `docker compose restart` |
| **Stop the bot** | `docker compose down` |
| **Update with new code** | `git pull && docker compose up -d --build` |
| **Check server resources** | `docker stats` |
