const { AppError } = require('../utils/AppError');

/**
 * Global error handler: maps known errors to HTTP status codes and JSON bodies.
 * Register last in the Express app, after routes and 404 handler.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Malformed JSON body (express.json / body-parser)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  if (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400)) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid identifier or value' });
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({ error: 'Validation failed', details });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(409).json({ error: 'Duplicate value', ...(field ? { field } : {}) });
  }

  // MongoDB driver / transient DB issues
  if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
    return res.status(503).json({ error: 'Database temporarily unavailable' });
  }

  const status = err.status || err.statusCode;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return res.status(status).json({ error: err.message || 'Request failed' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler };
