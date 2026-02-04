/**
 * Order Validation Schemas
 */

const Joi = require("joi");

// Order item validation
const orderItemSchema = Joi.object({
  variant_id: Joi.number().integer().positive().required().messages({
    "number.base": "Variant ID phải là số",
    "any.required": "Variant ID là bắt buộc",
  }),
  quantity: Joi.number().integer().positive().required().messages({
    "number.base": "Số lượng phải là số",
    "number.positive": "Số lượng phải lớn hơn 0",
    "any.required": "Số lượng là bắt buộc",
  }),
  unit_price: Joi.number().min(0).required().messages({
    "number.min": "Đơn giá không được âm",
    "any.required": "Đơn giá là bắt buộc",
  }),
  discount_per_item: Joi.number().min(0).default(0).messages({
    "number.min": "Giảm giá không được âm",
  }),
});

// Create order validation
const createOrderSchema = Joi.object({
  store_id: Joi.number().integer().positive().required().messages({
    "number.base": "Cửa hàng phải là số",
    "any.required": "Cửa hàng là bắt buộc",
  }),
  customer_id: Joi.number().integer().positive().allow(null),
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    "array.min": "Đơn hàng phải có ít nhất một sản phẩm",
    "any.required": "Danh sách sản phẩm là bắt buộc",
  }),
  subtotal: Joi.number().min(0).required().messages({
    "number.min": "Tổng tiền không được âm",
    "any.required": "Tổng tiền là bắt buộc",
  }),
  discount_amount: Joi.number().min(0).default(0),
  tax_amount: Joi.number().min(0).default(0),
  shipping_fee: Joi.number().min(0).default(0),
  payment_method: Joi.string()
    .valid("cash", "card", "bank transfer")
    .default("cash")
    .messages({
      "any.only": "Phương thức thanh toán không hợp lệ",
    }),
  shipping_address: Joi.string().max(500).allow("", null),
  customer_note: Joi.string().max(500).allow("", null),
  internal_note: Joi.string().max(500).allow("", null),
});

// Update order status validation
const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .messages({
      "any.only": "Trạng thái đơn hàng không hợp lệ",
    }),
  payment_status: Joi.string()
    .valid("unpaid", "partial", "paid", "refunded")
    .messages({
      "any.only": "Trạng thái thanh toán không hợp lệ",
    }),
  payment_method: Joi.string().valid("cash", "card", "bank transfer").messages({
    "any.only": "Phương thức thanh toán không hợp lệ",
  }),
})
  .min(1)
  .messages({
    "object.min": "Phải cung cấp ít nhất một trường để cập nhật",
  });

// Cancel order validation
const cancelOrderSchema = Joi.object({
  reason: Joi.string().max(500).allow("", null),
});

// Order list query validation
const orderListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0),
  status: Joi.string().valid("pending", "processing", "completed", "cancelled"),
  payment_status: Joi.string().valid("paid", "unpaid", "refunded"),
  search: Joi.string().allow(""),
  sort: Joi.string().valid(
    "order_code",
    "final_amount",
    "status",
    "created_at",
  ),
  order: Joi.string().valid("ASC", "DESC", "asc", "desc"),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  orderListQuerySchema,
};
