const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['req.headers.authorization', 'SMTP_PASS', 'process.env.SMTP_PASS'],
    remove: true
  }
});

module.exports = { logger };
