/**
 * Profile Validation Schemas
 */

const Joi = require("joi");

// Update profile validation
const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).messages({
    "string.min": "Họ tên phải có ít nhất 2 ký tự",
    "string.max": "Họ tên không được quá 100 ký tự",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .allow("", null)
    .messages({
      "string.pattern.base": "Số điện thoại phải có 10-11 chữ số",
    }),
  date_of_birth: Joi.date().allow("", null).messages({
    "date.base": "Ngày sinh không hợp lệ",
  }),
  gender: Joi.string()
    .valid("male", "female", "other")
    .allow("", null)
    .messages({
      "any.only": "Giới tính phải là male, female hoặc other",
    }),
  address: Joi.string().max(255).allow("", null).messages({
    "string.max": "Địa chỉ không được quá 255 ký tự",
  }),
})
  .min(1)
  .messages({
    "object.min": "Phải cung cấp ít nhất một trường để cập nhật",
  });

// Change password validation
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "string.empty": "Mật khẩu cũ không được để trống",
    "any.required": "Mật khẩu cũ là bắt buộc",
  }),
  newPassword: Joi.string().required().min(6).messages({
    "string.empty": "Mật khẩu mới không được để trống",
    "string.min": "Mật khẩu mới phải có ít nhất 6 ký tự",
    "any.required": "Mật khẩu mới là bắt buộc",
  }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("newPassword"))
    .messages({
      "string.empty": "Xác nhận mật khẩu không được để trống",
      "any.only": "Xác nhận mật khẩu không khớp với mật khẩu mới",
      "any.required": "Xác nhận mật khẩu là bắt buộc",
    }),
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema,
};
