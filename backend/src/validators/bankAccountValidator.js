/**
 * Bank Account Validator
 * @module validators/bankAccountValidator
 */

const Joi = require('joi');

// Schema tạo tài khoản ngân hàng
const createSchema = Joi.object({
  account_name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Tên chủ tài khoản không được để trống',
      'string.min': 'Tên chủ tài khoản tối thiểu 2 ký tự',
      'string.max': 'Tên chủ tài khoản tối đa 100 ký tự',
      'any.required': 'Tên chủ tài khoản là bắt buộc'
    }),

  account_number: Joi.string()
    .min(6)
    .max(50)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.empty': 'Số tài khoản không được để trống',
      'string.min': 'Số tài khoản tối thiểu 6 ký tự',
      'string.max': 'Số tài khoản tối đa 50 ký tự',
      'string.pattern.base': 'Số tài khoản chỉ được chứa số',
      'any.required': 'Số tài khoản là bắt buộc'
    }),

  bank_name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Tên ngân hàng không được để trống',
      'string.min': 'Tên ngân hàng tối thiểu 2 ký tự',
      'string.max': 'Tên ngân hàng tối đa 100 ký tự',
      'any.required': 'Tên ngân hàng là bắt buộc'
    }),

  bank_code: Joi.string()
    .min(2)
    .max(20)
    .uppercase()
    .required()
    .messages({
      'string.empty': 'Mã ngân hàng không được để trống',
      'string.min': 'Mã ngân hàng tối thiểu 2 ký tự',
      'string.max': 'Mã ngân hàng tối đa 20 ký tự',
      'any.required': 'Mã ngân hàng là bắt buộc'
    }),

  branch: Joi.string()
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'Tên chi nhánh tối đa 100 ký tự'
    }),

  store_id: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'ID cửa hàng phải là số',
      'number.integer': 'ID cửa hàng phải là số nguyên',
      'number.positive': 'ID cửa hàng phải là số dương'
    }),

  is_default: Joi.boolean()
    .default(false),

  notes: Joi.string()
    .max(500)
    .allow(null, '')
    .messages({
      'string.max': 'Ghi chú tối đa 500 ký tự'
    })
});

// Schema cập nhật tài khoản ngân hàng
const updateSchema = Joi.object({
  account_name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Tên chủ tài khoản tối thiểu 2 ký tự',
      'string.max': 'Tên chủ tài khoản tối đa 100 ký tự'
    }),

  account_number: Joi.string()
    .min(6)
    .max(50)
    .pattern(/^[0-9]+$/)
    .messages({
      'string.min': 'Số tài khoản tối thiểu 6 ký tự',
      'string.max': 'Số tài khoản tối đa 50 ký tự',
      'string.pattern.base': 'Số tài khoản chỉ được chứa số'
    }),

  bank_name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Tên ngân hàng tối thiểu 2 ký tự',
      'string.max': 'Tên ngân hàng tối đa 100 ký tự'
    }),

  bank_code: Joi.string()
    .min(2)
    .max(20)
    .uppercase()
    .messages({
      'string.min': 'Mã ngân hàng tối thiểu 2 ký tự',
      'string.max': 'Mã ngân hàng tối đa 20 ký tự'
    }),

  branch: Joi.string()
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'Tên chi nhánh tối đa 100 ký tự'
    }),

  store_id: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'ID cửa hàng phải là số',
      'number.integer': 'ID cửa hàng phải là số nguyên',
      'number.positive': 'ID cửa hàng phải là số dương'
    }),

  is_default: Joi.boolean(),

  is_active: Joi.boolean(),

  notes: Joi.string()
    .max(500)
    .allow(null, '')
    .messages({
      'string.max': 'Ghi chú tối đa 500 ký tự'
    })
}).min(1).messages({
  'object.min': 'Cần ít nhất 1 trường để cập nhật'
});

module.exports = {
  createSchema,
  updateSchema
};
