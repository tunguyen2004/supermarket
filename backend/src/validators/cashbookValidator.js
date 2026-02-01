/**
 * ============================================================================
 *                    MODULE 14: CASHBOOK VALIDATOR
 * ============================================================================
 * Joi validation schemas cho API sổ quỹ
 * ============================================================================
 */

const Joi = require('joi');

// Loại giao dịch hợp lệ
const CASHBOOK_TYPES = [
  'SALES_INCOME', 'OTHER_INCOME', 'PURCHASE_EXPENSE', 'SALARY_EXPENSE',
  'RENT_EXPENSE', 'UTILITY_EXPENSE', 'OTHER_EXPENSE', 'REFUND', 'DEPOSIT', 'WITHDRAWAL'
];

// Phương thức thanh toán hợp lệ
const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'CARD', 'MOMO', 'ZALOPAY', 'VNPAY', 'OTHER'];

// Trạng thái hợp lệ
const STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

const cashbookValidator = {
  /**
   * Validate tạo giao dịch
   */
  createTransaction: {
    body: Joi.object({
      store_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          'number.base': 'ID cửa hàng phải là số',
          'any.required': 'ID cửa hàng là bắt buộc'
        }),
      cashbook_type: Joi.string()
        .valid(...CASHBOOK_TYPES)
        .required()
        .messages({
          'any.only': `Loại giao dịch phải là: ${CASHBOOK_TYPES.join(', ')}`,
          'any.required': 'Loại giao dịch là bắt buộc'
        }),
      payment_method: Joi.string()
        .valid(...PAYMENT_METHODS)
        .allow(null, '')
        .messages({
          'any.only': `Phương thức thanh toán phải là: ${PAYMENT_METHODS.join(', ')}`
        }),
      amount: Joi.number()
        .positive()
        .required()
        .messages({
          'number.positive': 'Số tiền phải lớn hơn 0',
          'any.required': 'Số tiền là bắt buộc'
        }),
      date_key: Joi.date()
        .iso()
        .max('now')
        .allow(null)
        .messages({
          'date.base': 'Ngày giao dịch không hợp lệ',
          'date.max': 'Ngày giao dịch không được trong tương lai'
        }),
      reference_type: Joi.string()
        .max(50)
        .allow(null, '')
        .messages({
          'string.max': 'Loại tham chiếu không quá 50 ký tự'
        }),
      reference_id: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
          'number.base': 'ID tham chiếu phải là số'
        }),
      description: Joi.string()
        .max(500)
        .allow(null, '')
        .messages({
          'string.max': 'Mô tả không quá 500 ký tự'
        }),
      recipient_name: Joi.string()
        .max(200)
        .allow(null, '')
        .messages({
          'string.max': 'Tên người nhận/nộp không quá 200 ký tự'
        }),
      recipient_phone: Joi.string()
        .pattern(/^[0-9]{10,11}$/)
        .allow(null, '')
        .messages({
          'string.pattern.base': 'Số điện thoại không hợp lệ (10-11 số)'
        }),
      notes: Joi.string()
        .max(1000)
        .allow(null, '')
        .messages({
          'string.max': 'Ghi chú không quá 1000 ký tự'
        })
    })
  },

  /**
   * Validate cập nhật giao dịch
   */
  updateTransaction: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          'number.base': 'ID giao dịch phải là số',
          'any.required': 'ID giao dịch là bắt buộc'
        })
    }),
    body: Joi.object({
      cashbook_type: Joi.string()
        .valid(...CASHBOOK_TYPES)
        .messages({
          'any.only': `Loại giao dịch phải là: ${CASHBOOK_TYPES.join(', ')}`
        }),
      payment_method: Joi.string()
        .valid(...PAYMENT_METHODS)
        .allow(null, ''),
      amount: Joi.number()
        .positive()
        .messages({
          'number.positive': 'Số tiền phải lớn hơn 0'
        }),
      date_key: Joi.date()
        .iso()
        .max('now'),
      description: Joi.string()
        .max(500)
        .allow(null, ''),
      recipient_name: Joi.string()
        .max(200)
        .allow(null, ''),
      recipient_phone: Joi.string()
        .pattern(/^[0-9]{10,11}$/)
        .allow(null, ''),
      notes: Joi.string()
        .max(1000)
        .allow(null, ''),
      status: Joi.string()
        .valid(...STATUSES)
        .messages({
          'any.only': `Trạng thái phải là: ${STATUSES.join(', ')}`
        })
    }).min(1).messages({
      'object.min': 'Cần ít nhất một trường để cập nhật'
    })
  },

  /**
   * Validate duyệt giao dịch
   */
  approveTransaction: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .positive()
        .required()
    }),
    body: Joi.object({
      action: Joi.string()
        .valid('approve', 'reject')
        .required()
        .messages({
          'any.only': 'Action phải là approve hoặc reject',
          'any.required': 'Action là bắt buộc'
        })
    })
  }
};

module.exports = cashbookValidator;
