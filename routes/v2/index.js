/**
 * routes/v2/index.js
 *
 * Placeholder v2 Router.
 *
 * Mounted in app.js at:
 *   app.use('/api/v2', require('./routes/v2'));
 *
 * HOW TO ADD A BREAKING CHANGE:
 *   1. Copy the relevant route file from routes/ into routes/v2/
 *   2. Apply your breaking changes to the copy only
 *   3. Register it below instead of (or alongside) the v1 version
 *   4. If v1 is being sunset, add it to DEPRECATED_VERSIONS in middleware/apiVersion.js
 *
 * Current status: scaffold only — delegates to v1 for all existing endpoints.
 */

const router = require('express').Router();

// ── Health (v2 specific response) ─────────────────────────────────────────
router.get('/health', (req, res) =>
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: 'v2',
      timestamp: new Date().toISOString(),
      note: 'v2 is under active development. Some endpoints delegate to v1.'
    }
  })
);

// ── Example: v2-specific endpoint ─────────────────────────────────────────
// When a v2 route file exists, swap the comment below with the real require:
//
// router.use('/transactions', auth, require('./transactions'));  // ✅ v2 version
//
// Until then, v2 traffic for unimplemented routes returns a clear 501:

router.use((req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: `${req.method} /api/v2${req.path} is not yet available in v2. Use /api/v1${req.path} instead.`
    }
  });
});

module.exports = router;
