/**
 * Discount Service - Quản lý khuyến mại/mã giảm giá
 */
import api from "./apiClient";

/**
 * Lấy danh sách khuyến mại
 * GET /api/discounts
 */
const getDiscounts = async (params = {}) => {
  return api.get("/api/discounts", { params });
};

/**
 * Lấy chi tiết khuyến mại
 * GET /api/discounts/:id
 */
const getDiscountById = async (id) => {
  return api.get(`/api/discounts/${id}`);
};

/**
 * Tạo khuyến mại mới
 * POST /api/discounts
 */
const createDiscount = async (discountData) => {
  return api.post("/api/discounts", discountData);
};

/**
 * Cập nhật khuyến mại
 * PUT /api/discounts/:id
 */
const updateDiscount = async (id, discountData) => {
  return api.put(`/api/discounts/${id}`, discountData);
};

/**
 * Xóa khuyến mại
 * DELETE /api/discounts/:id
 */
const deleteDiscount = async (id) => {
  return api.delete(`/api/discounts/${id}`);
};

/**
 * Kết thúc khuyến mại sớm
 * PATCH /api/discounts/:id/deactivate
 */
const deactivateDiscount = async (id) => {
  return api.patch(`/api/discounts/${id}/deactivate`);
};

/**
 * Validate mã khuyến mại
 * POST /api/discounts/validate
 */
const validateDiscount = async (validationData) => {
  return api.post("/api/discounts/validate", validationData);
};

/**
 * Lấy danh sách loại khuyến mại
 * GET /api/discount/types
 */
const getDiscountTypes = async () => {
  return api.get("/api/discount/types");
};

export default {
  getDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  deactivateDiscount,
  validateDiscount,
  getDiscountTypes,
};
