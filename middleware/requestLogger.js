/**
 * middleware/requestLogger.js
 *
 * Structured request/response observability middleware.
 *
 * Responsibilities:
 *   1. Generates a unique Request ID (UUID v4) per request.
 *   2. Attaches it to:        req.id, res.setHeader('X-Request-Id')
 *   3. Logs on REQUEST IN:    method, url, userAgent, ip
 *   4. Logs on RESPONSE OUT:  method, route, status, duration (ms)
 *   5. Flags SLOW REQUESTS:   > SLOW_THRESHOLD_MS with a 'slow' tag
 *   6. Skips noise:           health checks, static assets
 *
 * Log levels:
 *   info  — normal requests (< SLOW_THRESHOLD_MS, status < 400)
 *   warn  — slow requests OR 4xx client errors
 *   error — 5xx server errors
 *
 * Environment variables:
 *   SLOW_THRESHOLD_MS   — Milliseconds before a request is flagged slow (default 500)
 *   LOG_REQUESTS        — Set to "false" to disable request logging entirely
 */

const { randomUUID } = require('crypto');
const logger = require('../utils/logger');

const SLOW_THRESHOLD_MS = parseInt(process.env.SLOW_THRESHOLD_MS || '500', 10);

// Routes to skip (health checks, docs, favicon)
const SKIP_PATTERNS = [
  /^\/api\/v\d+\/health$/,
  /^\/api-docs/,
  /^\/favicon/,
];

function shouldSkip(path) {
  return SKIP_PATTERNS.some((pattern) => pattern.test(path));
}

function requestLogger(req, res, next) {
  // Respect LOG_REQUESTS=false env flag
  if (process.env.LOG_REQUESTS === 'false') return next();

  // ── 1. Assign Request ID ────────────────────────────────────────────────────
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  // ── 2. Skip noisy routes ────────────────────────────────────────────────────
  if (shouldSkip(req.path)) return next();

  const startAt = process.hrtime.bigint();

  // ── 3. Log incoming request ─────────────────────────────────────────────────
  logger.info({
    requestId,
    type:      'request',
    method:    req.method,
    url:       req.originalUrl,
    ip:        req.ip || req.socket?.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId:    req.user?.id ?? null,
  }, `→ ${req.method} ${req.originalUrl}`);

  // ── 4. Hook into response finish ────────────────────────────────────────────
  res.on('finish', () => {
    const durationNs = process.hrtime.bigint() - startAt;
    const durationMs = Number(durationNs / 1_000_000n);
    const isSlow     = durationMs > SLOW_THRESHOLD_MS;
    const status     = res.statusCode;

    const logPayload = {
      requestId,
      type:       'response',
      method:     req.method,
      route:      req.route?.path ?? req.path,
      url:        req.originalUrl,
      status,
      durationMs,
      slow:       isSlow,
      userId:     req.user?.id ?? null,
    };

    const msg = `← ${req.method} ${req.originalUrl} ${status} ${durationMs}ms${isSlow ? ' [SLOW]' : ''}`;

    if (status >= 500)        logger.error(logPayload, msg);
    else if (status >= 400)   logger.warn(logPayload, msg);
    else if (isSlow)          logger.warn(logPayload, msg);
    else                      logger.info(logPayload, msg);
  });

  next();
}

module.exports = requestLogger;
