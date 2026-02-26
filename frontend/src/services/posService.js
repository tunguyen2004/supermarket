/**
 * ============================================================================
 *                    FRONTEND POS SERVICE
 * ============================================================================
 * Service để tương tác với API Point of Sale từ backend
 * ============================================================================
 */

import apiClient from "@/config/axios";

class PosService {
  /**
   * Tìm kiếm sản phẩm nhanh cho POS (barcode, SKU, tên)
   * @param {Object} params - Query parameters
   * @param {string} params.q - Từ khóa tìm kiếm
   * @param {number} params.store_id - ID cửa hàng để lấy giá và tồn kho
   * @param {number} params.limit - Số lượng kết quả (default: 20)
   * @returns {Promise<Array>} Danh sách sản phẩm
   */
  async searchProducts(params) {
    try {
      const response = await apiClient.get("/api/pos/products/search", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error searching products:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi tìm kiếm sản phẩm",
      );
    }
  }

  /**
   * Lấy giá sản phẩm theo store và thông tin tồn kho
   * @param {number} variantId - ID variant sản phẩm
   * @param {number} storeId - ID cửa hàng
   * @returns {Promise<Object>} Thông tin giá và tồn kho
   */
  async getProductPrice(variantId, storeId = 1) {
    try {
      const response = await apiClient.get(
        `/api/pos/products/${variantId}/price`,
        {
          params: { store_id: storeId },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error getting product price:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi lấy giá sản phẩm",
      );
    }
  }

  /**
   * Xử lý thanh toán đơn hàng POS
   * @param {Object} checkoutData - Dữ liệu thanh toán
   * @returns {Promise<Object>} Kết quả thanh toán
   */
  async checkout(checkoutData) {
    try {
      const response = await apiClient.post("/api/pos/checkout", checkoutData);
      return response.data;
    } catch (error) {
      console.error("Error processing checkout:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi xử lý thanh toán",
      );
    }
  }

  /**
   * Lưu đơn hàng tạm (draft)
   * @param {Object} draftData - Dữ liệu đơn tạm
   * @returns {Promise<Object>} Thông tin đơn tạm đã tạo
   */
  async saveDraft(draftData) {
    try {
      const response = await apiClient.post("/api/pos/orders/draft", draftData);
      return response.data;
    } catch (error) {
      console.error("Error saving draft:", error);
      throw new Error(error.response?.data?.message || "Lỗi khi lưu đơn tạm");
    }
  }

  /**
   * Tạo đơn hàng tạm trống khi khởi tạo POS
   * @param {number} storeId - ID cửa hàng (optional)
   * @returns {Promise<Object>} Thông tin đơn tạm trống mới
   */
  async createEmptyDraft(storeId) {
    try {
      const response = await apiClient.post(
        "/api/pos/orders/draft/create-empty",
        {
          store_id: storeId,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error creating empty draft:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi tạo đơn nháp mới",
      );
    }
  }

  /**
   * Lấy danh sách đơn hàng tạm
   * @param {number} storeId - ID cửa hàng (optional)
   * @returns {Promise<Array>} Danh sách đơn tạm
   */
  async getDrafts(storeId) {
    try {
      const params = storeId ? { store_id: storeId } : {};
      const response = await apiClient.get("/api/pos/orders/drafts", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting drafts:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi lấy danh sách đơn tạm",
      );
    }
  }

  /**
   * Lấy chi tiết đơn hàng tạm
   * @param {number} draftId - ID đơn tạm
   * @returns {Promise<Object>} Chi tiết đơn tạm
   */
  async getDraftById(draftId) {
    try {
      const response = await apiClient.get(`/api/pos/orders/drafts/${draftId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting draft details:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi lấy chi tiết đơn tạm",
      );
    }
  }

  /**
   * Cập nhật đơn hàng tạm
   * @param {number} draftId - ID đơn tạm
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Đơn tạm đã cập nhật
   */
  async updateDraft(draftId, updateData) {
    try {
      const response = await apiClient.put(
        `/api/pos/orders/draft/${draftId}`,
        updateData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating draft:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi cập nhật đơn tạm",
      );
    }
  }

  /**
   * Xóa đơn hàng tạm
   * @param {number} draftId - ID đơn tạm
   * @returns {Promise<Object>} Kết quả xóa
   */
  async deleteDraft(draftId) {
    try {
      const response = await apiClient.delete(
        `/api/pos/orders/draft/${draftId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting draft:", error);
      throw new Error(error.response?.data?.message || "Lỗi khi xóa đơn tạm");
    }
  }

  /**
   * Lấy dữ liệu hóa đơn để in
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>} Dữ liệu hóa đơn
   */
  async getReceipt(orderId) {
    try {
      const response = await apiClient.get(
        `/api/pos/orders/${orderId}/receipt`,
      );
      return response.data;
    } catch (error) {
      console.error("Error getting receipt:", error);
      throw new Error(error.response?.data?.message || "Lỗi khi lấy hóa đơn");
    }
  }

  /**
   * Lấy danh sách mã giảm giá đang hoạt động cho POS
   * @param {Object} params - Query parameters
   * @param {number} params.customer_id - ID khách hàng (optional)
   * @param {number} params.order_amount - Tổng tiền đơn hàng (optional)
   * @returns {Promise<Array>} Danh sách mã giảm giá
   */
  async getActiveDiscounts(params = {}) {
    try {
      const response = await apiClient.get("/api/pos/discounts/active", { params });
      return response.data;
    } catch (error) {
      console.error("Error getting active discounts:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi lấy danh sách mã giảm giá",
      );
    }
  }

  /**
   * Kiểm tra mã giảm giá
   * @param {Object} discountData - Dữ liệu mã giảm giá
   * @param {string} discountData.code - Mã giảm giá
   * @param {number} discountData.order_amount - Tổng tiền đơn hàng
   * @param {number} discountData.customer_id - ID khách hàng (optional)
   * @returns {Promise<Object>} Thông tin mã giảm giá
   */
  async validateDiscountCode(discountData) {
    try {
      const response = await apiClient.post(
        "/api/pos/discounts/validate",
        discountData,
      );
      return response.data;
    } catch (error) {
      console.error("Error validating discount:", error);
      throw new Error(
        error.response?.data?.message || "Mã giảm giá không hợp lệ",
      );
    }
  }

  /**
   * Lấy danh sách phương thức thanh toán
   * @returns {Promise<Array>} Danh sách phương thức thanh toán
   */
  async getPaymentMethods() {
    try {
      const response = await apiClient.get("/api/pos/payment-methods");
      return response.data;
    } catch (error) {
      console.error("Error getting payment methods:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi lấy phương thức thanh toán",
      );
    }
  }

  /**
   * Tạo mã QR thanh toán chuyển khoản (VietQR)
   * @param {Object} data - Dữ liệu tạo QR
   * @param {number} data.amount - Số tiền cần thanh toán
   * @param {string} data.order_info - Mã đơn hàng hoặc thông tin
   * @returns {Promise<Object>} Thông tin QR code
   */
  async generateQRCode(data) {
    try {
      const response = await apiClient.post("/api/pos/qr/generate", data);
      return response.data;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi tạo mã QR thanh toán",
      );
    }
  }

  /**
   * Check QR payment status (polling from Sepay webhook data)
   * @param {Object} params - { amount, account_number, transfer_content }
   * @returns {Object} { paid: boolean, transaction?: Object }
   */
  async checkQRPayment(params) {
    try {
      const response = await apiClient.get("/api/pos/qr/check-payment", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error checking QR payment:", error);
      return { success: true, data: { paid: false } };
    }
  }

  /**
   * Print receipt (open in new window or download)
   * @param {number} orderId - ID đơn hàng
   */
  printReceipt(orderId) {
    const printUrl = `${apiClient.defaults.baseURL}/api/pos/orders/${orderId}/receipt?print=1`;
    window.open(printUrl, "_blank", "width=800,height=600,scrollbars=yes");
  }
}

// Export instance
export default new PosService();

// Helper functions để format dữ liệu POS
export const formatPosProduct = (product) => {
  return {
    id: product.variant_id || product.id,
    variant_id: product.variant_id,
    product_id: product.product_id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    price: parseFloat(product.price || 0),
    stock: parseInt(product.stock || 0),
    available: parseInt(product.available || product.stock || 0),
    image: product.image || null,
  };
};

export const formatPosOrderItem = (item) => {
  return {
    variant_id: item.id || item.variant_id,
    quantity: parseInt(item.quantity),
    unit_price: parseFloat(item.price),
    discount_amount: parseFloat(item.discount || 0),
  };
};

export const calculateOrderTotals = (items, discountAmount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.quantity * item.price;
  }, 0);

  const totalDiscount = discountAmount;
  const finalAmount = Math.max(0, subtotal - totalDiscount);

  return {
    subtotal,
    discount: totalDiscount,
    total: finalAmount,
    itemCount: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};
