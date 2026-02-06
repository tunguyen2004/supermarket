/**
 * Inventory Store - Quản lý inventory state
 */
import { defineStore } from "pinia";
import inventoryService from "@/services/inventoryService";

export const useInventoryStore = defineStore("inventory", {
  state: () => ({
    inventories: [],
    currentInventory: null,
    stores: [],
    transactionTypes: [],
    history: [],
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
      store_id: null,
      status: null, // 'low', 'normal', 'high', 'out'
    },
  }),

  getters: {
    // Lấy inventories theo status
    lowStockItems: (state) =>
      state.inventories.filter((i) => i.stock_status === "low"),
    outOfStockItems: (state) =>
      state.inventories.filter((i) => i.stock_status === "out"),

    // Đếm số lượng
    totalItems: (state) => state.inventories.length,
    lowStockCount: (state) =>
      state.inventories.filter((i) => i.stock_status === "low").length,
    outOfStockCount: (state) =>
      state.inventories.filter((i) => i.stock_status === "out").length,

    // Kiểm tra có đang loading không
    isLoading: (state) => state.loading,

    // Lấy inventory theo variant ID và store
    getInventoryByVariantAndStore: (state) => (variantId, storeId) => {
      return state.inventories.find(
        (i) => i.id === variantId && i.store_id === storeId,
      );
    },
  },

  actions: {
    /**
     * Fetch danh sách inventories
     */
    async fetchInventories(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams = {
          ...this.filters,
          ...params,
          page: params.page || this.pagination.page,
          limit: params.limit || this.pagination.limit,
        };

        const response = await inventoryService.getInventories(queryParams);

        if (response.data.success) {
          this.inventories = response.data.data;
          this.pagination = response.data.pagination || this.pagination;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi tải danh sách tồn kho";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch inventory theo variant ID
     */
    async fetchInventoryById(variantId, storeId = null) {
      this.loading = true;
      this.error = null;

      try {
        const response = await inventoryService.getInventoryById(variantId, {
          store_id: storeId,
        });

        if (response.data.success) {
          this.currentInventory = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tải tồn kho";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Điều chỉnh tồn kho
     */
    async adjustInventory(variantId, adjustmentData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await inventoryService.updateInventory(
          variantId,
          adjustmentData,
        );

        if (response.data.success) {
          // Cập nhật trong danh sách nếu có
          const index = this.inventories.findIndex(
            (i) => i.id === variantId && i.store_id === adjustmentData.store_id,
          );
          if (index !== -1) {
            this.inventories[index].stock = response.data.data.new_stock;
          }

          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi điều chỉnh tồn kho";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Nhập kho
     */
    async receiveInventory(receiveData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await inventoryService.receiveInventory(receiveData);

        if (response.data.success) {
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi nhập kho";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Chuyển kho
     */
    async transferStock(transferData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await inventoryService.transferStock(transferData);

        if (response.data.success) {
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi chuyển kho";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Trả hàng nhà cung cấp
     */
    async returnToSupplier(returnData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await inventoryService.returnToSupplier(returnData);

        if (response.data.success) {
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi trả hàng";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch lịch sử xuất nhập kho
     */
    async fetchInventoryHistory(variantId, params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await inventoryService.getInventoryHistory(
          variantId,
          params,
        );

        if (response.data.success) {
          this.history = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tải lịch sử";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch stores
     */
    async fetchStores() {
      try {
        const response = await inventoryService.getStores();
        if (response.data.success) {
          this.stores = response.data.data;
        }
      } catch (error) {
        console.error("Fetch stores error:", error);
      }
    },

    /**
     * Fetch transaction types
     */
    async fetchTransactionTypes() {
      try {
        const response = await inventoryService.getTransactionTypes();
        if (response.data.success) {
          this.transactionTypes = response.data.data;
        }
      } catch (error) {
        console.error("Fetch transaction types error:", error);
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
        store_id: null,
        status: null,
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
