/**
 * Validation Middleware Factory
 * Wrapper để dùng Joi schemas trong Express middleware
 */

/**
 * Validate request body
 * @param {Joi.Schema|Object} schema - Joi validation schema hoặc object có property body
 * @returns {Function} Express middleware
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    // Handle case where schema is wrapped in object with 'body' property
    const joiSchema = schema.body || schema;

    const { error, value } = joiSchema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(422).json({
        success: false,
        status: "ERROR",
        code: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        errors,
        timestamp: new Date().toISOString(),
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

/**
 * Validate request query parameters
 * @param {Joi.Schema|Object} schema - Joi validation schema hoặc object có property query
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    // Handle case where schema is wrapped in object with 'query' property
    const joiSchema = schema.query || schema;

    const { error, value } = joiSchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(422).json({
        success: false,
        status: "ERROR",
        code: "VALIDATION_ERROR",
        message: "Query parameters không hợp lệ",
        errors,
        timestamp: new Date().toISOString(),
      });
    }

    req.query = value;
    next();
  };
};

/**
 * Validate request params
 * @param {Joi.Schema|Object} schema - Joi validation schema hoặc object có property params
 * @returns {Function} Express middleware
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    // Handle case where schema is wrapped in object with 'params' property
    const joiSchema = schema.params || schema;

    const { error, value } = joiSchema.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(422).json({
        success: false,
        status: "ERROR",
        code: "VALIDATION_ERROR",
        message: "URL parameters không hợp lệ",
        errors,
        timestamp: new Date().toISOString(),
      });
    }

    req.params = value;
    next();
  };
};

// Export validateBody as default for backwards compatibility
// This allows: const validate = require('./validate'); validate(schema);
// And also: const { validateBody } = require('./validate');
module.exports = validateBody;
module.exports.validateBody = validateBody;
module.exports.validateQuery = validateQuery;
module.exports.validateParams = validateParams;
