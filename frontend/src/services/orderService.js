import apiClient from "./apiClient";

const orderService = {
  // 10.1 Danh sách đơn hàng
  async getOrders(params = {}) {
    const response = await apiClient.get("/api/orders", { params });
    return response.data;
  },

  // 10.2 Tạo đơn hàng mới
  async createOrder(orderData) {
    const response = await apiClient.post("/api/orders", orderData);
    return response.data;
  },

  // 10.3 Chi tiết đơn hàng
  async getOrderById(id) {
    const response = await apiClient.get(`/api/orders/${id}`);
    return response.data;
  },

  // 10.4 Cập nhật trạng thái đơn hàng
  async updateOrder(id, data) {
    const response = await apiClient.put(`/api/orders/${id}`, data);
    return response.data;
  },

  // 10.5 Hủy đơn hàng
  async cancelOrder(id, reason) {
    const response = await apiClient.delete(`/api/orders/${id}`, {
      data: { reason },
    });
    return response.data;
  },

  // 10.6 Thống kê đơn hàng (Summary)
  async getOrdersSummary() {
    const response = await apiClient.get("/api/orders/stats/summary");
    return response.data;
  },

  // 10.7 Thống kê chi tiết
  async getOrdersDetailedStats() {
    const response = await apiClient.get("/api/orders/stats/detailed");
    return response.data;
  },

  // DRAFT ORDERS
  // Danh sách đơn nháp
  async getDraftOrders(params = {}) {
    const response = await apiClient.get("/api/orders/drafts", { params });
    return response.data;
  },

  // Tạo đơn nháp
  async createDraftOrder(data) {
    const response = await apiClient.post("/api/orders/drafts", data);
    return response.data;
  },

  // Chuyển đơn nháp thành đơn hàng
  async convertDraftToOrder(id) {
    const response = await apiClient.post(`/api/orders/drafts/${id}/convert`);
    return response.data;
  },

  // Xóa đơn nháp
  async deleteDraftOrder(id) {
    const response = await apiClient.delete(`/api/orders/drafts/${id}`);
    return response.data;
  },

  // ORDER RETURNS
  // Danh sách đơn hoàn trả
  async getReturnOrders(params = {}) {
    const response = await apiClient.get("/api/orders/returns", { params });
    return response.data;
  },

  // Tạo đơn hoàn trả
  async createReturnOrder(orderId, data) {
    const response = await apiClient.post(
      `/api/orders/${orderId}/return`,
      data,
    );
    return response.data;
  },

  // Lấy thông tin hóa đơn để in
  async getOrderInvoice(id) {
    const response = await apiClient.get(`/api/orders/${id}/invoice`);
    return response.data;
  },
};

export default orderService;

// Legacy exports for backward compatibility
export const getOrders = orderService.getOrders;
export const getOrderById = orderService.getOrderById;
export const addOrder = orderService.createOrder;
export const updateOrder = orderService.updateOrder;
export const deleteOrder = orderService.cancelOrder;
