/**
 * Discount Store - Quản lý khuyến mại
 */
import { defineStore } from "pinia";
import salesService from "@/services/salesService";

export const useDiscountStore = defineStore("discount", {
  state: () => ({
    discounts: [],
    currentDiscount: null,
    discountTypes: [],
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
      status: null, // 'active', 'expired', 'upcoming', 'inactive'
      discount_type: null,
    },
  }),

  getters: {
    // Lấy discounts đang active
    activeDiscounts: (state) =>
      state.discounts.filter((d) => d.status === "active"),

    // Lấy discounts sắp hết hạn
    expiringSoonDiscounts: (state) => {
      const now = new Date();
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      return state.discounts.filter((d) => {
        const endDate = new Date(d.end_date);
        return (
          d.status === "active" && endDate <= threeDaysLater && endDate > now
        );
      });
    },

    // Đếm số lượng
    totalDiscounts: (state) => state.discounts.length,
    activeCount: (state) =>
      state.discounts.filter((d) => d.status === "active").length,

    // Kiểm tra có đang loading không
    isLoading: (state) => state.loading,
  },

  actions: {
    /**
     * Fetch danh sách discounts
     */
    async fetchDiscounts(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams = {
          ...this.filters,
          ...params,
          page: params.page || this.pagination.page,
          limit: params.limit || this.pagination.limit,
        };

        const response = await salesService.getDiscounts(queryParams);

        if (response.data.success) {
          this.discounts = response.data.data;
          this.pagination = response.data.pagination || this.pagination;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi tải danh sách khuyến mại";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch discount theo ID
     */
    async fetchDiscountById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await salesService.getDiscountById(id);

        if (response.data.success) {
          this.currentDiscount = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tải khuyến mại";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Tạo discount mới
     */
    async createDiscount(discountData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await salesService.createDiscount(discountData);

        if (response.data.success) {
          this.discounts.unshift(response.data.data);
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tạo khuyến mại";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cập nhật discount
     */
    async updateDiscount(id, discountData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await salesService.updateDiscount(id, discountData);

        if (response.data.success) {
          const index = this.discounts.findIndex((d) => d.id === id);
          if (index !== -1) {
            this.discounts[index] = {
              ...this.discounts[index],
              ...response.data.data,
            };
          }

          if (this.currentDiscount?.id === id) {
            this.currentDiscount = {
              ...this.currentDiscount,
              ...response.data.data,
            };
          }

          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi cập nhật khuyến mại";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Xóa discount
     */
    async deleteDiscount(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await salesService.deleteDiscount(id);

        if (response.data.success) {
          this.discounts = this.discounts.filter((d) => d.id !== id);
          return { success: true };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi xóa khuyến mại";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Validate discount code
     */
    async validateDiscount(code, orderData = {}) {
      try {
        const response = await salesService.validateDiscount({
          code,
          ...orderData,
        });

        if (response.data.success) {
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || "Mã giảm giá không hợp lệ",
        };
      }
    },

    /**
     * Fetch discount types
     */
    async fetchDiscountTypes() {
      try {
        const response = await salesService.getDiscountTypes();
        if (response.data.success) {
          this.discountTypes = response.data.data;
        }
      } catch (error) {
        console.error("Fetch discount types error:", error);
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
        discount_type: null,
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
