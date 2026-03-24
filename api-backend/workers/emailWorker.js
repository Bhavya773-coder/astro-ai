require('dotenv').config();

const { Worker } = require('bullmq');
const { getRedisConnection } = require('../email/emailQueue');
const { sendTemplatedEmail } = require('../email/emailService');
const { logger } = require('../email/logger');

const connection = getRedisConnection();

const worker = new Worker(
  'email',
  async (job) => {
    const payload = job.data;
    await sendTemplatedEmail(payload);
    return { ok: true };
  },
  {
    connection,
    concurrency: Number(process.env.EMAIL_WORKER_CONCURRENCY || 5)
  }
);

worker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Email job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err: err?.message }, 'Email job failed');
});

logger.info('Email worker started');
