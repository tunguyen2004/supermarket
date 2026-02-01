const Joi = require('joi');

/**
 * Validator schemas cho Report APIs
 */

// Query schema cho báo cáo doanh thu
const reportQuerySchema = Joi.object({
  from: Joi.date().iso().optional().messages({
    'date.format': 'Ngày bắt đầu phải có định dạng YYYY-MM-DD'
  }),
  to: Joi.date().iso().min(Joi.ref('from')).optional().messages({
    'date.format': 'Ngày kết thúc phải có định dạng YYYY-MM-DD',
    'date.min': 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu'
  }),
  staff_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID nhân viên phải là số',
    'number.positive': 'ID nhân viên phải là số dương'
  }),
  store_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID cửa hàng phải là số',
    'number.positive': 'ID cửa hàng phải là số dương'
  })
});

// Query schema cho danh sách sản phẩm đã bán
const soldProductsQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().min(Joi.ref('from')).optional(),
  staff_id: Joi.number().integer().positive().optional(),
  store_id: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(50),
  sort_by: Joi.string().valid('quantity', 'revenue', 'orders', 'profit').default('quantity'),
  sort_order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC')
});

// Query schema cho in báo cáo
const printReportQuerySchema = Joi.object({
  date: Joi.date().iso().optional().messages({
    'date.format': 'Ngày báo cáo phải có định dạng YYYY-MM-DD'
  }),
  staff_id: Joi.number().integer().positive().optional(),
  store_id: Joi.number().integer().positive().optional()
});

module.exports = {
  reportQuerySchema,
  soldProductsQuerySchema,
  printReportQuerySchema
};
