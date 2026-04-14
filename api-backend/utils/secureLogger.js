/**
 * Secure Logger Utility
 * Ensures logs only go to server console, never to browser
 * Sanitizes sensitive data automatically
 */

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// Sensitive fields that should be redacted
const SENSITIVE_FIELDS = [
  'password', 'password_hash', 'passwordHash', 'pwd',
  'token', 'authToken', 'jwt', 'bearer', 'authorization',
  'secret', 'apiKey', 'api_key', 'apiSecret', 'api_secret',
  'creditCard', 'credit_card', 'cvv', 'ssn', 'dob',
  'email', 'phone', 'address', 'birth_chart_data'
];

/**
 * Sanitize an object by redacting sensitive fields
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  // Handle objects
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    // Check if key contains any sensitive field name
    const isSensitive = SENSITIVE_FIELDS.some(field => 
      lowerKey.includes(field.toLowerCase())
    );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Format log message with timestamp and level
 */
const formatLog = (level, message, data) => {
  const timestamp = new Date().toISOString();
  const sanitizedData = data ? sanitizeData(data) : undefined;
  
  return {
    timestamp,
    level,
    message,
    ...(sanitizedData && { data: sanitizedData })
  };
};

/**
 * Secure Logger - Server-side only
 * Never sends logs to browser
 */
const secureLogger = {
  /**
   * Debug level logging - only in development
   */
  debug: (message, data) => {
    if (isProduction || isTest) return; // Skip in prod/test
    const log = formatLog('DEBUG', message, data);
    console.log(JSON.stringify(log));
  },

  /**
   * Info level logging
   */
  info: (message, data) => {
    const log = formatLog('INFO', message, data);
    console.log(JSON.stringify(log));
  },

  /**
   * Warning level logging
   */
  warn: (message, data) => {
    const log = formatLog('WARN', message, data);
    console.warn(JSON.stringify(log));
  },

  /**
   * Error level logging
   */
  error: (message, error, data) => {
    const errorData = error ? {
      errorMessage: error.message,
      errorName: error.name,
      ...(isProduction ? {} : { stack: error.stack }) // Only include stack in non-production
    } : undefined;

    const combinedData = { ...data, ...errorData };
    const log = formatLog('ERROR', message, combinedData);
    console.error(JSON.stringify(log));
  },

  /**
   * API Request logging - sanitized
   */
  logRequest: (req, additionalData) => {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      userId: req.user?.userId || 'anonymous',
      ip: req.ip,
      userAgent: req.get('user-agent')?.split(' ')[0], // Just browser name
      ...(additionalData && sanitizeData(additionalData))
    };
    
    secureLogger.info('API Request', logData);
  },

  /**
   * API Response logging - sanitized
   */
  logResponse: (req, res, duration, additionalData) => {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId || 'anonymous',
      ...(additionalData && sanitizeData(additionalData))
    };
    
    if (res.statusCode >= 400) {
      secureLogger.warn('API Response Error', logData);
    } else {
      secureLogger.debug('API Response Success', logData);
    }
  }
};

module.exports = { secureLogger, sanitizeData };
