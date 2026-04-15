/**
 * API Versioning Middleware
 *
 * Detects the requested API version from:
 *   1. URL path     — /api/v2/...   (primary, auto-parsed by Express mount)
 *   2. Header       — X-API-Version: 2
 *
 * Sets res.locals.apiVersion so any downstream handler can branch on it.
 *
 * For deprecated versions it injects the response header:
 *   X-API-Deprecated: true
 *   X-API-Sunset:     <ISO date>
 *
 * Usage (in app.js):
 *   app.use('/api', apiVersion());
 */

const DEPRECATED_VERSIONS = {
  // Mark a version as deprecated by adding it here:
  // 1: { sunset: '2026-12-31' }
};

/**
 * Parse an integer version from the URL segment (e.g. "/v2/..." → 2).
 * Returns null if no version segment is found.
 */
function parseVersionFromUrl(path) {
  const match = path.match(/^\/v(\d+)(\/|$)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Returns the configured Express middleware.
 */
function apiVersion() {
  return function versionMiddleware(req, res, next) {
    // 1. Try URL segment first
    let version = parseVersionFromUrl(req.path);

    // 2. Fall back to X-API-Version header
    if (!version && req.headers['x-api-version']) {
      const parsed = parseInt(req.headers['x-api-version'], 10);
      if (!isNaN(parsed)) version = parsed;
    }

    // 3. Default to v1 if nothing found
    version = version || 1;

    // Attach to response locals for downstream use
    res.locals.apiVersion = version;

    // Always stamp the current version on responses
    res.setHeader('X-API-Version', `v${version}`);

    // Inject deprecation headers if this version is scheduled for removal
    if (DEPRECATED_VERSIONS[version]) {
      res.setHeader('X-API-Deprecated', 'true');
      if (DEPRECATED_VERSIONS[version].sunset) {
        res.setHeader('X-API-Sunset', DEPRECATED_VERSIONS[version].sunset);
      }
    }

    next();
  };
}

module.exports = apiVersion;
