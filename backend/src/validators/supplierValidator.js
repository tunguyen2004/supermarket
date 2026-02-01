/**
 * Supplier Validator - Joi schemas cho Supplier APIs
 */

const Joi = require('joi');

const supplierValidator = {
  // GET /api/suppliers query
  listQuery: Joi.object({
    search: Joi.string().max(100),
    city_id: Joi.number().integer().positive(),
    is_active: Joi.boolean(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('created_at', 'name', 'code'),
    order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc')
  }),

  // POST /api/suppliers body
  create: Joi.object({
    name: Joi.string().min(2).max(200).required()
      .messages({
        'string.min': 'Tên NCC phải có ít nhất 2 ký tự',
        'any.required': 'Tên nhà cung cấp là bắt buộc'
      }),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/).allow('', null)
      .messages({
        'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số'
      }),
    email: Joi.string().email().max(100).allow('', null),
    city_id: Joi.number().integer().positive().allow(null),
    address: Joi.string().max(500).allow('', null),
    tax_code: Joi.string().max(50).allow('', null),
    payment_terms: Joi.string().max(100).allow('', null),
    is_active: Joi.boolean().default(true)
  }),

  // PUT /api/suppliers/:id body
  update: Joi.object({
    name: Joi.string().min(2).max(200),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/).allow('', null),
    email: Joi.string().email().max(100).allow('', null),
    city_id: Joi.number().integer().positive().allow(null),
    address: Joi.string().max(500).allow('', null),
    tax_code: Joi.string().max(50).allow('', null),
    payment_terms: Joi.string().max(100).allow('', null),
    is_active: Joi.boolean()
  })
};

module.exports = { supplierValidator };
