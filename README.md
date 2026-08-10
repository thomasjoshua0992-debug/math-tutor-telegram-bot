# Math tutor Telegram bot

A Telegram bot that solves math problems and shows its work — arithmetic,
linear equations, quadratic equations, and derivatives. All solving happens
locally with the `mathjs` library; there's no external AI API involved.

## Setup

1. **Get a bot token.** In Telegram, message [@BotFather](https://t.me/BotFather),
   send `/newbot`, and follow the prompts. It will give you a token like
   `123456789:ABCdefGhIJKlmNoPQRstuVwxyz`.

2. **Install dependencies.**
   ```
   npm install
   ```

3. **Add your token.** Copy `.env.example` to `.env` and paste in your token:
   ```
   cp .env.example .env
   ```
   Then edit `.env` so it reads:
   ```
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRstuVwxyz
   ```

4. **Run it.**
   ```
   npm start
   ```
   You should see `Math tutor bot is running (polling)...`. Now open your bot
   in Telegram and send it a problem.

## What it understands

- Arithmetic: `12 + 5 * (3 - 1)`
- Linear equations: `3x + 5 = 2x - 7`
- Quadratic equations: `x^2 - 5x + 6 = 0`
- Derivatives: `derivative of 3x^3 - 2x + 1` or `d/dx x^2 + 4x`

Equations must use `x` as the variable. Use `^` for exponents and `*` for
multiplication.

## Files

- `bot.js` — Telegram wiring: receives messages, calls the solver, replies.
- `solver.js` — the actual math logic (equation solving, derivatives, and a
  step-by-step arithmetic tracer that walks the expression's parse tree).
- `.env.example` — copy to `.env` and fill in your bot token.

## Deploying so it runs continuously

Running `npm start` on your own machine only works while that terminal is
open. Deploying to Railway keeps it running all the time.

### 1. Push this project to GitHub

Create a new, empty repository on GitHub, then upload everything in this
folder to it (drag-and-drop through the GitHub website, or `git push` from
a terminal — either works). `.gitignore` already keeps `node_modules/` and
`.env` out of the repo, so don't worry about those.

### 2. Create a Railway project from that repo

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo** → pick this repo.
3. Railway detects it's a Node project (via `package.json`) and starts a
   build automatically using the settings in `railway.json`.

### 3. Add your bot token as an environment variable

In the Railway project, open the service → **Variables** tab → **New
Variable**:
- Name: `TELEGRAM_BOT_TOKEN`
- Value: the token from BotFather

Railway restarts the service automatically once the variable is saved.

### 4. Confirm it's running

Open the **Deployments** tab and check the logs — you should see
`Math tutor bot is running (polling)...`. Message your bot on Telegram to
confirm. `railway.json` sets it to auto-restart if it ever crashes.
