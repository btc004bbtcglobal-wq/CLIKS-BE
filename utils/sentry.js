/**
 * utils/sentry.js
 *
 * Centralised Sentry initialisation.
 *
 * Usage:
 *   Call initSentry() ONCE at the very top of app.js / index.js.
 *   Import getCaptureException() anywhere you need to manually report an error.
 *
 * Environment variables:
 *   SENTRY_DSN          — Your Sentry project DSN. Leave blank to disable.
 *   SENTRY_ENVIRONMENT  — e.g. "production" | "staging" | "development"
 *   SENTRY_TRACES_RATE  — Float 0-1. Fraction of transactions to trace (default 0.1)
 *
 * If SENTRY_DSN is not set the module silently no-ops so dev/test environments
 * are never affected.
 */

let Sentry = null;
let initialised = false;

function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    // No DSN configured — skip silently
    return;
  }

  try {
    Sentry = require('@sentry/node');

    Sentry.init({
      dsn,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_RATE || '0.1'),
      // Ignore common noise
      ignoreErrors: [
        'TokenExpiredError',
        'JsonWebTokenError',
        'UnauthorizedError',
      ],
    });

    initialised = true;
    const logger = require('./logger');
    logger.info('[Sentry] Initialised — environment: %s', Sentry.getCurrentScope().getScopeData().extra?.environment || process.env.NODE_ENV);
  } catch (err) {
    const logger = require('./logger');
    logger.warn('[Sentry] Failed to initialise: %s', err.message);
  }
}

/**
 * Manually capture an exception to Sentry.
 * Safe to call even when Sentry is not configured — it will no-op.
 *
 * @param {Error}  err
 * @param {object} [extras]   Additional key/value context
 */
function captureException(err, extras = {}) {
  if (!initialised || !Sentry) return;
  Sentry.withScope((scope) => {
    Object.entries(extras).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(err);
  });
}

/**
 * Returns the raw Sentry instance (or null).
 * Useful for adding breadcrumbs / user context.
 */
function getSentry() {
  return Sentry;
}

module.exports = { initSentry, captureException, getSentry };
