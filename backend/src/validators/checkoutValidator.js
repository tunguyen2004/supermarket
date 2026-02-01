/**
 * Checkout Validator
 * @module validators/checkoutValidator
 */

const Joi = require('joi');

// Schema gửi link thanh toán
const sendLinkSchema = Joi.object({
  custom_message: Joi.string()
    .max(500)
    .allow(null, '')
    .messages({
      'string.max': 'Tin nhắn tối đa 500 ký tự'
    })
});

// Schema gửi email hàng loạt
const massEmailSchema = Joi.object({
  checkout_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .messages({
      'array.base': 'checkout_ids phải là mảng',
      'number.base': 'ID phải là số',
      'number.integer': 'ID phải là số nguyên',
      'number.positive': 'ID phải là số dương'
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

  exclude_already_sent: Joi.boolean()
    .default(true),

  custom_message: Joi.string()
    .max(500)
    .allow(null, '')
    .messages({
      'string.max': 'Tin nhắn tối đa 500 ký tự'
    })
});

// Schema query params cho danh sách
const querySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),

  store_id: Joi.number()
    .integer()
    .positive(),

  status: Joi.string()
    .valid('draft', 'abandoned', 'pending'),

  search: Joi.string()
    .max(100),

  from: Joi.date()
    .iso(),

  to: Joi.date()
    .iso()
    .min(Joi.ref('from')),

  sort_by: Joi.string()
    .valid('created_at', 'final_amount', 'order_code')
    .default('created_at'),

  sort_order: Joi.string()
    .valid('ASC', 'DESC', 'asc', 'desc')
    .default('DESC')
});

module.exports = {
  sendLinkSchema,
  massEmailSchema,
  querySchema
};
