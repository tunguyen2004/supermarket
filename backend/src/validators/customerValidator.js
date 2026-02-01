/**
 * Customer Validator - Joi schemas cho Customer APIs
 */

const Joi = require('joi');

const customerValidator = {
  // GET /api/customers query
  listQuery: Joi.object({
    search: Joi.string().max(100),
    group_id: Joi.number().integer().positive(),
    city_id: Joi.number().integer().positive(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('created_at', 'full_name', 'total_lifetime_value', 'code'),
    order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc')
  }),

  // GET /api/customers/search query
  searchQuery: Joi.object({
    q: Joi.string().min(2).max(100).required()
      .messages({
        'string.min': 'Nhập ít nhất 2 ký tự để tìm kiếm',
        'any.required': 'Từ khóa tìm kiếm là bắt buộc'
      }),
    limit: Joi.number().integer().min(1).max(50).default(10)
  }),

  // POST /api/customers body
  create: Joi.object({
    full_name: Joi.string().min(2).max(200).required()
      .messages({
        'string.min': 'Họ tên phải có ít nhất 2 ký tự',
        'any.required': 'Họ tên là bắt buộc'
      }),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/).required()
      .messages({
        'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số',
        'any.required': 'Số điện thoại là bắt buộc'
      }),
    email: Joi.string().email().max(100).allow('', null),
    customer_group_id: Joi.number().integer().positive().allow(null),
    city_id: Joi.number().integer().positive().allow(null),
    address: Joi.string().max(500).allow('', null),
    date_of_birth: Joi.date().max('now').allow(null)
      .messages({
        'date.max': 'Ngày sinh không được lớn hơn ngày hiện tại'
      }),
    gender: Joi.string().valid('male', 'female', 'other').allow('', null)
  }),

  // PUT /api/customers/:id body
  update: Joi.object({
    full_name: Joi.string().min(2).max(200),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/),
    email: Joi.string().email().max(100).allow('', null),
    customer_group_id: Joi.number().integer().positive().allow(null),
    city_id: Joi.number().integer().positive().allow(null),
    address: Joi.string().max(500).allow('', null),
    date_of_birth: Joi.date().max('now').allow(null),
    gender: Joi.string().valid('male', 'female', 'other').allow('', null)
  }),

  // PUT /api/customers/:id/group body
  updateGroup: Joi.object({
    group_id: Joi.number().integer().positive().allow(null)
      .messages({
        'number.positive': 'group_id phải là số nguyên dương'
      })
  })
};

module.exports = { customerValidator };
