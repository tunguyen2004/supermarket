/**
 * POS Store - Quản lý Point of Sale (Bán hàng tại quầy)
 */
import { defineStore } from "pinia";
import catalogService from "@/services/catalogService";
import orderService from "@/services/orderService";

export const usePosStore = defineStore("pos", {
  state: () => ({
    // Tabs quản lý nhiều đơn hàng
    orderTabs: [
      {
        id: 1,
        name: "Đơn hàng #1",
        items: [],
        customer: null,
        discount: null,
      },
    ],
    activeTabId: 1,
    nextTabId: 2,

    // Search
    searchQuery: "",
    searchResults: [],
    searching: false,

    // Products
    products: [],
    productsLoading: false,

    // Customer
    customerSearchModal: false,

    // Payment
    paymentDrawer: false,

    // Error
    error: null,
  }),

  getters: {
    // Lấy order đang active
    currentOrder: (state) => {
      return (
        state.orderTabs.find((tab) => tab.id === state.activeTabId) ||
        state.orderTabs[0]
      );
    },

    // Tổng số lượng sản phẩm trong giỏ
    cartItemCount: (state) => {
      const current = state.orderTabs.find(
        (tab) => tab.id === state.activeTabId,
      );
      return current
        ? current.items.reduce((sum, item) => sum + item.quantity, 0)
        : 0;
    },

    // Tính tổng tiền chưa giảm giá
    subtotal: (state) => {
      const current = state.orderTabs.find(
        (tab) => tab.id === state.activeTabId,
      );
      if (!current) return 0;
      return current.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    },

    // Tính tiền giảm giá
    discountAmount() {
      const current = this.currentOrder;
      if (!current?.discount) return 0;

      const subtotal = this.subtotal;
      if (current.discount.type === "percentage") {
        return (subtotal * current.discount.value) / 100;
      }
      return current.discount.value;
    },

    // Tổng tiền sau giảm giá
    total() {
      return Math.max(0, this.subtotal - this.discountAmount);
    },

    // Kiểm tra giỏ hàng có trống không
    isCartEmpty: (state) => {
      const current = state.orderTabs.find(
        (tab) => tab.id === state.activeTabId,
      );
      return !current || current.items.length === 0;
    },
  },

  actions: {
    /**
     * Thêm tab đơn hàng mới
     */
    addNewOrder() {
      const newTab = {
        id: this.nextTabId++,
        name: `Đơn hàng #${this.nextTabId - 1}`,
        items: [],
        customer: null,
        discount: null,
      };
      this.orderTabs.push(newTab);
      this.activeTabId = newTab.id;
    },

    /**
     * Chọn tab đơn hàng
     */
    selectOrder(tabId) {
      this.activeTabId = tabId;
    },

    /**
     * Đóng tab đơn hàng
     */
    closeOrder(tabId) {
      const index = this.orderTabs.findIndex((tab) => tab.id === tabId);
      if (index === -1 || this.orderTabs.length === 1) return;

      this.orderTabs.splice(index, 1);

      // Chuyển sang tab khác nếu đang đóng tab active
      if (this.activeTabId === tabId) {
        this.activeTabId = this.orderTabs[Math.max(0, index - 1)].id;
      }
    },

    /**
     * Thêm sản phẩm vào giỏ
     */
    addToCart(product, quantity = 1) {
      const current = this.orderTabs.find((tab) => tab.id === this.activeTabId);
      if (!current) return;

      const existingItem = current.items.find(
        (item) => item.variantId === product.variantId,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        current.items.push({
          variantId: product.variantId,
          productId: product.productId,
          name: product.name,
          variantName: product.variantName,
          barcode: product.barcode,
          price: product.price,
          quantity: quantity,
          imageUrl: product.imageUrl,
        });
      }
    },

    /**
     * Cập nhật số lượng sản phẩm
     */
    updateQuantity(variantId, quantity) {
      const current = this.orderTabs.find((tab) => tab.id === this.activeTabId);
      if (!current) return;

      const item = current.items.find((i) => i.variantId === variantId);
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(variantId);
        } else {
          item.quantity = quantity;
        }
      }
    },

    /**
     * Xóa sản phẩm khỏi giỏ
     */
    removeFromCart(variantId) {
      const current = this.orderTabs.find((tab) => tab.id === this.activeTabId);
      if (!current) return;

      current.items = current.items.filter(
        (item) => item.variantId !== variantId,
      );
    },

    /**
     * Xóa toàn bộ giỏ hàng
     */
    clearCart() {
      const current = this.orderTabs.find((tab) => tab.id === this.activeTabId);
      if (current) {
        current.items = [];
        current.customer = null;
        current.discount = null;
      }
    },

    /**
     * Set khách hàng cho đơn hàng
     */
    setCustomer(customer) {
      const current = this.orderTabs.find((tab) => tab.id === this.activeTabId);
      if (current) {
        current.customer = customer;
      }
    },

    /**
     * Set discount cho đơn hàng
     */
    setDiscount(discount) {
      const current = this.orderTabs.find((tab) => tab.id === this.activeTabId);
      if (current) {
        current.discount = discount;
      }
    },

    /**
     * Tìm kiếm sản phẩm
     */
    async searchProducts(query) {
      if (!query || query.trim().length < 2) {
        this.searchResults = [];
        return;
      }

      this.searching = true;
      this.searchQuery = query;

      try {
        const response = await catalogService.searchProducts({
          search: query,
          limit: 20,
        });

        if (response.data.success) {
          this.searchResults = response.data.data;
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi tìm kiếm sản phẩm";
        return { success: false, error: this.error };
      } finally {
        this.searching = false;
      }
    },

    /**
     * Tìm kiếm theo barcode
     */
    async searchByBarcode(barcode) {
      this.searching = true;

      try {
        const response = await catalogService.getProductByBarcode(barcode);

        if (response.data.success) {
          const product = response.data.data;
          this.addToCart(product, 1);
          return { success: true, data: product };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Không tìm thấy sản phẩm";
        return { success: false, error: this.error };
      } finally {
        this.searching = false;
      }
    },

    /**
     * Tạo đơn hàng (thanh toán)
     */
    async createOrder(paymentData) {
      const current = this.orderTabs.find((tab) => tab.id === this.activeTabId);
      if (!current || current.items.length === 0) {
        return { success: false, error: "Giỏ hàng trống" };
      }

      try {
        const orderData = {
          customer_id: current.customer?.customer_id,
          items: current.items.map((item) => ({
            product_variant_id: item.variantId,
            quantity: item.quantity,
            unit_price: item.price,
          })),
          discount_id: current.discount?.discount_id,
          ...paymentData,
        };

        const response = await orderService.createOrder(orderData);

        if (response.data.success) {
          // Clear giỏ hàng sau khi tạo đơn thành công
          this.clearCart();
          return { success: true, data: response.data.data };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tạo đơn hàng";
        return { success: false, error: this.error };
      }
    },

    /**
     * Toggle customer search modal
     */
    toggleCustomerModal(show) {
      this.customerSearchModal = show;
    },

    /**
     * Toggle payment drawer
     */
    togglePaymentDrawer(show) {
      this.paymentDrawer = show;
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null;
    },

    /**
     * Reset POS state
     */
    reset() {
      this.orderTabs = [
        {
          id: 1,
          name: "Đơn hàng #1",
          items: [],
          customer: null,
          discount: null,
        },
      ];
      this.activeTabId = 1;
      this.nextTabId = 2;
      this.searchQuery = "";
      this.searchResults = [];
      this.error = null;
    },
  },
});
