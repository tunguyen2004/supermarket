/**
 * Common/Shared Validation Schemas
 */

const Joi = require('joi');

// ID parameter validation (for :id routes)
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

// Variant ID parameter validation
const variantIdParamSchema = Joi.object({
  variantId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Variant ID phải là số',
      'number.positive': 'Variant ID phải là số dương',
      'any.required': 'Variant ID là bắt buộc',
    }),
});

// Image ID parameter validation (for product images)
const imageIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  imageId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Image ID phải là số',
      'number.positive': 'Image ID phải là số dương',
      'any.required': 'Image ID là bắt buộc',
    }),
});

// Pagination query validation
const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0),
});

// Date range query validation
const dateRangeQuerySchema = Joi.object({
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref('from')),
}).messages({
  'date.min': 'Ngày kết thúc phải sau ngày bắt đầu',
});

// Dashboard query validation
const dashboardQuerySchema = Joi.object({
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  groupBy: Joi.string().valid('day', 'week', 'month'),
  limit: Joi.number().integer().min(1).max(50).default(10),
  threshold: Joi.number().integer().min(0),
});

// Reorder images validation
const reorderImagesSchema = Joi.object({
  image_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required()
    .messages({
      'array.min': 'Phải có ít nhất một ảnh',
      'any.required': 'Danh sách ảnh là bắt buộc',
    }),
});

module.exports = {
  idParamSchema,
  variantIdParamSchema,
  imageIdParamSchema,
  paginationQuerySchema,
  dateRangeQuerySchema,
  dashboardQuerySchema,
  reorderImagesSchema,
};
