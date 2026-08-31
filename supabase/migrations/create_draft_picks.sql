-- Tabella per i dati delle draft class (2021-2025)
-- Sostituisce il file cache locale + scraping Playwright, incompatibile con Vercel

CREATE TABLE IF NOT EXISTS draft_picks (
  draft_year  integer  NOT NULL,
  slug        text     NOT NULL,
  rank        integer  NOT NULL,
  pick        text     NOT NULL,
  name        text     NOT NULL,
  positions   text[]   NOT NULL DEFAULT '{}',
  height      text     NOT NULL DEFAULT '',
  team_abbr   text     NOT NULL DEFAULT '',
  overall     integer  NOT NULL DEFAULT 0,
  PRIMARY KEY (draft_year, slug)
);

CREATE INDEX IF NOT EXISTS draft_picks_year_idx ON draft_picks (draft_year);

-- RLS: lettura pubblica, scrittura solo service role
ALTER TABLE draft_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "draft_picks: lettura pubblica"
  ON draft_picks FOR SELECT USING (true);
