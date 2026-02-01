/**
 * Catalog (Price List) Validation Schemas
 */

const Joi = require('joi');

// Update catalog (price) validation
const updateCatalogSchema = Joi.object({
  cost_price: Joi.number()
    .min(0)
    .messages({
      'number.min': 'Giá nhập không được âm',
    }),
  selling_price: Joi.number()
    .min(0)
    .messages({
      'number.min': 'Giá bán không được âm',
    }),
  is_active: Joi.boolean(),
}).min(1).messages({
  'object.min': 'Phải cung cấp ít nhất một trường để cập nhật',
});

// Bulk update catalog validation
const bulkUpdateCatalogSchema = Joi.object({
  variant_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required()
    .messages({
      'array.min': 'Phải chọn ít nhất một sản phẩm',
      'any.required': 'Danh sách sản phẩm là bắt buộc',
    }),
  price_change_type: Joi.string()
    .valid('fixed', 'percent')
    .required()
    .messages({
      'any.only': 'Loại điều chỉnh giá phải là fixed hoặc percent',
      'any.required': 'Loại điều chỉnh giá là bắt buộc',
    }),
  price_change_value: Joi.number()
    .required()
    .messages({
      'number.base': 'Giá trị điều chỉnh phải là số',
      'any.required': 'Giá trị điều chỉnh là bắt buộc',
    }),
});

// Catalog list query validation
const catalogListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(''),
});

module.exports = {
  updateCatalogSchema,
  bulkUpdateCatalogSchema,
  catalogListQuerySchema,
};
