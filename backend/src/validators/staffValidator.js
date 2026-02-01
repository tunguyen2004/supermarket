/**
 * Staff Management Validation Schemas
 */

const Joi = require('joi');

// Add staff validation
const addStaffSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .messages({
      'string.empty': 'Username không được để trống',
      'string.min': 'Username phải có ít nhất 3 ký tự',
      'string.max': 'Username không được quá 50 ký tự',
      'string.pattern.base': 'Username chỉ được chứa chữ cái, số và dấu gạch dưới',
      'any.required': 'Username là bắt buộc',
    }),
  email: Joi.string()
    .required()
    .email()
    .messages({
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc',
    }),
  full_name: Joi.string()
    .required()
    .min(2)
    .max(100)
    .messages({
      'string.empty': 'Họ tên không được để trống',
      'string.min': 'Họ tên phải có ít nhất 2 ký tự',
      'string.max': 'Họ tên không được quá 100 ký tự',
      'any.required': 'Họ tên là bắt buộc',
    }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số',
    }),
  password: Joi.string()
    .required()
    .min(6)
    .messages({
      'string.empty': 'Mật khẩu không được để trống',
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu là bắt buộc',
    }),
  role_id: Joi.number()
    .integer()
    .valid(1, 2, 3)
    .default(2)
    .messages({
      'number.base': 'Role ID phải là số',
      'any.only': 'Role ID phải là 1, 2 hoặc 3',
    }),
});

// Update staff validation
const updateStaffSchema = Joi.object({
  full_name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Họ tên phải có ít nhất 2 ký tự',
      'string.max': 'Họ tên không được quá 100 ký tự',
    }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số',
    }),
  is_active: Joi.boolean(),
}).min(1).messages({
  'object.min': 'Phải cung cấp ít nhất một trường để cập nhật',
});

// Update staff role validation
const updateRoleSchema = Joi.object({
  role_id: Joi.number()
    .integer()
    .valid(1, 2, 3)
    .required()
    .messages({
      'number.base': 'Role ID phải là số',
      'any.only': 'Role ID phải là 1 (Admin), 2 (Staff) hoặc 3 (Manager)',
      'any.required': 'Role ID là bắt buộc',
    }),
});

// Common ID parameter validation
const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID phải là số',
      'number.positive': 'ID phải là số dương',
      'any.required': 'ID là bắt buộc',
    }),
});

// List query validation
const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(''),
  is_active: Joi.boolean(),
  role_id: Joi.number().integer().valid(1, 2, 3),
});

module.exports = {
  addStaffSchema,
  updateStaffSchema,
  updateRoleSchema,
  idParamSchema,
  listQuerySchema,
};
