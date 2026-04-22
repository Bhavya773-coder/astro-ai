---
description: Production-ready email automation setup for AstroAi4u (SMTP + SPF/DKIM/DMARC + VPS + Queue)
---

# AstroAi4u Email Automation System (Production Setup)

## 1) Overview
This backend sends emails from a professional domain mailbox (example: `support@astroai4u.com`) using **SMTP + Nodemailer**.
It supports:
- HTML templates with `{{variables}}` (Handlebars)
- Bulk sending
- Queue + retries (BullMQ)
- Rate limiting (BullMQ queue limiter)

## 2) DNS authentication (SPF / DKIM / DMARC)
You must configure these records in your domain DNS to avoid spam and improve deliverability.

### SPF
Add/merge an SPF TXT record for your provider.
Examples:
- Zoho: `v=spf1 include:zoho.com ~all`
- Google Workspace: `v=spf1 include:_spf.google.com ~all`
- Microsoft 365: `v=spf1 include:spf.protection.outlook.com ~all`

Only **one** SPF TXT record should exist per domain. Merge includes if needed.

### DKIM
Enable DKIM in your mail provider admin panel (Zoho/Google/Microsoft). It will give you a DNS TXT/CNAME record.
Add it exactly as provided.

### DMARC
Add a DMARC record (start permissive, then tighten):

Name/Host:
- `_dmarc`

Value example:
- `v=DMARC1; p=none; rua=mailto:dmarc@astroai4u.com; ruf=mailto:dmarc@astroai4u.com; fo=1; adkim=s; aspf=s;`

When stable, move to `p=quarantine` then `p=reject`.

## 3) SMTP configuration
Pick one provider (Zoho / Google Workspace / Microsoft 365 / custom SMTP).

Set these env vars on your server:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

## 4) Redis (Queue system)
BullMQ requires Redis.

### VPS (Ubuntu) install
Install Redis:
- `sudo apt-get update`
- `sudo apt-get install -y redis-server`

Ensure it’s running:
- `sudo systemctl enable redis-server`
- `sudo systemctl start redis-server`

Set env:
- `REDIS_URL=redis://127.0.0.1:6379`

## 5) Deployment on VPS
### Recommended process manager
Use `pm2` or systemd.

You will run **two processes**:
- API server: `node server.js`
- Email worker: `node workers/emailWorker.js`

Example with pm2:
- `pm2 start server.js --name astroai4u-api`
- `pm2 start workers/emailWorker.js --name astroai4u-email-worker`

## 6) Templates
Templates are stored in:
- `api-backend/email/templates/*.hbs`

Variables are passed as an object:
- `{{username}}`, `{{plan}}`, `{{date}}`, etc.

## 7) Admin API
Admin-only endpoints:
- `POST /api/admin/emails/send`
- `POST /api/admin/emails/bulk`

These enqueue emails; the worker sends them.

## 8) Password reset flow
Password reset uses:
- `password_reset.hbs`
- `FRONTEND_BASE_URL` and token query param

## 9) Deliverability tips
- Use a dedicated sending mailbox (e.g., `support@astroai4u.com`).
- Warm up sending volume gradually.
- Keep rate limits conservative (`EMAIL_RATE_LIMIT_*`).
- Ensure SPF/DKIM/DMARC are correct.
