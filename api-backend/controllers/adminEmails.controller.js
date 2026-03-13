const { enqueueEmail, isQueueEnabled } = require('../email/emailQueue');
const { sendTemplatedEmail } = require('../email/emailService');

const sendEmail = async (req, res, next) => {
  const { to, subject, template, variables, text, replyTo } = req.body;

  if (!to || !subject) {
    res.status(400);
    return next(new Error('to and subject are required'));
  }

  const payload = { to, subject, template, variables, text, replyTo };

  if (isQueueEnabled()) {
    const job = await enqueueEmail(payload);
    return res.status(202).json({ ok: true, jobId: job.id });
  }

  await sendTemplatedEmail(payload);
  return res.status(200).json({ ok: true });
};

const sendBulkEmail = async (req, res, next) => {
  const { toList, subject, template, variables, text, replyTo } = req.body;

  if (!Array.isArray(toList) || toList.length === 0) {
    res.status(400);
    return next(new Error('toList must be a non-empty array'));
  }
  if (!subject) {
    res.status(400);
    return next(new Error('subject is required'));
  }

  const max = Number(process.env.BULK_EMAIL_MAX_RECIPIENTS || 2000);
  if (toList.length > max) {
    res.status(400);
    return next(new Error(`toList exceeds max recipients (${max})`));
  }

  if (isQueueEnabled()) {
    const jobs = await Promise.all(
      toList.map((to) =>
        enqueueEmail({
          to,
          subject,
          template,
          variables,
          text,
          replyTo
        })
      )
    );

    return res.status(202).json({ ok: true, enqueued: jobs.length, jobIds: jobs.map((j) => j.id) });
  }

  for (const to of toList) {
    await sendTemplatedEmail({ to, subject, template, variables, text, replyTo });
  }

  return res.status(200).json({ ok: true, sent: toList.length });
};

module.exports = { sendEmail, sendBulkEmail };
