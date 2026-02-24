import apiClient from "./apiClient";

const cashbookService = {
  // 1. Danh sách giao dịch - GET /api/transactions
  async getTransactions(params = {}) {
    const response = await apiClient.get("/api/transactions", { params });
    return response.data;
  },

  // 2. Chi tiết giao dịch - GET /api/transactions/:id
  async getTransactionById(id) {
    const response = await apiClient.get(`/api/transactions/${id}`);
    return response.data;
  },

  // 3. Tạo phiếu thu/chi - POST /api/transactions
  async createTransaction(data) {
    const response = await apiClient.post("/api/transactions", data);
    return response.data;
  },

  // 4. Cập nhật giao dịch - PUT /api/transactions/:id
  async updateTransaction(id, data) {
    const response = await apiClient.put(`/api/transactions/${id}`, data);
    return response.data;
  },

  // 5. Xóa giao dịch - DELETE /api/transactions/:id
  async deleteTransaction(id) {
    const response = await apiClient.delete(`/api/transactions/${id}`);
    return response.data;
  },

  // 6. Thống kê tồn quỹ - GET /api/transactions/summary
  async getSummary(params = {}) {
    const response = await apiClient.get("/api/transactions/summary", {
      params,
    });
    return response.data;
  },

  // 7. Danh sách loại giao dịch - GET /api/cashbook-types
  async getCashbookTypes() {
    const response = await apiClient.get("/api/cashbook-types");
    return response.data;
  },

  // 8. Danh sách phương thức thanh toán - GET /api/payment-methods
  async getPaymentMethods() {
    const response = await apiClient.get("/api/payment-methods");
    return response.data;
  },

  // 9. Duyệt/Từ chối giao dịch - PATCH /api/transactions/:id/approve
  async approveTransaction(id, action) {
    const response = await apiClient.patch(`/api/transactions/${id}/approve`, {
      action,
    });
    return response.data;
  },
};

export default cashbookService;
