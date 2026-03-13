const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const getRedisConnection = () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('REDIS_URL is required for email queue');
  }
  return new IORedis(url, { maxRetriesPerRequest: null });
};

let emailQueue;

const isQueueEnabled = () => {
  return Boolean(process.env.REDIS_URL);
};

const getEmailQueue = () => {
  if (emailQueue) return emailQueue;

  const connection = getRedisConnection();
  emailQueue = new Queue('email', {
    connection,
    defaultJobOptions: {
      attempts: Number(process.env.EMAIL_RETRY_ATTEMPTS || 5),
      backoff: { type: 'exponential', delay: Number(process.env.EMAIL_RETRY_DELAY_MS || 5000) },
      removeOnComplete: 1000,
      removeOnFail: 5000
    },
    limiter: {
      max: Number(process.env.EMAIL_RATE_LIMIT_MAX || 50),
      duration: Number(process.env.EMAIL_RATE_LIMIT_DURATION_MS || 60000)
    }
  });

  return emailQueue;
};

const enqueueEmail = async ({
  to,
  subject,
  template,
  variables,
  text,
  replyTo,
  headers
}) => {
  const queue = getEmailQueue();
  return queue.add('send', {
    to,
    subject,
    template,
    variables,
    text,
    replyTo,
    headers
  });
};

module.exports = { enqueueEmail, getRedisConnection, isQueueEnabled, getEmailQueue };
