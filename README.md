# GOAT LEAGUE PROJECT

Strumento di draft e gestione roster per la nostra lega NBA 2K — costruito con [Claude Code](https://claude.ai/code).

🔗 **[goat-league-project.vercel.app](https://goat-league-project.vercel.app)**

---

## Guida all'uso

### Accesso

Il sito richiede un account. Vai su `/login`, registrati con email e password, e sei dentro. L'accesso rimane attivo finché non premi **Esci**.

---

### Draft Builder

È la pagina principale. Mostra tutti i giocatori NBA 2K ordinati per uno **score composito** che puoi modellare con i quattro slider nella sidebar sinistra.

#### Slider di build

| Slider | Cosa favorisce |
|---|---|
| **REBUILD** | Giocatori giovani con alto potenziale (A+/A/A–). Per costruire sul lungo periodo. |
| **WIN NOW** | Overall alto. Più alto lo slider, più pesa l'OVR attuale. |
| **VALUE HUNT** | Giocatori con attributi specifici sopra la media rispetto al loro OVR — le gemme nascoste. |
| **TEAM FRIENDLY** | Contratti corti e poco costosi. Massimizza la flessibilità salariale. |

> Con tutti gli slider a **0** la lista è ordinata per OVR decrescente — si comporta come un semplice browser di giocatori.

Gli slider si combinano liberamente: puoi mixare più dimensioni con pesi diversi (0–10).

---

#### Filtri

Tutti accessibili dalla sidebar sinistra (su mobile: pulsante ☰ in alto a destra).

| Filtro | Come funziona |
|---|---|
| **Posizione** (PG/SG/SF/PF/C) | Mostra solo i giocatori che giocano in quel ruolo. |
| **Cerca** | Filtra per nome in tempo reale. |
| **OVR minimo** | Esclude i giocatori sotto la soglia selezionata. |
| **Draft Class** | Mostra solo i giocatori di una specifica classe di draft. Selezionabili più anni insieme. |
| **Attributi** | Fino a 4 filtri con valore minimo (es. 3 Punti ≥ 80). I valori appaiono come chip colorati su ogni riga. |

---

#### Cosa mostra ogni riga

- **Score ring** — punteggio composito 0–100 basato sugli slider attivi, con codice colore (giallo = ideale, verde = buona scelta, blu = discreta, grigio = non adatto)
- **OVR** — overall del giocatore con colore per fascia
- **Nome + meta** — squadra, età, potenziale, pick di draft (se filtrato per classe), chip badge (LEG / HOF / GOLD / SLV / BRZ)
- **Contratto** — durata, valore annuo, eventuale opzione (PO/TO/QO) *(solo desktop)*
- **Score breakdown** — barre per ogni dimensione attiva *(solo desktop)*

---

### La mia Rosa

Pulsante in alto a destra. Apre il pannello con i giocatori che hai aggiunto alla tua rosa.

#### Cap Panel

All'interno della rosa trovi il **monitor del salary cap** in tempo reale:

| Soglia | Valore 2026–27 |
|---|---|
| Salary Cap | $141.0M |
| Luxury Tax | $177.0M |
| First Apron | $189.5M |
| Second Apron | $207.5M |

Il pannello mostra anche l'eccezione MLE disponibile (Non-Taxpayer, Taxpayer o Room) in base alla tua situazione salariale.

Ogni modifica alla rosa aggiorna il cap in tempo reale e genera una **notifica toast** quando cambia la tua fascia salariale.

---

### Scheda giocatore

Clicca sull'OVR o sul nome di un giocatore per aprire la scheda completa:

- **Overall + Potenziale** — con storico rating per versione di gioco
- **Info fisiche** — altezza, peso, apertura alare, università, età
- **Contratto** — tabella anno per anno con opzioni evidenziate
- **Attributi** — barre per tutte le categorie (Tiro, Finishing, Playmaking, Difesa, Atletismo)
- **Badge** — contatori grandi per tier (Legend / Hall of Fame / Gold / Silver / Bronze) + lista completa

---

## Stack tecnico

| Tecnologia | Uso |
|---|---|
| Next.js 16 (App Router) | Frontend + API routes serverless |
| React 19 + TypeScript | UI components |
| Tailwind CSS v4 | Design system dark premium |
| Supabase (PostgreSQL) | Database giocatori, contratti, potenziali, draft picks, auth |
| Vercel | Hosting + CDN con cache delle API routes |

### Fonti dati

| Fonte | Dati |
|---|---|
| [nba2kapi.com](https://nba2kapi.com) | Rating, attributi, badge, archetipo |
| [2kratings.com](https://www.2kratings.com) | Potenziale, età, draft class |

---

## Setup per sviluppatori

```bash
git clone https://github.com/abuonom/my-nba-players-list
cd my-nba-players-list
npm install
```

Crea `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

```bash
npm run dev
```

Per popolare la tabella `draft_picks` su un nuovo ambiente Supabase:
1. Esegui `supabase/migrations/create_draft_picks.sql` nell'SQL Editor di Supabase
2. `node scripts/scrape-missing-drafts.mjs` — scarica le draft class mancanti
3. `node scripts/seed-draft.mjs` — inserisce i dati in Supabase

---

## Note

- Dati giocatori e contratti cachati 1 ora sul CDN Vercel — durante una draft session con 30+ utenti simultanei, Supabase riceve una sola query ogni ora per endpoint.
- I dati salvati nella rosa (`localStorage`) sono per-browser e non si sincronizzano tra dispositivi.
- Progetto privato, per uso interno della lega.

---

*Costruito interamente con **vibe coding** — Claude Code (Anthropic).*
