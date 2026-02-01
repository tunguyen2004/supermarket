/**
 * Middleware index - Export all middleware
 */

const { verifyToken } = require('./auth');
const { authorize } = require('./authorize');
const validate = require('./validate');
const upload = require('./upload');
const rateLimiter = require('./rateLimiter');

// Export với alias để tương thích với routes
module.exports = {
  authenticate: verifyToken,
  verifyToken,
  authorize,
  validate, // validateBody as default
  validateBody: validate,
  validateQuery: validate.validateQuery,
  validateParams: validate.validateParams,
  upload,
  rateLimiter
};
