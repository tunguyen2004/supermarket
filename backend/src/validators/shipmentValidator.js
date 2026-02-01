/**
 * ============================================================================
 *                    MODULE 15: SHIPMENT VALIDATOR
 * ============================================================================
 * Joi validation schemas cho API vận đơn
 * ============================================================================
 */

const Joi = require('joi');

// Trạng thái vận đơn hợp lệ
const SHIPMENT_STATUSES = [
  'pending', 'confirmed', 'picking', 'picked', 'in_transit', 
  'out_for_delivery', 'delivered', 'failed', 'returned', 'cancelled'
];

const shipmentValidator = {
  /**
   * Validate tạo vận đơn
   */
  createShipment: {
    body: Joi.object({
      order_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          'number.base': 'ID đơn hàng phải là số',
          'any.required': 'ID đơn hàng là bắt buộc'
        }),
      carrier_id: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
          'number.base': 'ID đơn vị vận chuyển phải là số'
        }),
      tracking_code: Joi.string()
        .max(100)
        .allow(null, '')
        .messages({
          'string.max': 'Mã tracking không quá 100 ký tự'
        }),
      sender_store_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          'number.base': 'ID cửa hàng gửi phải là số',
          'any.required': 'ID cửa hàng gửi là bắt buộc'
        }),
      recipient_name: Joi.string()
        .min(2)
        .max(200)
        .required()
        .messages({
          'string.min': 'Tên người nhận phải có ít nhất 2 ký tự',
          'string.max': 'Tên người nhận không quá 200 ký tự',
          'any.required': 'Tên người nhận là bắt buộc'
        }),
      recipient_phone: Joi.string()
        .pattern(/^[0-9]{10,11}$/)
        .required()
        .messages({
          'string.pattern.base': 'Số điện thoại không hợp lệ (10-11 số)',
          'any.required': 'Số điện thoại người nhận là bắt buộc'
        }),
      recipient_address: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
          'string.min': 'Địa chỉ phải có ít nhất 10 ký tự',
          'string.max': 'Địa chỉ không quá 500 ký tự',
          'any.required': 'Địa chỉ người nhận là bắt buộc'
        }),
      recipient_city_id: Joi.number()
        .integer()
        .positive()
        .allow(null),
      recipient_district: Joi.string()
        .max(100)
        .allow(null, ''),
      recipient_ward: Joi.string()
        .max(100)
        .allow(null, ''),
      package_weight: Joi.number()
        .min(0)
        .allow(null)
        .messages({
          'number.min': 'Cân nặng không được âm'
        }),
      package_length: Joi.number()
        .min(0)
        .allow(null),
      package_width: Joi.number()
        .min(0)
        .allow(null),
      package_height: Joi.number()
        .min(0)
        .allow(null),
      items_description: Joi.string()
        .max(500)
        .allow(null, ''),
      shipping_fee: Joi.number()
        .min(0)
        .default(0)
        .messages({
          'number.min': 'Phí vận chuyển không được âm'
        }),
      cod_amount: Joi.number()
        .min(0)
        .default(0)
        .messages({
          'number.min': 'Số tiền COD không được âm'
        }),
      insurance_fee: Joi.number()
        .min(0)
        .default(0)
        .messages({
          'number.min': 'Phí bảo hiểm không được âm'
        }),
      estimated_delivery_date: Joi.date()
        .iso()
        .allow(null)
        .messages({
          'date.base': 'Ngày dự kiến giao không hợp lệ'
        }),
      notes: Joi.string()
        .max(1000)
        .allow(null, ''),
      special_instructions: Joi.string()
        .max(500)
        .allow(null, '')
    })
  },

  /**
   * Validate cập nhật vận đơn
   */
  updateShipment: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          'number.base': 'ID vận đơn phải là số',
          'any.required': 'ID vận đơn là bắt buộc'
        })
    }),
    body: Joi.object({
      carrier_id: Joi.number()
        .integer()
        .positive()
        .allow(null),
      tracking_code: Joi.string()
        .max(100)
        .allow(null, ''),
      recipient_name: Joi.string()
        .min(2)
        .max(200),
      recipient_phone: Joi.string()
        .pattern(/^[0-9]{10,11}$/),
      recipient_address: Joi.string()
        .min(10)
        .max(500),
      recipient_city_id: Joi.number()
        .integer()
        .positive()
        .allow(null),
      recipient_district: Joi.string()
        .max(100)
        .allow(null, ''),
      recipient_ward: Joi.string()
        .max(100)
        .allow(null, ''),
      package_weight: Joi.number()
        .min(0)
        .allow(null),
      package_length: Joi.number()
        .min(0)
        .allow(null),
      package_width: Joi.number()
        .min(0)
        .allow(null),
      package_height: Joi.number()
        .min(0)
        .allow(null),
      items_description: Joi.string()
        .max(500)
        .allow(null, ''),
      shipping_fee: Joi.number()
        .min(0),
      cod_amount: Joi.number()
        .min(0),
      insurance_fee: Joi.number()
        .min(0),
      estimated_delivery_date: Joi.date()
        .iso()
        .allow(null),
      notes: Joi.string()
        .max(1000)
        .allow(null, ''),
      special_instructions: Joi.string()
        .max(500)
        .allow(null, '')
    }).min(1).messages({
      'object.min': 'Cần ít nhất một trường để cập nhật'
    })
  },

  /**
   * Validate cập nhật trạng thái
   */
  updateStatus: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .positive()
        .required()
    }),
    body: Joi.object({
      status: Joi.string()
        .valid(...SHIPMENT_STATUSES)
        .required()
        .messages({
          'any.only': `Trạng thái phải là: ${SHIPMENT_STATUSES.join(', ')}`,
          'any.required': 'Trạng thái là bắt buộc'
        }),
      location: Joi.string()
        .max(200)
        .allow(null, '')
        .messages({
          'string.max': 'Vị trí không quá 200 ký tự'
        }),
      description: Joi.string()
        .max(500)
        .allow(null, '')
        .messages({
          'string.max': 'Mô tả không quá 500 ký tự'
        })
    })
  }
};

module.exports = shipmentValidator;
