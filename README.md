# СТО "Поршень" (Львів, Україна)

Business website for an automotive car repair service in Lviv, Ukraine.

## Prerequisites

- Node.js 24+
- Yarn 4.18.1

## Quick Start

```bash
# Install
yarn install

# Start
yarn dev

# Cloudflare Pages with Functions
yarn dev:cf
```

## Structure

Copy `.env.example` to `.env` and fill Required values:

- `SITE_URL` - canonical public site URL
- `TELEGRAM_BOT_TOKEN` - Telegram bot token
- `TELEGRAM_CHAT_ID` - destination Telegram chat ID
- `TURNSTILE_SECRET_KEY` - server-side Turnstile secret
- `PUBLIC_TURNSTILE_SITE_KEY` - public Turnstile site key

```text
├── functions/                 # Cloudflare Pages Functions
│   ├── api/booking.ts         # Booking form and Telegram notification
├── public/                    # Static files
├── src/
│   ├── components/            # Reusable Astro components and SCSS
│   ├── content/               # CMS JSON content
│   ├── data/                  # Site data
│   ├── pages/                 # Astro routes
│   ├── scripts/               # TypeScript modules
│   └── styles/                # Global SCSS
├── .env.example               # Environment variable template
├── .pages.yml                 # Pages CMS config
├── astro.config.mjs           # Astro and Vite config
├── package.json               # Scripts and dependencies
└── yarn.lock                  # Locked dependency versions
```