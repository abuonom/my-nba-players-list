# NBA 2K Players List

A personal web app to browse, filter, and save NBA 2K player ratings — built entirely through **vibe coding** with [Claude Code](https://claude.ai/code) (Anthropic).

---

## 🇮🇹 Guida rapida (per chi non è tecnico)

### Cosa ti serve prima di iniziare

1. **Node.js** — il motore che fa girare l'app. Se non ce l'hai:
   - Vai su [nodejs.org](https://nodejs.org)
   - Clicca il bottone verde **"LTS"** e scarica il file
   - Installalo come un normale programma (avanti, avanti, fine)

2. **Una chiave API** per i dati NBA 2K:
   - Vai su [nba2kapi.com](https://nba2kapi.com) e registrati
   - Una volta ottenuta la chiave, tienila da parte

3. **Il codice dell'app** — scaricalo come ZIP da GitHub (bottone verde "Code" → "Download ZIP"), poi estrailo in una cartella.

---

### Come avviare l'app (primo avvio)

**Passo 1 — Prima configurazione (solo la prima volta)**

Apri la cartella del progetto, fai doppio clic su **`setup.bat`** e segui le istruzioni a schermo. Lo script installa tutto automaticamente.

**Passo 2 — Crea il file con la chiave API**

Nella cartella del progetto, crea un file di testo chiamato **`.env.local`** (attenzione: il nome inizia con un punto). Scrivi dentro:

```
NBA2K_API_KEY=incolla_qui_la_tua_chiave
```

> **Come creare il file:** apri il Blocco Note, scrivi la riga qui sopra con la tua chiave, poi vai su *File → Salva con nome*, scegli "Tutti i file" nel menu a tendina del tipo, e salva come `.env.local` nella cartella del progetto.

**Passo 3 — Avvia l'app**

Fai doppio clic su **`avvia.bat`**. Quando vedi scritto `Ready in ...`, apri il browser e vai su:

👉 **[http://localhost:3000](http://localhost:3000)**

**Per i prossimi avvii:** basta fare doppio clic su `avvia.bat` ogni volta.

---

### Domande frequenti

**L'app è lenta al primo caricamento** — normale. La prima volta scarica i dati per tutti i giocatori, può volerci 20–40 secondi.

**Come fermo l'app?** — Chiudi la finestra nera (il terminale) oppure premi `CTRL+C` al suo interno.

**Dove vengono salvati i dati?** — Sul tuo computer, nella cartella `.cache` dentro il progetto. Niente viene inviato online.

---

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

## Setup (for developers)

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
