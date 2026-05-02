/**
 * Centralised error handler — must be registered LAST in app.js.
 *
 * Normalises all thrown errors into a consistent JSON shape:
 *   { success: false, message: "...", errors?: [...] }
 *
 * Keeps stack traces out of production responses.
 */
module.exports = function errorHandler(err, req, res, next) {
  // Already-sent headers — let Express handle teardown
  if (res.headersSent) return next(err);

  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already in use`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for field '${err.path}'`;
  }

  // JWT errors — in case they bubble up unexpectedly
  if (err.name === 'JsonWebTokenError') { status = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { status = 401; message = 'Token expired'; }

  const body = { success: false, message };
  if (errors) body.errors = errors;

  // Never leak stack in production
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    body.stack = err.stack;
  }

  console.error(`[${new Date().toISOString()}] ${status} ${req.method} ${req.path} — ${message}`);

  res.status(status).json(body);
};
