/**
 * Rate Limiter Middleware
 * Bảo vệ API khỏi brute force và DDoS attacks
 * 
 * NOTE: Rate limiting đã được DISABLE để testing
 * Uncomment các config bên dưới khi deploy production
 */

const rateLimit = require('express-rate-limit');

/**
 * DISABLED FOR TESTING - Set max: 0 to disable rate limiting
 * Khi deploy production, đổi max về giá trị cũ
 */

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 0, // DISABLED - Original: 100
  // max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    status: 'ERROR',
    code: 'TOO_MANY_REQUESTS',
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Auth Rate Limiter (Stricter)
 * 5 login attempts per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 0, // DISABLED - Original: 5
  // max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    status: 'ERROR',
    code: 'TOO_MANY_LOGIN_ATTEMPTS',
    message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Upload Rate Limiter
 * 10 uploads per 15 minutes
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 0, // DISABLED - Original: 10
  // max: 10, // Limit each IP to 10 upload requests per windowMs
  message: {
    success: false,
    status: 'ERROR',
    code: 'TOO_MANY_UPLOADS',
    message: 'Quá nhiều file upload, vui lòng thử lại sau.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict Rate Limiter for sensitive operations
 * 3 requests per 5 minutes
 */
const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 0, // DISABLED - Original: 3
  // max: 3,
  message: {
    success: false,
    status: 'ERROR',
    code: 'TOO_MANY_REQUESTS',
    message: 'Quá nhiều yêu cầu cho thao tác này, vui lòng thử lại sau.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  strictLimiter,
};
