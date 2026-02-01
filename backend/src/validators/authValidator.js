/**
 * Authentication Validation Schemas
 */

const Joi = require('joi');

// Login validation
const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(3)
    .max(50)
    .messages({
      'string.empty': 'Username không được để trống',
      'string.min': 'Username phải có ít nhất 3 ký tự',
      'string.max': 'Username không được quá 50 ký tự',
      'any.required': 'Username là bắt buộc',
    }),
  password: Joi.string()
    .required()
    .min(1)
    .messages({
      'string.empty': 'Password không được để trống',
      'any.required': 'Password là bắt buộc',
    }),
});

// Refresh token validation
const refreshTokenSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Token không được để trống',
      'any.required': 'Token là bắt buộc',
    }),
});

module.exports = {
  loginSchema,
  refreshTokenSchema,
};
