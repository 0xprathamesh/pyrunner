const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function query(text, params) {
  return pool.query(text, params);
}

async function createSubmission({ id, sourceCode, stdin }) {
  await query(
    `INSERT INTO submissions (id, source_code, stdin, status)
     VALUES ($1, $2, $3, 'queued')`,
    [id, sourceCode, stdin ?? '']
  );
}

async function getSubmission(id) {
  const result = await query(
    `SELECT id, source_code, stdin, status, stdout, stderr, exit_code,
            time_ms, memory_kb, error_message, created_at, started_at, finished_at
     FROM submissions WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function markRunning(id) {
  await query(
    `UPDATE submissions
     SET status = 'running', started_at = NOW()
     WHERE id = $1`,
    [id]
  );
}

async function markFinished(id, result) {
  await query(
    `UPDATE submissions
     SET status = $2,
         stdout = $3,
         stderr = $4,
         exit_code = $5,
         time_ms = $6,
         memory_kb = $7,
         error_message = $8,
         finished_at = NOW()
     WHERE id = $1`,
    [
      id,
      result.status,
      result.stdout ?? '',
      result.stderr ?? '',
      result.exitCode ?? null,
      result.timeMs ?? null,
      result.memoryKb ?? null,
      result.errorMessage ?? null,
    ]
  );
}

async function listSubmissions(limit = 20) {
  const result = await query(
    `SELECT id, status, exit_code, time_ms, created_at, finished_at
     FROM submissions
     ORDER BY created_at DESC
     LIMIT $1`,
    [Math.min(limit, 100)]
  );
  return result.rows;
}

module.exports = {
  pool,
  createSubmission,
  getSubmission,
  markRunning,
  markFinished,
  listSubmissions,
};
