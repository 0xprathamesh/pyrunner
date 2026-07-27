CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY,
  source_code TEXT NOT NULL,
  stdin TEXT NOT NULL DEFAULT '',
  status VARCHAR(32) NOT NULL DEFAULT 'queued',
  stdout TEXT NOT NULL DEFAULT '',
  stderr TEXT NOT NULL DEFAULT '',
  exit_code INTEGER,
  time_ms INTEGER,
  memory_kb INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (status);
