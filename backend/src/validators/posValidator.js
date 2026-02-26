const Joi = require("joi");

/**
 * Validator schemas cho POS APIs
 */

// Checkout schema
const checkoutSchema = Joi.object({
  store_id: Joi.number().integer().positive().required().messages({
    "any.required": "Vui lòng chọn cửa hàng",
    "number.base": "ID cửa hàng phải là số",
    "number.positive": "ID cửa hàng phải là số dương",
  }),
  customer_id: Joi.number().integer().positive().allow(null).optional(),
  items: Joi.array()
    .min(1)
    .items(
      Joi.object({
        variant_id: Joi.number().integer().positive().allow(null).optional(),
        quantity: Joi.number().integer().min(1).required(),
        unit_price: Joi.number().min(0).optional(),
        discount_amount: Joi.number().min(0).optional(),
        name: Joi.string().max(255).allow(null, "").optional(),
        is_custom: Joi.boolean().optional(),
      }),
    )
    .required()
    .messages({
      "any.required": "Vui lòng thêm sản phẩm vào đơn hàng",
      "array.min": "Đơn hàng phải có ít nhất 1 sản phẩm",
    }),
  subtotal: Joi.number().min(0).optional(),
  discount_amount: Joi.number().min(0).default(0),
  member_discount_amount: Joi.number().min(0).default(0),
  discount_code: Joi.string().max(50).allow("", null).optional(),
  discount_id: Joi.number().integer().positive().allow(null).optional(),
  payment_method: Joi.string()
    .valid("cash", "card", "bank", "bank_qr", "delivery", "momo", "zalopay", "vnpay")
    .default("cash"),
  amount_received: Joi.number().min(0).optional(),
  change: Joi.number().min(0).default(0),
  notes: Joi.string().max(500).allow("", null).optional(),
  shipping_fee: Joi.number().min(0).default(0),
  shipping_address: Joi.string().max(500).allow("", null).optional(),
  delivery_note: Joi.string().max(500).allow("", null).optional(),
  receiver_name: Joi.string().max(200).allow("", null).optional(),
  receiver_phone: Joi.string().max(20).allow("", null).optional(),
  carrier_id: Joi.number().integer().positive().allow(null).optional(),
  cod_enabled: Joi.boolean().default(false),
});

// Draft order schema
const draftSchema = Joi.object({
  store_id: Joi.number().integer().positive().optional(),
  customer_id: Joi.number().integer().positive().allow(null).optional(),
  items: Joi.array()
    .min(1)
    .items(
      Joi.object({
        variant_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).required(),
        unit_price: Joi.number().min(0).optional(),
        discount_amount: Joi.number().min(0).optional(),
      }),
    )
    .required()
    .messages({
      "any.required": "Vui lòng thêm sản phẩm vào đơn hàng",
      "array.min": "Đơn tạm phải có ít nhất 1 sản phẩm",
    }),
  subtotal: Joi.number().min(0).optional(),
  discount_amount: Joi.number().min(0).default(0),
  discount_code: Joi.string().max(50).allow("", null).optional(),
  notes: Joi.string().max(500).allow("", null).optional(),
  name: Joi.string().max(100).allow("", null).optional(),
});

// Product search query schema
const productSearchSchema = Joi.object({
  q: Joi.string().min(1).optional(),
  store_id: Joi.number().integer().positive().optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Validate discount schema
const validateDiscountSchema = Joi.object({
  code: Joi.string().required().messages({
    "any.required": "Vui lòng nhập mã giảm giá",
  }),
  order_amount: Joi.number().min(0).optional(),
  customer_id: Joi.number().integer().positive().allow(null).optional(),
});

module.exports = {
  checkoutSchema,
  draftSchema,
  productSearchSchema,
  validateDiscountSchema,
};
