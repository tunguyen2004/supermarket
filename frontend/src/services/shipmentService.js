import apiClient from "./apiClient";

const shipmentService = {
  // 15.1 Danh sách vận đơn
  async getShipments(params = {}) {
    const response = await apiClient.get("/api/shipments", { params });
    return response;
  },

  // 15.2 Chi tiết vận đơn
  async getShipmentById(id) {
    const response = await apiClient.get(`/api/shipments/${id}`);
    return response;
  },

  // 15.3 Tạo vận đơn
  async createShipment(shipmentData) {
    const response = await apiClient.post("/api/shipments", shipmentData);
    return response;
  },

  // 15.4 Cập nhật vận đơn
  async updateShipment(id, data) {
    const response = await apiClient.put(`/api/shipments/${id}`, data);
    return response;
  },

  // 15.5 Xóa vận đơn
  async deleteShipment(id) {
    const response = await apiClient.delete(`/api/shipments/${id}`);
    return response;
  },

  // 15.6 Cập nhật trạng thái vận đơn
  async updateShipmentStatus(id, statusData) {
    const response = await apiClient.patch(
      `/api/shipments/${id}/status`,
      statusData,
    );
    return response;
  },

  // 15.7 Danh sách trạng thái vận đơn
  async getShipmentStatuses() {
    const response = await apiClient.get("/api/shipment-statuses");
    return response;
  },

  // 15.8 Danh sách đơn vị vận chuyển
  async getCarriers() {
    const response = await apiClient.get("/api/carriers");
    return response;
  },
};

export default shipmentService;
