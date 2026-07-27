const express = require('express');
const { QueueEvents } = require('bullmq');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { createQueue, createConnection, QUEUE_NAME } = require('./queue');
const { PYTHON_IMAGE } = require('./executor');

const app = express();
const queue = createQueue();
const queueEvents = new QueueEvents(QUEUE_NAME, {
  connection: createConnection(),
});
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '200kb' }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'py-runner',
    pythonImage: PYTHON_IMAGE,
  });
});


app.post('/execute', async (req, res) => {
  try {
    const sourceCode = req.body?.source_code ?? req.body?.code;
    const stdin = req.body?.stdin ?? '';
    const wait = Boolean(req.body?.wait);

    if (typeof sourceCode !== 'string' || !sourceCode.trim()) {
      return res.status(400).json({ error: 'source_code is required' });
    }

    if (sourceCode.length > 100_000) {
      return res.status(400).json({ error: 'source_code too large (max 100KB)' });
    }

    if (typeof stdin !== 'string') {
      return res.status(400).json({ error: 'stdin must be a string' });
    }

    const id = uuidv4();
    await db.createSubmission({ id, sourceCode, stdin });
    const job = await queue.add('run', { submissionId: id });

    if (!wait) {
      return res.status(202).json({
        id,
        status: 'queued',
        job_id: job.id,
        poll_url: `/submissions/${id}`,
      });
    }

    const maxWait = Number(process.env.MAX_EXECUTION_MS || 5000) + 10_000;
    await job.waitUntilFinished(queueEvents, maxWait);

    const submission = await db.getSubmission(id);
    return res.json(formatSubmission(submission));
  } catch (err) {
    console.error('POST /execute error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
});

app.get('/submissions/:id', async (req, res) => {
  try {
    const submission = await db.getSubmission(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    return res.json(formatSubmission(submission));
  } catch (err) {
    console.error('GET /submissions/:id error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/submissions', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const rows = await db.listSubmissions(limit);
    return res.json({ submissions: rows });
  } catch (err) {
    console.error('GET /submissions error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

function formatSubmission(row) {
  return {
    id: row.id,
    status: row.status,
    stdout: row.stdout,
    stderr: row.stderr,
    exit_code: row.exit_code,
    time_ms: row.time_ms,
    memory_kb: row.memory_kb,
    error_message: row.error_message,
    created_at: row.created_at,
    started_at: row.started_at,
    finished_at: row.finished_at,
  };
}

async function start() {
  await queueEvents.waitUntilReady();
  app.listen(PORT, () => {
    console.log(`py-runner API listening on :${PORT}`);
  });
}

start().catch((err) => {
  console.error('API failed to start:', err);
  process.exit(1);
});

async function shutdown() {
  await queueEvents.close();
  await queue.close();
  await db.pool.end();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
