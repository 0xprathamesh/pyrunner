const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const QUEUE_NAME = 'python-execution';

function createConnection() {
  return new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });
}

function createQueue() {
  return new Queue(QUEUE_NAME, {
    connection: createConnection(),
    defaultJobOptions: {
      removeOnComplete: 1000,
      removeOnFail: 1000,
      attempts: 1,
    },
  });
}

function createWorker(processor) {
  return new Worker(QUEUE_NAME, processor, {
    connection: createConnection(),
    concurrency: Number(process.env.WORKER_CONCURRENCY || 2),
  });
}

module.exports = {
  QUEUE_NAME,
  createQueue,
  createWorker,
  createConnection,
};
