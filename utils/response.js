function sendSuccess(res, data, message = 'Success', statusCode = 200, meta = null) {
  const payload = { success: true, data, message };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

function sendError(res, message, statusCode = 500, code = 'SERVER_ERROR') {
  return res.status(statusCode).json({ success: false, error: { code, message } });
}

module.exports = {
  sendSuccess,
  sendError
};
