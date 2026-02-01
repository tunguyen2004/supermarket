/**
 * Product Validation Schemas
 */

const Joi = require('joi');

// Create product validation
const createProductSchema = Joi.object({
  code: Joi.string()
    .required()
    .max(50)
    .messages({
      'string.empty': 'Mã sản phẩm không được để trống',
      'string.max': 'Mã sản phẩm không được quá 50 ký tự',
      'any.required': 'Mã sản phẩm là bắt buộc',
    }),
  name: Joi.string()
    .required()
    .min(2)
    .max(200)
    .messages({
      'string.empty': 'Tên sản phẩm không được để trống',
      'string.min': 'Tên sản phẩm phải có ít nhất 2 ký tự',
      'string.max': 'Tên sản phẩm không được quá 200 ký tự',
      'any.required': 'Tên sản phẩm là bắt buộc',
    }),
  category_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Danh mục phải là số',
      'number.positive': 'Danh mục không hợp lệ',
      'any.required': 'Danh mục là bắt buộc',
    }),
  brand_id: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'Thương hiệu phải là số',
      'number.positive': 'Thương hiệu không hợp lệ',
    }),
  unit_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Đơn vị tính phải là số',
      'number.positive': 'Đơn vị tính không hợp lệ',
      'any.required': 'Đơn vị tính là bắt buộc',
    }),
  description: Joi.string()
    .max(1000)
    .allow('', null)
    .messages({
      'string.max': 'Mô tả không được quá 1000 ký tự',
    }),
  is_active: Joi.boolean()
    .default(true),
  sku: Joi.string()
    .max(50)
    .allow('', null),
  barcode: Joi.string()
    .max(50)
    .allow('', null),
  cost_price: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Giá nhập không được âm',
    }),
  selling_price: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Giá bán không được âm',
    }),
});

// Update product validation
const updateProductSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .messages({
      'string.min': 'Tên sản phẩm phải có ít nhất 2 ký tự',
      'string.max': 'Tên sản phẩm không được quá 200 ký tự',
    }),
  category_id: Joi.number()
    .integer()
    .positive(),
  brand_id: Joi.number()
    .integer()
    .positive()
    .allow(null),
  unit_id: Joi.number()
    .integer()
    .positive(),
  description: Joi.string()
    .max(1000)
    .allow('', null),
  is_active: Joi.boolean(),
});

// Product list query validation
const productListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(''),
  category_id: Joi.number().integer().positive(),
  brand_id: Joi.number().integer().positive(),
  is_active: Joi.boolean(),
});

// Bulk update status validation
const bulkStatusSchema = Joi.object({
  product_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required()
    .messages({
      'array.min': 'Phải chọn ít nhất một sản phẩm',
      'any.required': 'Danh sách sản phẩm là bắt buộc',
    }),
  is_active: Joi.boolean()
    .required()
    .messages({
      'any.required': 'Trạng thái là bắt buộc',
    }),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productListQuerySchema,
  bulkStatusSchema,
};
