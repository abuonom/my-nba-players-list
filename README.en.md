# GOAT LEAGUE PROJECT

Draft tool and roster manager for our NBA 2K league — built with [Claude Code](https://claude.ai/code).

🔗 **[goat-league-project.vercel.app](https://goat-league-project.vercel.app)**

---

## User Guide

### Login

The site requires an account. Go to `/login`, sign up with email and password, and you're in. Your session stays active until you press **Esci** (Sign out).

---

### Draft Builder

This is the main page. It shows all NBA 2K players ranked by a **composite score** you shape with the four sliders in the left sidebar.

#### Build Sliders

| Slider | What it favors |
|---|---|
| **REBUILD** | Young players with high potential (A+/A/A–). Best for long-term team building. |
| **WIN NOW** | High overall rating. The higher the slider, the more current OVR matters. |
| **VALUE HUNT** | Players whose specific attributes outperform their OVR — the hidden gems. |
| **TEAM FRIENDLY** | Short, cheap contracts. Maximizes salary flexibility. |

> With all sliders at **0**, the list is sorted by OVR descending — it behaves as a plain player browser.

Sliders can be freely combined: mix multiple dimensions with different weights (0–10).

---

#### Filters

All accessible from the left sidebar (on mobile: the ☰ button in the top right).

| Filter | How it works |
|---|---|
| **Position** (PG/SG/SF/PF/C) | Shows only players who play that position. |
| **Search** | Filters by name in real time. |
| **Min OVR** | Excludes players below the selected threshold. |
| **Draft Class** | Shows only players from a specific draft year. Multiple years can be selected together. |
| **Attributes** | Up to 4 filters with a minimum value (e.g. 3-Point Shot ≥ 80). Values appear as colored chips on each row. |

---

#### What Each Row Shows

- **Score ring** — composite score 0–100 based on active sliders, color-coded (yellow = ideal, green = good pick, blue = decent, grey = not a fit)
- **OVR** — player overall with color by range
- **Name + meta** — team, age, potential, draft pick (if filtering by class), badge chips (LEG / HOF / GOLD / SLV / BRZ)
- **Contract** — duration, annual value, option type if applicable (PO/TO/QO) *(desktop only)*
- **Score breakdown** — bars for each active dimension *(desktop only)*

---

### La mia Rosa (My Roster)

Button in the top right. Opens the panel with the players you have added to your roster.

#### Cap Panel

Inside the roster panel you'll find a **live salary cap monitor**:

| Threshold | 2026–27 Value |
|---|---|
| Salary Cap | $141.0M |
| Luxury Tax | $177.0M |
| First Apron | $189.5M |
| Second Apron | $207.5M |

The panel also shows the available MLE exception (Non-Taxpayer, Taxpayer, or Room) based on your salary situation.

Every roster change updates the cap in real time and fires a **toast notification** whenever your salary tier changes.

---

### Player Page

Click on a player's OVR or name to open their full profile:

- **Overall + Potential** — with rating history per game version
- **Physical info** — height, weight, wingspan, college, age
- **Contract** — year-by-year table with options highlighted
- **Attributes** — bars for all categories (Shooting, Finishing, Playmaking, Defense, Athleticism)
- **Badges** — large counters per tier (Legend / Hall of Fame / Gold / Silver / Bronze) + full list

---

## Tech Stack

| Technology | Use |
|---|---|
| Next.js 16 (App Router) | Frontend + serverless API routes |
| React 19 + TypeScript | UI components |
| Tailwind CSS v4 | Dark premium design system |
| Supabase (PostgreSQL) | Players, contracts, potentials, draft picks, auth |
| Vercel | Hosting + CDN with API route caching |

### Data Sources

| Source | Data |
|---|---|
| [nba2kapi.com](https://nba2kapi.com) | Ratings, attributes, badges, archetypes |
| [2kratings.com](https://www.2kratings.com) | Potential, age, draft class data |

---

## Developer Setup

```bash
git clone https://github.com/abuonom/my-nba-players-list
cd my-nba-players-list
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

```bash
npm run dev
```

To populate the `draft_picks` table on a fresh Supabase environment:
1. Run `supabase/migrations/create_draft_picks.sql` in the Supabase SQL Editor
2. `node scripts/scrape-missing-drafts.mjs` — scrapes missing draft classes locally
3. `node scripts/seed-draft.mjs` — inserts the data into Supabase

---

## Notes

- Player and contract data is cached for 1 hour on the Vercel CDN — during a draft session with 30+ simultaneous users, Supabase receives a single query per hour per endpoint.
- Roster data saved in `localStorage` is per-browser and does not sync across devices.
- Private project, for internal league use only.

---

*Built entirely through **vibe coding** — Claude Code (Anthropic).*
