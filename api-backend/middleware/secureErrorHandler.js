/**
 * Secure Error Handler Middleware
 * Prevents sensitive data from being exposed in error responses
 */

const { secureLogger } = require('../utils/secureLogger');

/**
 * List of error messages that might contain sensitive data
 * These will be replaced with generic messages in production
 */
const SENSITIVE_ERROR_PATTERNS = [
  /password/i,
  /token/i,
  /jwt/i,
  /auth/i,
  /credential/i,
  /secret/i,
  /invalid.*id/i,
  /cast.*error/i,
  /mongodb/i,
  /mongoose/i,
  /validation.*failed/i
];

/**
 * Sanitize error message for client
 */
const sanitizeErrorMessage = (message, isProduction) => {
  if (!isProduction) return message; // In dev, show full message
  
  // Check if message contains sensitive patterns
  const hasSensitiveInfo = SENSITIVE_ERROR_PATTERNS.some(pattern => 
    pattern.test(message)
  );
  
  if (hasSensitiveInfo) {
    return 'An error occurred while processing your request';
  }
  
  return message;
};

/**
 * Secure Error Handler
 */
const secureErrorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Determine status code
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'CastError') {
    statusCode = 400;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
  }
  
  // Log the full error securely (server-side only)
  secureLogger.error('Request error', err, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.userId,
    statusCode,
    ip: req.ip
  });
  
  // Prepare safe error response for client
  const safeMessage = sanitizeErrorMessage(err.message, isProduction);
  
  // Build response
  const errorResponse = {
    success: false,
    message: safeMessage
  };
  
  // Only include error code in production (not the full error object)
  if (isProduction) {
    errorResponse.errorCode = `ERR_${statusCode}`;
  } else {
    // In development, include more details (but still sanitized)
    errorResponse.debug = {
      message: err.message,
      name: err.name,
      ...(err.stack && { stack: err.stack.split('\n')[0] }) // First line only
    };
  }
  
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 */
const secureNotFound = (req, res) => {
  secureLogger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
};

module.exports = { secureErrorHandler, secureNotFound };
