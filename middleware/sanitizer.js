/**
 * middleware/sanitizer.js
 * 
 * Basic input sanitization middleware:
 * - Trims all string values in req.body, req.query, and req.params
 */

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].trim();
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  });
  return obj;
};

const sanitizer = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

module.exports = sanitizer;
