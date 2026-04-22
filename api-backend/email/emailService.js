const { buildSmtpTransport } = require('./smtpTransport');
const { renderTemplate } = require('./templateEngine');
const { logger } = require('./logger');

const getFrom = () => {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error('EMAIL_FROM is required (e.g., "AstroAi4u Support <support@astroai4u.com>")');
  }
  return from;
};

const hasSmtpConfig = () => {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};

const sendTemplatedEmail = async ({
  to,
  subject,
  template,
  variables,
  text,
  replyTo,
  headers
}) => {
  if (!hasSmtpConfig()) {
    throw new Error('SMTP is not configured');
  }

  const transporter = buildSmtpTransport();
  const from = getFrom();
  const html = template ? renderTemplate(template, variables || {}) : undefined;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    ...(text ? { text } : {}),
    ...(html ? { html } : {}),
    ...(replyTo ? { replyTo } : {}),
    ...(headers ? { headers } : {})
  });

  logger.info(
    {
      msgId: info.messageId,
      to,
      subject,
      template
    },
    'Email sent'
  );

  return info;
};

module.exports = { sendTemplatedEmail, hasSmtpConfig };
