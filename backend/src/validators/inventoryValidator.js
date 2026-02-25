/**
 * Inventory Validation Schemas
 */

const Joi = require("joi");

// Inventory item for bulk operations
const inventoryItemSchema = Joi.object({
  variant_id: Joi.number().integer().positive().required().messages({
    "number.base": "Variant ID phải là số",
    "any.required": "Variant ID là bắt buộc",
  }),
  quantity: Joi.number().integer().positive().required().messages({
    "number.base": "Số lượng phải là số",
    "number.positive": "Số lượng phải lớn hơn 0",
    "any.required": "Số lượng là bắt buộc",
  }),
  unit_cost: Joi.number().min(0).messages({
    "number.min": "Giá nhập không được âm",
  }),
});

// Receive inventory validation
const receiveInventorySchema = Joi.object({
  store_id: Joi.number().integer().positive().required().messages({
    "number.base": "Cửa hàng phải là số",
    "any.required": "Cửa hàng là bắt buộc",
  }),
  items: Joi.array().items(inventoryItemSchema).min(1).required().messages({
    "array.min": "Phải có ít nhất một sản phẩm",
    "any.required": "Danh sách sản phẩm là bắt buộc",
  }),
  notes: Joi.string().max(500).allow("", null),
});

// Transfer stock validation
const transferStockSchema = Joi.object({
  from_store_id: Joi.number().integer().positive().required().messages({
    "number.base": "Cửa hàng nguồn phải là số",
    "any.required": "Cửa hàng nguồn là bắt buộc",
  }),
  to_store_id: Joi.number().integer().positive().required().messages({
    "number.base": "Cửa hàng đích phải là số",
    "any.required": "Cửa hàng đích là bắt buộc",
  }),
  items: Joi.array()
    .items(
      Joi.object({
        variant_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Phải có ít nhất một sản phẩm",
      "any.required": "Danh sách sản phẩm là bắt buộc",
    }),
  notes: Joi.string().max(500).allow("", null),
}).custom((value, helpers) => {
  if (value.from_store_id === value.to_store_id) {
    return helpers.error("any.custom", {
      message: "Cửa hàng nguồn và đích không được giống nhau",
    });
  }
  return value;
});

// Return to supplier validation
const returnToSupplierSchema = Joi.object({
  store_id: Joi.number().integer().positive().required().messages({
    "number.base": "Cửa hàng phải là số",
    "any.required": "Cửa hàng là bắt buộc",
  }),
  items: Joi.array()
    .items(
      Joi.object({
        variant_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Phải có ít nhất một sản phẩm",
      "any.required": "Danh sách sản phẩm là bắt buộc",
    }),
  notes: Joi.string().max(500).allow("", null),
});

// Update inventory validation
const updateInventorySchema = Joi.object({
  store_id: Joi.number().integer().positive().required().messages({
    "number.base": "Cửa hàng phải là số",
    "any.required": "Cửa hàng là bắt buộc",
  }),
  quantity: Joi.number().integer().required().messages({
    "number.base": "Số lượng phải là số",
    "any.required": "Số lượng là bắt buộc",
  }),
  adjustment_type: Joi.string()
    .valid("set", "add", "subtract")
    .required()
    .messages({
      "any.only": "Loại điều chỉnh phải là set, add hoặc subtract",
      "any.required": "Loại điều chỉnh là bắt buộc",
    }),
  notes: Joi.string().max(500).allow("", null),
});

// Inventory list query validation
const inventoryListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow("", null),
  store_id: Joi.number().integer().positive().allow("", null),
  status: Joi.string().valid("out", "low", "normal", "high").allow("", null),
});

// Inventory history query validation
const inventoryHistoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  store_id: Joi.number().integer().positive(),
  from: Joi.date().iso(),
  to: Joi.date().iso(),
});

module.exports = {
  receiveInventorySchema,
  transferStockSchema,
  returnToSupplierSchema,
  updateInventorySchema,
  inventoryListQuerySchema,
  inventoryHistoryQuerySchema,
};
