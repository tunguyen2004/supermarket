import apiClient from "./apiClient";

/**
 * Inventory Lookup Service
 * Tra cứu tồn kho sản phẩm theo chi nhánh
 */

/**
 * Tìm kiếm sản phẩm
 * @param {Object} params - Query parameters
 * @param {string} params.query - Tìm kiếm theo tên, SKU
 * @param {string} params.sort - Sắp xếp (name, price, stock)
 * @param {string} params.order - Thứ tự (asc, desc)
 * @param {number} params.limit - Số lượng kết quả
 * @param {number} params.offset - Vị trí bắt đầu
 * @returns {Promise} Response with products list
 */
export const searchProducts = async (params = {}) => {
  try {
    const response = await apiClient.get("/inventory/lookup/search", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết tồn kho sản phẩm theo chi nhánh
 * @param {string} productId - ID sản phẩm
 * @returns {Promise} Response with product inventory details by branch
 */
export const getProductInventoryDetail = async (productId) => {
  try {
    const response = await apiClient.get(`/inventory/lookup/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product inventory detail:", error);
    throw error;
  }
};

export default {
  searchProducts,
  getProductInventoryDetail,
};
