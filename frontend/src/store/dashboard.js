/**
 * Dashboard Store - Quản lý dữ liệu dashboard
 */
import { defineStore } from "pinia";
import dashboardService from "@/services/dashboardService";

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    overview: {},
    stats: {},
    recentOrders: [],
    topProducts: [],
    topCustomers: [],
    lowStock: [],
    revenueChart: null,
    salesChannelChart: null,
    loading: false,
    error: null,
    chartGroupBy: "day", // day, week, month
  }),

  getters: {
    // Tổng doanh thu
    totalRevenue: (state) => state.overview.totalRevenue || 0,

    // Tổng đơn hàng
    totalOrders: (state) => state.overview.totalOrders || 0,

    // Số khách hàng
    totalCustomers: (state) => state.overview.totalCustomers || 0,

    // Giá trị đơn trung bình
    avgOrderValue: (state) => state.overview.avgOrderValue || 0,

    // Số lượng sản phẩm sắp hết hàng
    lowStockCount: (state) => state.lowStock.length,

    // Kiểm tra có đang loading không
    isLoading: (state) => state.loading,
  },

  actions: {
    /**
     * Fetch overview data
     */
    async fetchOverview() {
      this.loading = true;
      this.error = null;

      try {
        const response = await dashboardService.getOverview();

        if (response.data.success) {
          this.overview = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi tải dữ liệu tổng quan";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch sales stats
     */
    async fetchStats(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await dashboardService.getSalesStats(params);

        if (response.data.success) {
          this.stats = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tải thống kê";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch recent orders
     */
    async fetchRecentOrders(limit = 10) {
      try {
        const response = await dashboardService.getRecentOrders({ limit });

        if (response.data.success) {
          this.recentOrders = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        console.error("Fetch recent orders error:", error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Fetch top products
     */
    async fetchTopProducts(params = {}) {
      try {
        const response = await dashboardService.getTopProducts(params);

        if (response.data.success) {
          this.topProducts = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        console.error("Fetch top products error:", error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Fetch top customers
     */
    async fetchTopCustomers(params = {}) {
      try {
        const response = await dashboardService.getTopCustomers(params);

        if (response.data.success) {
          this.topCustomers = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        console.error("Fetch top customers error:", error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Fetch low stock products
     */
    async fetchLowStock(params = {}) {
      try {
        const response = await dashboardService.getLowStockProducts(params);

        if (response.data.success) {
          this.lowStock = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        console.error("Fetch low stock error:", error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Fetch all dashboard data
     */
    async fetchAllData() {
      this.loading = true;

      try {
        await Promise.all([
          this.fetchOverview(),
          this.fetchStats({ group_by: this.chartGroupBy }),
          this.fetchRecentOrders(10),
          this.fetchTopProducts({ limit: 5 }),
          this.fetchTopCustomers({ limit: 5 }),
          this.fetchLowStock({ limit: 10 }),
        ]);

        return { success: true };
      } catch (error) {
        this.error = "Lỗi khi tải dữ liệu dashboard";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Set chart group by
     */
    setChartGroupBy(value) {
      this.chartGroupBy = value;
      this.fetchStats({ group_by: value });
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null;
    },

    /**
     * Reset state
     */
    reset() {
      this.overview = {};
      this.stats = {};
      this.recentOrders = [];
      this.topProducts = [];
      this.topCustomers = [];
      this.lowStock = [];
      this.error = null;
    },
  },
});
