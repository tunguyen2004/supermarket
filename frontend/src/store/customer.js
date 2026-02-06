/**
 * Customer Store - Quản lý customers state
 */
import { defineStore } from "pinia";
import customerService from "@/services/customerService";

export const useCustomerStore = defineStore("customer", {
  state: () => ({
    customers: [],
    currentCustomer: null,
    customerGroups: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    filters: {
      search: "",
      group_id: null,
      sortBy: "created_at",
      order: "DESC",
    },
  }),

  getters: {
    // Lấy customers theo group
    getCustomersByGroup: (state) => (groupId) => {
      return state.customers.filter((c) => c.group_id === groupId);
    },

    // Đếm số lượng customers
    totalCustomers: (state) => state.customers.length,

    // Kiểm tra có đang loading không
    isLoading: (state) => state.loading,

    // Lấy customer theo ID
    getCustomerById: (state) => (id) => {
      return state.customers.find((c) => c.id === id);
    },

    // Tìm customer theo phone
    findByPhone: (state) => (phone) => {
      return state.customers.find((c) => c.phone === phone);
    },
  },

  actions: {
    /**
     * Fetch danh sách customers
     */
    async fetchCustomers(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams = {
          ...this.filters,
          ...params,
          page: params.page || this.pagination.page,
          limit: params.limit || this.pagination.limit,
        };

        const response = await customerService.getCustomers(queryParams);

        if (response.data.success) {
          this.customers = response.data.data;
          this.pagination = response.data.pagination || this.pagination;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi tải danh sách khách hàng";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Tìm kiếm nhanh customer (cho POS)
     */
    async quickSearch(query) {
      try {
        const response = await customerService.quickSearch(query);
        if (response.data.success) {
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    /**
     * Fetch customer theo ID
     */
    async fetchCustomerById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await customerService.getCustomerById(id);

        if (response.data.success) {
          this.currentCustomer = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tải khách hàng";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Tạo customer mới
     */
    async createCustomer(customerData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await customerService.createCustomer(customerData);

        if (response.data.success) {
          this.customers.unshift(response.data.data);
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tạo khách hàng";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cập nhật customer
     */
    async updateCustomer(id, customerData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await customerService.updateCustomer(id, customerData);

        if (response.data.success) {
          const index = this.customers.findIndex((c) => c.id === id);
          if (index !== -1) {
            this.customers[index] = {
              ...this.customers[index],
              ...response.data.data,
            };
          }

          if (this.currentCustomer?.id === id) {
            this.currentCustomer = {
              ...this.currentCustomer,
              ...response.data.data,
            };
          }

          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi cập nhật khách hàng";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Xóa customer
     */
    async deleteCustomer(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await customerService.deleteCustomer(id);

        if (response.data.success) {
          this.customers = this.customers.filter((c) => c.id !== id);
          return { success: true };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi xóa khách hàng";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch customer groups
     */
    async fetchCustomerGroups() {
      try {
        const response = await customerService.getCustomerGroups();
        if (response.data.success) {
          this.customerGroups = response.data.data;
        }
      } catch (error) {
        console.error("Fetch customer groups error:", error);
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
        group_id: null,
        sortBy: "created_at",
        order: "DESC",
      };
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null;
    },
  },
});
