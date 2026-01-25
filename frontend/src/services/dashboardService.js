import apiClient from "./apiClient";

export default {
  getOverview() {
    return apiClient.get("/api/dashboard/overview");
  },
  getStats(params) {
    return apiClient.get("/api/dashboard/stats", { params });
  },
  getRevenueChart(params) {
    return apiClient.get("/api/dashboard/revenue-chart", { params });
  },
  getTopProducts(params) {
    return apiClient.get("/api/dashboard/top-products", { params });
  },
  getSalesChannels(params) {
    return apiClient.get("/api/dashboard/sales-channels", { params });
  },
  getTopCustomers(params) {
    return apiClient.get("/api/dashboard/top-customers", { params });
  },
  getLowStock(params) {
    return apiClient.get("/api/dashboard/low-stock", { params });
  },
};
