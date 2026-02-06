/**
 * Order Store - Quản lý orders state
 */
import { defineStore } from "pinia";
import orderService from "@/services/orderService";

export const useOrderStore = defineStore("order", {
  state: () => ({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {
      search: "",
      status: null,
      payment_status: null,
      from_date: null,
      to_date: null,
      sort: "created_at",
      order: "DESC",
    },
    stats: {
      total_orders: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      total_revenue: 0,
    },
  }),

  getters: {
    // Lấy orders theo status
    pendingOrders: (state) =>
      state.orders.filter((o) => o.status === "pending"),
    completedOrders: (state) =>
      state.orders.filter((o) => o.status === "completed"),
    cancelledOrders: (state) =>
      state.orders.filter((o) => o.status === "cancelled"),

    // Lấy orders chưa thanh toán
    unpaidOrders: (state) =>
      state.orders.filter((o) => o.payment_status === "unpaid"),

    // Đếm số lượng orders
    totalOrders: (state) => state.orders.length,

    // Kiểm tra có đang loading không
    isLoading: (state) => state.loading,

    // Lấy order theo ID
    getOrderById: (state) => (id) => {
      return state.orders.find((o) => o.id === id);
    },
  },

  actions: {
    /**
     * Fetch danh sách orders
     */
    async fetchOrders(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams = {
          ...this.filters,
          ...params,
          limit: params.limit || this.pagination.limit,
          offset:
            ((params.page || this.pagination.page) - 1) * this.pagination.limit,
        };

        const response = await orderService.getOrders(queryParams);

        if (response.data.success) {
          this.orders = response.data.data;
          this.pagination = {
            ...this.pagination,
            page: params.page || this.pagination.page,
            total: response.data.pagination?.total || 0,
            totalPages: response.data.pagination?.totalPages || 0,
          };
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi tải danh sách đơn hàng";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch order theo ID
     */
    async fetchOrderById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await orderService.getOrderById(id);

        if (response.data.success) {
          this.currentOrder = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tải đơn hàng";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Tạo order mới
     */
    async createOrder(orderData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await orderService.createOrder(orderData);

        if (response.data.success) {
          this.orders.unshift(response.data.data);
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tạo đơn hàng";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cập nhật order
     */
    async updateOrder(id, orderData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await orderService.updateOrder(id, orderData);

        if (response.data.success) {
          const index = this.orders.findIndex((o) => o.id === id);
          if (index !== -1) {
            this.orders[index] = {
              ...this.orders[index],
              ...response.data.data,
            };
          }

          if (this.currentOrder?.id === id) {
            this.currentOrder = { ...this.currentOrder, ...response.data.data };
          }

          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi cập nhật đơn hàng";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Hủy order
     */
    async cancelOrder(id, reason) {
      this.loading = true;
      this.error = null;

      try {
        const response = await orderService.cancelOrder(id, { reason });

        if (response.data.success) {
          const index = this.orders.findIndex((o) => o.id === id);
          if (index !== -1) {
            this.orders[index].status = "cancelled";
          }

          if (this.currentOrder?.id === id) {
            this.currentOrder.status = "cancelled";
          }

          return { success: true };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi hủy đơn hàng";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch order stats
     */
    async fetchOrderStats(params = {}) {
      try {
        const response = await orderService.getOrderStats(params);
        if (response.data.success) {
          this.stats = response.data.data;
        }
      } catch (error) {
        console.error("Fetch order stats error:", error);
      }
    },

    /**
     * Set filters
     */
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
    },

    /**
     * Reset filters
     */
    resetFilters() {
      this.filters = {
        search: "",
        status: null,
        payment_status: null,
        from_date: null,
        to_date: null,
        sort: "created_at",
        order: "DESC",
      };
    },

    /**
     * Set current order
     */
    setCurrentOrder(order) {
      this.currentOrder = order;
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null;
    },
  },
});
