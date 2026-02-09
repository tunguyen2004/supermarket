import apiClient from "./apiClient";

const checkoutService = {
  // Lấy danh sách đơn chưa hoàn tất
  async getCheckouts(params = {}) {
    const response = await apiClient.get("/api/checkouts", { params });
    return response.data;
  },

  // Chi tiết đơn chưa hoàn tất
  async getCheckoutById(id) {
    const response = await apiClient.get(`/api/checkouts/${id}`);
    return response.data;
  },

  // Gửi link thanh toán
  async sendPaymentLink(id, data = {}) {
    const response = await apiClient.post(
      `/api/checkouts/${id}/send-link`,
      data,
    );
    return response.data;
  },

  // Gửi email hàng loạt
  async sendMassEmail(data = {}) {
    const response = await apiClient.post("/api/checkouts/mass-email", data);
    return response.data;
  },

  // Xóa đơn chưa hoàn tất
  async deleteCheckout(id) {
    const response = await apiClient.delete(`/api/checkouts/${id}`);
    return response.data;
  },
};

export default checkoutService;
