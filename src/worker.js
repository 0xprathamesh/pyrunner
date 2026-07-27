const db = require('./db');
const { createWorker } = require('./queue');
const { executePython, ensurePythonImage, PYTHON_IMAGE } = require('./executor');

async function processJob(job) {
  const { submissionId } = job.data;
  if (!submissionId) {
    throw new Error('Missing submissionId');
  }

  const submission = await db.getSubmission(submissionId);
  if (!submission) {
    throw new Error(`Submission ${submissionId} not found`);
  }

  await db.markRunning(submissionId);

  const result = await executePython({
    sourceCode: submission.source_code,
    stdin: submission.stdin || '',
  });

  await db.markFinished(submissionId, result);
  return {
    submissionId,
    status: result.status,
    exitCode: result.exitCode,
    timeMs: result.timeMs,
  };
}

async function main() {
  const hasImage = await ensurePythonImage();
  if (!hasImage) {
    console.warn(
      `Warning: image "${PYTHON_IMAGE}" not found locally. ` +
        `Run: docker pull ${PYTHON_IMAGE}`
    );
  } else {
    console.log(`Python runtime ready: ${PYTHON_IMAGE}`);
  }

  const worker = createWorker(processJob);

  worker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed:`, result?.status);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  console.log('py-runner worker started');

  const shutdown = async () => {
    await worker.close();
    await db.pool.end();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
