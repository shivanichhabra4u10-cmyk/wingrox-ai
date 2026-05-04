// Express error handler — converts thrown errors to JSON responses
export function errorHandler(err, req, res, next) {
  // Already responded? bail.
  if (res.headersSent) return next(err);
  
  const status = err.statusCode || err.status || 500;
  const body = { error: err.message || 'Internal server error' };
  
  // Validation details if present
  if (err.details) body.details = err.details;
  
  // Log unexpected errors (5xx) but not user errors (4xx)
  if (status >= 500) {
    console.error('UNHANDLED ERROR:', err);
  }
  
  // Don't leak stack traces in production
  if (process.env.NODE_ENV !== 'production' && status >= 500) {
    body.stack = err.stack;
  }
  
  res.status(status).json(body);
}

// Wrap async route handlers so thrown errors hit errorHandler
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
