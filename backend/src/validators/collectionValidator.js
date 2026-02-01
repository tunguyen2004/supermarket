/**
 * Collection (Category) Validation Schemas
 */

const Joi = require('joi');

// Create collection validation
const createCollectionSchema = Joi.object({
  code: Joi.string()
    .required()
    .max(50)
    .messages({
      'string.empty': 'Mã danh mục không được để trống',
      'string.max': 'Mã danh mục không được quá 50 ký tự',
      'any.required': 'Mã danh mục là bắt buộc',
    }),
  name: Joi.string()
    .required()
    .min(2)
    .max(100)
    .messages({
      'string.empty': 'Tên danh mục không được để trống',
      'string.min': 'Tên danh mục phải có ít nhất 2 ký tự',
      'string.max': 'Tên danh mục không được quá 100 ký tự',
      'any.required': 'Tên danh mục là bắt buộc',
    }),
  parent_id: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'Danh mục cha phải là số',
      'number.positive': 'Danh mục cha không hợp lệ',
    }),
});

// Update collection validation
const updateCollectionSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Tên danh mục phải có ít nhất 2 ký tự',
      'string.max': 'Tên danh mục không được quá 100 ký tự',
    }),
  parent_id: Joi.number()
    .integer()
    .positive()
    .allow(null),
});

// Collection list query validation
const collectionListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(''),
  parent_id: Joi.number().integer().positive().allow(null),
});

module.exports = {
  createCollectionSchema,
  updateCollectionSchema,
  collectionListQuerySchema,
};
