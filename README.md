# NBA 2K Players List

A personal web app to browse, filter, and save NBA 2K player ratings — built entirely through **vibe coding** with [Claude Code](https://claude.ai/code) (Anthropic).

## What it does

- Browse all current NBA players with their 2K ratings, attributes, badges, and archetypes
- Filter by position, team, overall rating range, archetype, and individual attributes
- View each player's **potential** rating and **age**
- **Draft Tool** — explore any NBA draft class year with rankings and ratings
- Save a personal watchlist ("La mia lista") that persists in the browser
- Full player detail page with rating history, badge breakdown, and attribute radar

## Data sources

| Source | What it provides | How |
|---|---|---|
| [nba2kapi.com](https://nba2kapi.com) | Player ratings, attributes, badges, archetypes, teams | REST API (requires API key) |
| [2kratings.com](https://www.2kratings.com) | Potential attribute, player birthdate/age, draft class lists | Web scraping via Playwright |

> **Note:** 2kratings.com is an unofficial community site — all credit for the potential ratings and draft data goes to them. This app scrapes their public pages for personal use only and is not affiliated with them.

## Tech stack

- **Next.js 16** (App Router) — frontend + API routes
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Playwright** — headless browser scraping with stealth mode
- Local file-based cache for scraped data (6h TTL for potentials, 24h for draft classes)

## Setup

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   npx playwright install chromium
   ```
3. Create a `.env.local` file with your API key:
   ```
   NBA2K_API_KEY=your_key_here
   ```
   Get a key at [nba2kapi.com](https://nba2kapi.com).

4. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Notes

- The first page load fetches potentials for all visible players in parallel — this can take 20–40 seconds if the cache is cold.
- The scraping cache lives in `/.cache` (excluded from git).
- The app is private (`"private": true`) and intended for personal use.

## Built with

This project was built 100% through **vibe coding** — describing features in natural language to Claude Code (Anthropic) and iterating in conversation. No boilerplate was written by hand.
