/**
 * Product Store - Quản lý products state
 */
import { defineStore } from "pinia";
import productService from "@/services/productService";

export const useProductStore = defineStore("product", {
  state: () => ({
    products: [],
    currentProduct: null,
    brands: [],
    units: [],
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
      category_id: null,
      brand_id: null,
      is_active: null,
      sortBy: "created_at",
      order: "DESC",
    },
  }),

  getters: {
    // Lấy products đang active
    activeProducts: (state) => state.products.filter((p) => p.is_active),

    // Lấy products inactive
    inactiveProducts: (state) => state.products.filter((p) => !p.is_active),

    // Đếm số lượng products
    totalProducts: (state) => state.products.length,

    // Kiểm tra có đang loading không
    isLoading: (state) => state.loading,

    // Lấy product theo ID
    getProductById: (state) => (id) => {
      return state.products.find((p) => p.id === id);
    },

    // Lấy products theo brand
    getProductsByBrand: (state) => (brandId) => {
      return state.products.filter((p) => p.brand_id === brandId);
    },
  },

  actions: {
    /**
     * Fetch danh sách products
     */
    async fetchProducts(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams = {
          ...this.filters,
          ...params,
          page: params.page || this.pagination.page,
          limit: params.limit || this.pagination.limit,
        };

        const response = await productService.getProducts(queryParams);

        if (response.data.success) {
          this.products = response.data.data;
          this.pagination = response.data.pagination || this.pagination;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi tải danh sách sản phẩm";
        console.error("Fetch products error:", error);
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch product theo ID
     */
    async fetchProductById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productService.getProductById(id);

        if (response.data.success) {
          this.currentProduct = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tải sản phẩm";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Tạo product mới
     */
    async createProduct(productData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productService.createProduct(productData);

        if (response.data.success) {
          // Thêm vào danh sách
          this.products.unshift(response.data.data);
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tạo sản phẩm";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cập nhật product
     */
    async updateProduct(id, productData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productService.updateProduct(id, productData);

        if (response.data.success) {
          // Cập nhật trong danh sách
          const index = this.products.findIndex((p) => p.id === id);
          if (index !== -1) {
            this.products[index] = {
              ...this.products[index],
              ...response.data.data,
            };
          }

          // Cập nhật currentProduct nếu match
          if (this.currentProduct?.id === id) {
            this.currentProduct = {
              ...this.currentProduct,
              ...response.data.data,
            };
          }

          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi cập nhật sản phẩm";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Xóa product
     */
    async deleteProduct(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productService.deleteProduct(id);

        if (response.data.success) {
          // Xóa khỏi danh sách
          this.products = this.products.filter((p) => p.id !== id);
          return { success: true };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi xóa sản phẩm";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Bulk update status
     */
    async bulkUpdateStatus(productIds, isActive) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productService.bulkUpdateStatus({
          product_ids: productIds,
          is_active: isActive,
        });

        if (response.data.success) {
          // Cập nhật trong danh sách
          productIds.forEach((id) => {
            const index = this.products.findIndex((p) => p.id === id);
            if (index !== -1) {
              this.products[index].is_active = isActive;
            }
          });

          return { success: true };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi cập nhật trạng thái";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch brands
     */
    async fetchBrands() {
      try {
        const response = await productService.getBrands();
        if (response.data.success) {
          this.brands = response.data.data;
        }
      } catch (error) {
        console.error("Fetch brands error:", error);
      }
    },

    /**
     * Fetch units
     */
    async fetchUnits() {
      try {
        const response = await productService.getUnits();
        if (response.data.success) {
          this.units = response.data.data;
        }
      } catch (error) {
        console.error("Fetch units error:", error);
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
        category_id: null,
        brand_id: null,
        is_active: null,
        sortBy: "created_at",
        order: "DESC",
      };
    },

    /**
     * Set current product
     */
    setCurrentProduct(product) {
      this.currentProduct = product;
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null;
    },
  },
});
