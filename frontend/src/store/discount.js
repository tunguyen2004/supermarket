/**
 * Discount Store - Quản lý khuyến mại
 */
import { defineStore } from "pinia";
import discountService from "@/services/discountService";

export const useDiscountStore = defineStore("discount", {
  state: () => ({
    discounts: [],
    currentDiscount: null,
    discountTypes: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  }),

  getters: {
    // Lọc khuyến mại theo status
    activeDiscounts: (state) => {
      return state.discounts.filter((d) => d.status === "active");
    },

    expiredDiscounts: (state) => {
      return state.discounts.filter((d) => d.status === "expired");
    },

    upcomingDiscounts: (state) => {
      return state.discounts.filter((d) => d.status === "upcoming");
    },
  },

  actions: {
    /**
     * Lấy danh sách khuyến mại
     */
    async fetchDiscounts(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await discountService.getDiscounts(params);
        console.log("Discount API Response:", response.data); // Debug log

        // Xử lý cả trường hợp có và không có success field
        if (response.data.success || response.data.data) {
          this.discounts = response.data.data || [];
          this.pagination = response.data.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          };
          return { success: true, data: this.discounts };
        } else {
          this.discounts = [];
          return { success: false, error: "No data returned" };
        }
      } catch (error) {
        console.error("Discount API Error:", error);
        this.error =
          error.response?.data?.message || "Lỗi khi tải danh sách khuyến mại";
        this.discounts = [];
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Lấy chi tiết khuyến mại
     */
    async fetchDiscountById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await discountService.getDiscountById(id);

        if (response.data.success) {
          this.currentDiscount = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi tải thông tin khuyến mại";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Tạo khuyến mại mới
     */
    async createDiscount(discountData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await discountService.createDiscount(discountData);

        if (response.data.success) {
          // Refresh list
          await this.fetchDiscounts({ page: this.pagination.page });
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
     * Cập nhật khuyến mại
     */
    async updateDiscount(id, discountData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await discountService.updateDiscount(id, discountData);

        if (response.data.success) {
          // Update in list
          const index = this.discounts.findIndex((d) => d.id === id);
          if (index !== -1) {
            this.discounts[index] = response.data.data;
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
     * Xóa khuyến mại
     */
    async deleteDiscount(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await discountService.deleteDiscount(id);

        if (response.data.success) {
          // Remove from list
          this.discounts = this.discounts.filter((d) => d.id !== id);
          this.pagination.total -= 1;
          return { success: true, message: response.data.message };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi xóa khuyến mại";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Kết thúc khuyến mại
     */
    async deactivateDiscount(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await discountService.deactivateDiscount(id);

        if (response.data.success) {
          // Update status in list
          const index = this.discounts.findIndex((d) => d.id === id);
          if (index !== -1) {
            this.discounts[index].status = "expired";
            this.discounts[index].is_active = false;
          }
          return { success: true, message: response.data.message };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi kết thúc khuyến mại";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Validate mã khuyến mại
     */
    async validateDiscount(validationData) {
      try {
        const response = await discountService.validateDiscount(validationData);
        return {
          success: response.data.success,
          valid: response.data.valid,
          data: response.data.data,
          message: response.data.message,
        };
      } catch (error) {
        return {
          success: false,
          valid: false,
          error:
            error.response?.data?.message || "Lỗi khi validate mã khuyến mại",
        };
      }
    },

    /**
     * Lấy danh sách loại khuyến mại
     */
    async fetchDiscountTypes() {
      try {
        const response = await discountService.getDiscountTypes();
        if (response.data.success) {
          this.discountTypes = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Lỗi khi tải danh sách loại khuyến mại";
        return { success: false, error: this.error };
      }
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null;
    },
  },
});
