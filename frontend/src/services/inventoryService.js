import apiClient from "./apiClient";

const inventoryService = {
  // 8.1 Danh sách cửa hàng/kho
  async getStores() {
    const response = await apiClient.get("api/stores");
    return response.data;
  },

  // 8.2 Danh sách loại giao dịch kho
  async getTransactionTypes() {
    const response = await apiClient.get("api/transaction-types");
    return response.data;
  },

  // 8.3 Danh sách tồn kho
  async getInventories(params = {}) {
    const response = await apiClient.get("api/inventories", { params });
    return response.data;
  },

  // 8.4 Chi tiết tồn kho theo variant
  async getInventoryDetail(variantId, storeId = null) {
    const params = storeId ? { store_id: storeId } : {};
    const response = await apiClient.get(`api/inventories/${variantId}`, {
      params,
    });
    return response.data;
  },

  // 8.5 Điều chỉnh tồn kho
  async adjustInventory(variantId, data) {
    const response = await apiClient.put(`api/inventories/${variantId}`, data);
    return response.data;
  },

  // 8.6 Lịch sử xuất nhập kho
  async getInventoryHistory(variantId, params = {}) {
    const response = await apiClient.get(
      `api/inventories/${variantId}/history`,
      {
        params,
      },
    );
    return response.data;
  },

  // 8.7 Nhập kho
  async receiveInventory(data) {
    const response = await apiClient.post("api/inventories/receive", data);
    return response.data;
  },

  // 8.8 Chuyển kho
  async transferInventory(data) {
    const response = await apiClient.post("api/inventories/transfer", data);
    return response.data;
  },

  // 8.9 Trả hàng nhà cung cấp
  async returnInventory(data) {
    const response = await apiClient.post("api/inventories/return", data);
    return response.data;
  },
};

export default inventoryService;
