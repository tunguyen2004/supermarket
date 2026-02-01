/**
 * ============================================================================
 *                    MODULE 13: DISCOUNT VALIDATOR
 * ============================================================================
 * Joi validation schemas cho API khuyến mại
 * ============================================================================
 */

const Joi = require('joi');

// Loại khuyến mại hợp lệ
const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING'];
const APPLIES_TO = ['all', 'categories', 'products'];

const discountValidator = {
  /**
   * Validate tạo khuyến mại
   */
  createDiscount: {
    body: Joi.object({
      code: Joi.string()
        .uppercase()
        .min(3)
        .max(20)
        .pattern(/^[A-Z0-9]+$/)
        .required()
        .messages({
          'string.base': 'Mã khuyến mại phải là chuỗi',
          'string.min': 'Mã khuyến mại phải có ít nhất 3 ký tự',
          'string.max': 'Mã khuyến mại không quá 20 ký tự',
          'string.pattern.base': 'Mã khuyến mại chỉ chứa chữ cái và số',
          'any.required': 'Mã khuyến mại là bắt buộc'
        }),
      name: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
          'string.min': 'Tên khuyến mại phải có ít nhất 3 ký tự',
          'string.max': 'Tên khuyến mại không quá 100 ký tự',
          'any.required': 'Tên khuyến mại là bắt buộc'
        }),
      description: Joi.string()
        .max(500)
        .allow(null, '')
        .messages({
          'string.max': 'Mô tả không quá 500 ký tự'
        }),
      discount_type: Joi.string()
        .valid(...DISCOUNT_TYPES)
        .required()
        .messages({
          'any.only': `Loại khuyến mại phải là: ${DISCOUNT_TYPES.join(', ')}`,
          'any.required': 'Loại khuyến mại là bắt buộc'
        }),
      discount_value: Joi.number()
        .positive()
        .required()
        .messages({
          'number.positive': 'Giá trị khuyến mại phải lớn hơn 0',
          'any.required': 'Giá trị khuyến mại là bắt buộc'
        }),
      max_discount_amount: Joi.number()
        .positive()
        .allow(null)
        .messages({
          'number.positive': 'Số tiền giảm tối đa phải lớn hơn 0'
        }),
      min_order_amount: Joi.number()
        .min(0)
        .default(0)
        .messages({
          'number.min': 'Giá trị đơn hàng tối thiểu không được âm'
        }),
      max_uses_total: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
          'number.positive': 'Tổng lượt sử dụng phải lớn hơn 0'
        }),
      max_uses_per_customer: Joi.number()
        .integer()
        .positive()
        .default(1)
        .messages({
          'number.positive': 'Lượt sử dụng mỗi khách hàng phải lớn hơn 0'
        }),
      applies_to: Joi.string()
        .valid(...APPLIES_TO)
        .default('all')
        .messages({
          'any.only': `Áp dụng cho phải là: ${APPLIES_TO.join(', ')}`
        }),
      applicable_product_ids: Joi.array()
        .items(Joi.number().integer().positive())
        .allow(null)
        .messages({
          'array.base': 'Danh sách sản phẩm áp dụng phải là mảng'
        }),
      applicable_category_ids: Joi.array()
        .items(Joi.number().integer().positive())
        .allow(null)
        .messages({
          'array.base': 'Danh sách danh mục áp dụng phải là mảng'
        }),
      customer_group_ids: Joi.array()
        .items(Joi.number().integer().positive())
        .allow(null)
        .messages({
          'array.base': 'Danh sách nhóm khách hàng phải là mảng'
        }),
      start_date: Joi.date()
        .iso()
        .required()
        .messages({
          'date.base': 'Ngày bắt đầu không hợp lệ',
          'any.required': 'Ngày bắt đầu là bắt buộc'
        }),
      end_date: Joi.date()
        .iso()
        .greater(Joi.ref('start_date'))
        .required()
        .messages({
          'date.base': 'Ngày kết thúc không hợp lệ',
          'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu',
          'any.required': 'Ngày kết thúc là bắt buộc'
        })
    })
  },

  /**
   * Validate cập nhật khuyến mại
   */
  updateDiscount: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          'number.base': 'ID khuyến mại phải là số',
          'any.required': 'ID khuyến mại là bắt buộc'
        })
    }),
    body: Joi.object({
      name: Joi.string()
        .min(3)
        .max(100)
        .messages({
          'string.min': 'Tên khuyến mại phải có ít nhất 3 ký tự',
          'string.max': 'Tên khuyến mại không quá 100 ký tự'
        }),
      description: Joi.string()
        .max(500)
        .allow(null, ''),
      discount_type: Joi.string()
        .valid(...DISCOUNT_TYPES)
        .messages({
          'any.only': `Loại khuyến mại phải là: ${DISCOUNT_TYPES.join(', ')}`
        }),
      discount_value: Joi.number()
        .positive()
        .messages({
          'number.positive': 'Giá trị khuyến mại phải lớn hơn 0'
        }),
      max_discount_amount: Joi.number()
        .positive()
        .allow(null),
      min_order_amount: Joi.number()
        .min(0),
      max_uses_total: Joi.number()
        .integer()
        .positive()
        .allow(null),
      max_uses_per_customer: Joi.number()
        .integer()
        .positive(),
      applies_to: Joi.string()
        .valid(...APPLIES_TO),
      applicable_product_ids: Joi.array()
        .items(Joi.number().integer().positive())
        .allow(null),
      applicable_category_ids: Joi.array()
        .items(Joi.number().integer().positive())
        .allow(null),
      customer_group_ids: Joi.array()
        .items(Joi.number().integer().positive())
        .allow(null),
      start_date: Joi.date()
        .iso(),
      end_date: Joi.date()
        .iso(),
      is_active: Joi.boolean()
    }).min(1).messages({
      'object.min': 'Cần ít nhất một trường để cập nhật'
    })
  },

  /**
   * Validate mã khuyến mại (cho POS)
   */
  validateCode: {
    body: Joi.object({
      code: Joi.string()
        .required()
        .messages({
          'any.required': 'Mã khuyến mại là bắt buộc'
        }),
      order_amount: Joi.number()
        .min(0)
        .allow(null)
        .messages({
          'number.min': 'Giá trị đơn hàng không được âm'
        }),
      customer_id: Joi.number()
        .integer()
        .positive()
        .allow(null),
      items: Joi.array()
        .items(
          Joi.object({
            product_id: Joi.number().integer().positive().required(),
            quantity: Joi.number().integer().positive().required(),
            price: Joi.number().positive()
          })
        )
        .allow(null)
    })
  }
};

module.exports = discountValidator;
