<template>
  <div class="pos-page">
    <!-- Header -->
    <PosTopbar
      :tabs="orderTabs"
      :activeId="activeTabId"
      :searchResults="productSearchResults"
      :isSearching="isSearchingProducts"
      :storeName="currentStoreName"
      @add="addNewOrder"
      @select="selectOrder"
      @close="closeOrder"
      @search="handleTopbarSearch"
      @selectProduct="addToCart"
      @clearSearch="clearSearchResults"
    />

    <!-- Main Content: 2 Columns -->
    <div class="pos-main">
      <!-- LEFT COLUMN: Cart Items (~70%) -->
      <div class="left-column">
        <div class="cart-panel">
          <!-- Cart Header -->
          <div class="cart-header">
            <h2 class="cart-title">
              Sản phẩm ({{ currentOrder.items.length }})
            </h2>
            <button class="btn-split-line">
              <span class="mr-1"><i class="fa-solid fa-clipboard"></i></span>
              Tách dòng sản phẩm
            </button>
          </div>

          <!-- Cart Items List -->
          <div class="cart-body">
            <div v-if="currentOrder.items.length === 0" class="empty-state">
              <div class="empty-icon text-2xl">
                <i class="fa-solid fa-box"></i>
              </div>
              <p class="empty-title">Bạn chưa thêm sản phẩm nào</p>
              <p class="empty-subtitle">
                Nhập tên sản phẩm vào ô tìm kiếm ở header hoặc ấn
                <kbd class="kbd">F3</kbd> để focus
              </p>
            </div>

            <table v-else class="cart-table">
              <thead>
                <tr>
                  <th class="col-product">Sản phẩm</th>
                  <th class="col-price">Đơn giá</th>
                  <th class="col-quantity">Số lượng</th>
                  <th class="col-total">Thành tiền</th>
                  <th class="col-action"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in currentOrder.items"
                  :key="index"
                  class="cart-row"
                >
                  <!-- Product Info -->
                  <td class="product-cell">
                    <div class="product-row">
                      <div class="product-thumbnail">
                        <img
                          v-if="item.image"
                          :src="item.image"
                          :alt="item.name"
                        />
                        <span v-else>📦</span>
                      </div>
                      <div class="product-details">
                        <div class="product-name">{{ item.name }}</div>
                        <div class="product-meta">
                          <span class="product-unit">Đơn vị: Cái</span>
                          <input
                            type="text"
                            placeholder="Ghi chú..."
                            class="product-note-input"
                          />
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Unit Price -->
                  <td class="price-cell">
                    <div class="price-value">
                      {{ formatPrice(item.unit_price || item.price) }}
                    </div>
                  </td>

                  <!-- Quantity Controls -->
                  <td class="quantity-cell">
                    <div class="qty-controls">
                      <button class="qty-btn" @click="decreaseQuantity(index)">
                        −
                      </button>
                      <input
                        type="number"
                        class="qty-input"
                        v-model.number="item.quantity"
                        @change="updateQuantity(index, item.quantity)"
                        min="1"
                      />
                      <button class="qty-btn" @click="increaseQuantity(index)">
                        +
                      </button>
                    </div>
                  </td>

                  <!-- Total Price -->
                  <td class="total-cell">
                    <div class="total-value">
                      {{
                        formatPrice(
                          (item.unit_price || item.price) * item.quantity,
                        )
                      }}
                    </div>
                  </td>

                  <!-- Remove Button -->
                  <td class="action-cell">
                    <button
                      class="btn-remove-item"
                      @click="removeFromCart(index)"
                      title="Xóa"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer Bar -->
        <div class="footer-bar">
          <div class="footer-left">
            <!-- Quick Actions -->
            <button class="footer-btn">
              <div class="footer-btn-icon">
                <i class="fa-regular fa-file-lines"></i>
              </div>
              <div class="footer-btn-text">
                <div class="footer-btn-title">Sapo Invoice</div>
                <div class="footer-btn-subtitle">Cần thiết lập mẫu hóa đơn</div>
              </div>
            </button>

            <button class="footer-btn">
              <div class="footer-btn-icon">
                <i class="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <div class="footer-btn-text">
                <div class="footer-btn-title">Quản lý công nợ</div>
                <div class="footer-btn-subtitle">Chưa thêm khách hàng</div>
              </div>
            </button>
          </div>

          <div class="footer-center">
            <input
              type="text"
              placeholder="Nhập ghi chú đơn hàng"
              class="footer-note-input"
              v-model="currentOrder.notes"
            />
          </div>

          <div class="footer-right">
            <!-- Draft Orders -->
            <button
              class="footer-icon-btn"
              @click="showDraftListModal = true"
              :disabled="isLoadingDrafts"
              title="Đơn nháp"
            >
              <i
                class="fa-regular fa-file"
                :class="{ 'fa-spin': isLoadingDrafts }"
              ></i>
              <span class="footer-icon-label">Đơn nháp</span>
              <span v-if="draftOrders.length" class="footer-badge">{{
                draftOrders.length
              }}</span>
            </button>

            <!-- Save Draft Button -->
            <button
              class="footer-icon-btn"
              @click="saveDraft"
              :disabled="currentOrder.items.length === 0"
              title="Lưu nháp (F7)"
            >
              <i class="fa-regular fa-floppy-disk"></i>
              <span class="footer-icon-label">Lưu nháp</span>
            </button>

            <!-- Divider -->
            <div class="footer-divider"></div>

            <!-- Staff -->
            <div class="footer-staff">
              <i class="fa-regular fa-user footer-staff-icon"></i>
              <select class="footer-select" v-model="selectedStaff">
                <option value="admin">Admin dohuyy</option>
                <option value="staff1">Nhân viên 1</option>
                <option value="staff2">Nhân viên 2</option>
              </select>
            </div>

            <!-- Divider -->
            <div class="footer-divider"></div>

            <!-- Custom Product -->
            <button class="footer-accent-btn" title="Sản phẩm tuỳ chỉnh (F2)">
              <i class="fa-solid fa-plus"></i>
              <span>Sản phẩm tuỳ chỉnh</span>
              <kbd class="footer-kbd">F2</kbd>
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Payment Panel (~30%) -->
      <div class="right-column">
        <!-- Customer Search -->
        <div class="payment-section customer-section">
          <CustomerPicker
            v-model="selectedCustomer"
            @openCreateCustomer="showCustomerModal = true"
          />

          <div v-if="selectedCustomer" class="selected-customer">
            <div class="customer-avatar">
              {{ selectedCustomer.name.charAt(0) }}
            </div>
            <div class="customer-info">
              <div class="customer-name">{{ selectedCustomer.name }}</div>
              <div class="customer-phone">{{ selectedCustomer.phone }}</div>
            </div>
            <button
              class="btn-remove-customer"
              @click="selectedCustomer = null"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Payment Summary -->
        <div class="payment-section summary-section">
          <div class="summary-title">Tổng kết</div>

          <div class="summary-rows">
            <div class="summary-row">
              <span class="summary-label">Tổng tiền hàng</span>
              <span class="summary-value">{{ formatPrice(subtotal) }}</span>
            </div>

            <div class="summary-row discount-row">
              <span class="summary-label">Giảm giá</span>
              <button class="btn-discount" @click="showDiscountModal = true">
                <span class="mr-1">⚙️</span>
                <kbd class="kbd">F6</kbd>
              </button>
              <span class="summary-value discount-value">
                -{{ formatPrice(discount) }}
              </span>
            </div>

            <div class="summary-row total-row">
              <span class="total-label">Khách phải trả</span>
              <span class="total-value">{{ formatPrice(total) }}</span>
            </div>
          </div>

          <!-- Checkout Button -->
          <button
            class="btn-checkout-main mt-[250px]"
            :disabled="currentOrder.items.length === 0"
            @click="checkout"
          >
            <span class="text-lg mr-2">✓</span>
            <span>Thanh toán</span>
          </button>

          <!-- Auto Print Checkbox -->
          <label class="auto-print-checkbox">
            <input type="checkbox" v-model="autoPrint" />
            <span>In hoá đơn tự động</span>
            <kbd class="kbd ml-auto">F10</kbd>
          </label>
        </div>
      </div>
    </div>

    <!-- Discount Modal -->
    <el-dialog
      v-model="showDiscountModal"
      title="Giảm giá đơn hàng"
      width="450px"
    >
      <div class="space-y-4">
        <!-- Discount Code Section -->
        <div>
          <label class="block text-sm font-medium mb-2">Mã giảm giá</label>
          <el-input
            v-model="currentOrder.discountCode"
            placeholder="Nhập mã giảm giá (tùy chọn)"
            clearable
          />
          <p class="text-xs text-gray-500 mt-1">
            Để trống nếu muốn áp dụng giảm giá trực tiếp
          </p>
        </div>

        <!-- Manual Discount Section -->
        <div>
          <label class="block text-sm font-medium mb-2">Loại giảm giá</label>
          <el-radio-group v-model="discountType">
            <el-radio label="percent">Phần trăm (%)</el-radio>
            <el-radio label="fixed">Số tiền cố định</el-radio>
          </el-radio-group>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Giá trị giảm</label>
          <el-input-number
            v-model="discountValue"
            :min="0"
            :max="discountType === 'percent' ? 100 : subtotal"
            style="width: 100%"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="showDiscountModal = false">Hủy</el-button>
        <el-button type="primary" @click="applyDiscount">Áp dụng</el-button>
      </template>
    </el-dialog>

    <!-- Customer Create Modal -->
    <CustomerCreateModal
      v-model="showCustomerModal"
      @created="handleCustomerCreated"
    />

    <!-- Payment Drawer -->
    <PaymentDrawer
      v-model="showPaymentDrawer"
      :total-amount="total"
      :order-data="currentOrder"
      @complete="handlePaymentComplete"
      @cancel="showPaymentDrawer = false"
    />

    <!-- Draft Orders List Modal -->
    <el-dialog
      v-model="showDraftListModal"
      title="Danh sách đơn nháp"
      width="600px"
      @opened="loadDraftOrders"
    >
      <div v-if="isLoadingDrafts" class="text-center py-4">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span class="ml-2">Đang tải...</span>
      </div>

      <div
        v-else-if="draftOrders.length === 0"
        class="text-center py-8 text-gray-500"
      >
        <i class="fa-regular fa-file text-4xl mb-2"></i>
        <p>Chưa có đơn nháp nào</p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="draft in draftOrders"
          :key="draft.id"
          class="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
          @click="loadFromDraft(draft)"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="font-medium">
                {{ draft.name || `Đơn nháp #${draft.id}` }}
              </div>
              <div class="text-sm text-gray-500 mt-1">
                {{ draft.itemCount || 0 }} sản phẩm •
                {{ formatPrice(draft.totalAmount || 0) }}
              </div>
              <div class="text-xs text-gray-400">
                {{ new Date(draft.createdAt).toLocaleString("vi-VN") }}
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                class="text-blue-600 hover:text-blue-800 text-sm"
                @click.stop="loadFromDraft(draft)"
              >
                <i class="fa-solid fa-download"></i>
                Tải
              </button>
              <button
                class="text-red-600 hover:text-red-800 text-sm"
                @click.stop="deleteDraft(draft.id)"
              >
                <i class="fa-solid fa-trash"></i>
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showDraftListModal = false">Đóng</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import PosTopbar from "@/staff/components/PosTopbar.vue";
import CustomerPicker from "@/staff/components/CustomerPicker.vue";
import CustomerCreateModal from "@/staff/components/CustomerCreateModal.vue";
import PaymentDrawer from "@/staff/components/PaymentDrawer.vue";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import posService, {
  formatPosProduct,
  formatPosOrderItem,
  calculateOrderTotals,
} from "@/services/posService";

// ===== STATE =====
const orderTabs = ref([{ id: 1, name: "Đơn 1" }]);
const activeTabId = ref(1);
const orderCounter = ref(1);

// Get store_id from logged-in user
const user = JSON.parse(localStorage.getItem("user") || "{}");
const currentStoreId = ref(user.store_id || 1);
const currentStoreName = ref(user.store_name || "");

// Product search state
const productSearchResults = ref([]);
const isSearchingProducts = ref(false);
const searchTimeout = ref(null);

const orders = ref({
  1: {
    items: [],
    notes: "",
    paymentMethod: "cash",
    discount: 0,
    discountCode: "",
    discountId: null,
    discountType: "fixed",
    draftId: null, // For saved drafts
  },
});

// Draft orders state
const draftOrders = ref([]);
const isLoadingDrafts = ref(false);
const showDraftListModal = ref(false);

const selectedCustomer = ref(null);
const showCustomerModal = ref(false);
const showPaymentDrawer = ref(false);
const showDiscountModal = ref(false);
const discountType = ref("fixed");
const discountValue = ref(0);
const autoPrint = ref(false);
const selectedStaff = ref("admin");

// ===== COMPUTED =====
const currentOrder = computed(() => orders.value[activeTabId.value]);

const subtotal = computed(() => {
  return currentOrder.value.items.reduce(
    (sum, item) => sum + (item.unit_price || item.price) * item.quantity,
    0,
  );
});

const discount = computed(() => {
  if (currentOrder.value.discountType === "percent") {
    return (subtotal.value * currentOrder.value.discount) / 100;
  }
  return currentOrder.value.discount;
});

const total = computed(() => {
  return Math.max(0, subtotal.value - discount.value);
});

// Product search and add to cart with API
const searchProducts = async (query, limit = 10) => {
  try {
    isSearchingProducts.value = true;
    const searchParams = {
      q: query,
      store_id: currentStoreId.value,
      limit: limit,
    };
    const response = await posService.searchProducts(searchParams);

    if (response.success) {
      // Response.data là array trực tiếp, không có .products
      productSearchResults.value = response.data.map(formatPosProduct);
    } else {
      console.error("Search failed:", response.message);
      productSearchResults.value = [];
    }
  } catch (error) {
    console.error("Error searching products:", error);
    ElMessage.error("Lỗi tìm kiếm sản phẩm");
    productSearchResults.value = [];
  } finally {
    isSearchingProducts.value = false;
  }
};

const addToCart = async (product) => {
  try {
    const existingItem = currentOrder.value.items.find(
      (item) => item.id === product.id,
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      // Format product for cart using API data
      const formattedItem = {
        id: product.id,
        variant_id: product.variant_id,
        name: product.name,
        sku: product.sku,
        unit_price: product.price,
        price: product.price, // Keep for display purposes
        quantity: 1,
        discount_amount: 0,
        image: product.image,
      };
      currentOrder.value.items.push(formattedItem);
    }

    ElMessage.success(`Đã thêm ${product.name} vào đơn hàng`);
  } catch (error) {
    console.error("Error adding product to cart:", error);
    ElMessage.error("Lỗi thêm sản phẩm vào đơn hàng");
  }
};

// Handle search from topbar
const handleTopbarSearch = async (searchQuery) => {
  if (!searchQuery || searchQuery.trim() === "") {
    productSearchResults.value = [];
    return;
  }

  await searchProducts(searchQuery.trim());
};

// Clear search results
const clearSearchResults = () => {
  productSearchResults.value = [];
};

// ===== METHODS =====
const addNewOrder = () => {
  orderCounter.value++;
  const newId = orderCounter.value;
  orderTabs.value.push({
    id: newId,
    name: `Đơn ${newId}`,
  });
  orders.value[newId] = {
    items: [],
    notes: "",
    paymentMethod: "cash",
    discount: 0,
    discountCode: "",
    discountId: null,
    discountType: "fixed",
    draftId: null,
  };
  activeTabId.value = newId;
};

const selectOrder = (id) => {
  activeTabId.value = id;
};

const closeOrder = (id) => {
  if (orderTabs.value.length === 1) {
    ElMessage.warning("Phải giữ lại ít nhất 1 đơn hàng");
    return;
  }

  const order = orders.value[id];
  if (order.items.length > 0) {
    ElMessageBox.confirm(
      "Đơn hàng này có sản phẩm. Bạn có chắc muốn đóng?",
      "Xác nhận",
      {
        confirmButtonText: "Đóng",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    )
      .then(() => {
        performCloseOrder(id);
      })
      .catch(() => {});
  } else {
    performCloseOrder(id);
  }
};

const performCloseOrder = (id) => {
  const index = orderTabs.value.findIndex((t) => t.id === id);
  orderTabs.value.splice(index, 1);
  delete orders.value[id];

  // Nếu đang đóng tab active, chuyển về tab đầu tiên (Đơn 1)
  if (activeTabId.value === id) {
    activeTabId.value = orderTabs.value[0].id;
  }
};

const removeFromCart = (index) => {
  currentOrder.value.items.splice(index, 1);
};

const increaseQuantity = (index) => {
  currentOrder.value.items[index].quantity++;
};

const decreaseQuantity = (index) => {
  if (currentOrder.value.items[index].quantity > 1) {
    currentOrder.value.items[index].quantity--;
  } else {
    removeFromCart(index);
  }
};

const updateQuantity = (index, newQty) => {
  if (newQty < 1) {
    currentOrder.value.items[index].quantity = 1;
  }
};

const applyDiscount = async () => {
  try {
    currentOrder.value.discountType = discountType.value;
    currentOrder.value.discount = discountValue.value;

    // If discount code provided, validate it with API
    if (
      currentOrder.value.discountCode &&
      currentOrder.value.discountCode.trim()
    ) {
      const discountData = {
        code: currentOrder.value.discountCode,
        order_amount: subtotal.value,
        customer_id: selectedCustomer.value?.id || null,
      };
      const response = await posService.validateDiscountCode(discountData);

      if (response.success && response.data.isValid) {
        const discount = response.data.discount;
        currentOrder.value.discountId = discount.id;
        currentOrder.value.discountType = discount.type;
        currentOrder.value.discount = discount.value;

        ElMessage.success(`Áp dụng mã giảm giá thành công: ${discount.name}`);
      } else {
        ElMessage.warning("Mã giảm giá không hợp lệ hoặc đã hết hạn");
        currentOrder.value.discountCode = "";
        currentOrder.value.discountId = null;
      }
    } else {
      ElMessage.success("Đã áp dụng giảm giá");
    }

    showDiscountModal.value = false;
  } catch (error) {
    console.error("Error applying discount:", error);
    ElMessage.error("Lỗi áp dụng giảm giá");
  }
};

// Draft Orders Management
const loadDraftOrders = async () => {
  try {
    isLoadingDrafts.value = true;
    const response = await posService.getDrafts(currentStoreId.value);

    if (response.success) {
      draftOrders.value = response.data.drafts || response.data;
    } else {
      console.error("Failed to load drafts:", response.message);
    }
  } catch (error) {
    console.error("Error loading draft orders:", error);
    ElMessage.error("Lỗi tải đơn lưu nháp");
  } finally {
    isLoadingDrafts.value = false;
  }
};

const createInitialDraft = async () => {
  try {
    const response = await posService.createEmptyDraft(currentStoreId.value);

    if (response.success) {
      const newDraft = response.data;

      // Tạo tab mới cho đơn nháp
      const newTab = {
        id: newDraft.id,
        title: `${newDraft.code}`,
        subtitle: "Khách lẻ",
        status: "draft",
        order: {
          id: newDraft.id,
          code: newDraft.code,
          items: newDraft.items || [],
          customerId: null,
          customerName: newDraft.customer_name || "Khách lẻ",
          subtotal: newDraft.subtotal || 0,
          discount: newDraft.discount_amount || 0,
          final: newDraft.final_amount || 0,
          notes: newDraft.notes || "",
        },
      };

      orderTabs.value.push(newTab);
      activeTabId.value = newTab.id;
      ElMessage.success("Đã tạo đơn nháp mới");
    } else {
      console.error("Failed to create initial draft:", response.message);
      ElMessage.error("Lỗi tạo đơn nháp mới");
    }
  } catch (error) {
    console.error("Error creating initial draft:", error);
    ElMessage.error("Lỗi tạo đơn nháp mới");
  }
};

const saveDraft = async () => {
  if (currentOrder.value.items.length === 0) {
    ElMessage.warning("Không có sản phẩm để lưu nháp");
    return;
  }

  try {
    const draftData = {
      items: currentOrder.value.items,
      customerId: selectedCustomer.value?.id || null,
      notes: currentOrder.value.notes,
      discount: currentOrder.value.discount,
      discountType: currentOrder.value.discountType,
      discountCode: currentOrder.value.discountCode,
      discountId: currentOrder.value.discountId,
    };

    let response;
    if (currentOrder.value.draftId) {
      // Update existing draft
      response = await posService.updateDraft(
        currentOrder.value.draftId,
        draftData,
      );
    } else {
      // Create new draft
      response = await posService.saveDraft(draftData, selectedStaff.value);
    }

    if (response.success) {
      currentOrder.value.draftId = response.data.draft.id;
      ElMessage.success("Đã lưu nháp đơn hàng");
      await loadDraftOrders(); // Refresh draft list
    } else {
      ElMessage.error(response.message || "Lỗi lưu nháp đơn hàng");
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    ElMessage.error("Lỗi lưu nháp đơn hàng");
  }
};

const loadFromDraft = async (draft) => {
  try {
    const response = await posService.getDraftById(draft.id);

    if (response.success) {
      const draftData = response.data.draft;

      // Update current order with draft data
      currentOrder.value.items = draftData.items || [];
      currentOrder.value.notes = draftData.notes || "";
      currentOrder.value.discount = draftData.discount || 0;
      currentOrder.value.discountType = draftData.discountType || "fixed";
      currentOrder.value.discountCode = draftData.discountCode || "";
      currentOrder.value.discountId = draftData.discountId || null;
      currentOrder.value.draftId = draft.id;

      // Load customer if exists
      if (draftData.customerId) {
        // TODO: Load customer data by ID
        // selectedCustomer.value = await customerService.getById(draftData.customerId);
      }

      ElMessage.success(`Đã tải đơn nháp: ${draft.name || "Không tên"}`);
    } else {
      ElMessage.error(response.message || "Lỗi tải đơn nháp");
    }
  } catch (error) {
    console.error("Error loading draft:", error);
    ElMessage.error("Lỗi tải đơn nháp");
  }
};

const deleteDraft = async (draftId) => {
  try {
    const response = await posService.deleteDraft(draftId);

    if (response.success) {
      ElMessage.success("Đã xóa đơn nháp");
      await loadDraftOrders(); // Refresh draft list

      // If current order is this draft, clear draftId
      if (currentOrder.value.draftId === draftId) {
        currentOrder.value.draftId = null;
      }
    } else {
      ElMessage.error(response.message || "Lỗi xóa đơn nháp");
    }
  } catch (error) {
    console.error("Error deleting draft:", error);
    ElMessage.error("Lỗi xóa đơn nháp");
  }
};

const handleCustomerCreated = (customer) => {
  selectedCustomer.value = customer;
  ElMessage.success(`Đã thêm và chọn khách hàng: ${customer.name}`);
};

const checkout = () => {
  if (currentOrder.value.items.length === 0) {
    ElMessage.warning("Vui lòng thêm sản phẩm vào đơn hàng");
    return;
  }
  // Open payment drawer instead of direct confirmation
  showPaymentDrawer.value = true;
};

const handlePaymentComplete = async (paymentData) => {
  try {
    // Prepare checkout data
    const checkoutData = {
      store_id: currentStoreId.value,
      customer_id: selectedCustomer.value?.id || null,
      items: currentOrder.value.items,
      subtotal: subtotal.value,
      discount_amount: currentOrder.value.discount || 0,
      discount_code: currentOrder.value.discountCode || null,
      discount_id: currentOrder.value.discountId || null,
      payment_method:
        paymentData.paymentMethod || currentOrder.value.paymentMethod || "cash",
      amount_received: paymentData.amountPaid || total.value,
      change: (paymentData.amountPaid || total.value) - total.value,
      notes: currentOrder.value.notes || null,
    };

    const loading = ElLoading.service({
      lock: true,
      text: "Đang xử lý thanh toán...",
      background: "rgba(0, 0, 0, 0.7)",
    });

    try {
      const response = await posService.checkout(
        checkoutData,
        selectedStaff.value,
      );

      if (response.success) {
        ElMessage.success("Thanh toán thành công!");

        // Auto-print receipt if enabled
        if (autoPrint.value && response.data.receiptId) {
          await posService.printReceipt(response.data.receiptId);
        }

        // Delete draft if this order was from a draft
        if (currentOrder.value.draftId) {
          await posService.deleteDraft(currentOrder.value.draftId);
          await loadDraftOrders(); // Refresh draft list
        }

        // Reset order
        currentOrder.value.items = [];
        currentOrder.value.notes = "";
        currentOrder.value.discount = 0;
        currentOrder.value.discountCode = "";
        currentOrder.value.discountId = null;
        currentOrder.value.draftId = null;
        selectedCustomer.value = null;

        // Close drawer
        showPaymentDrawer.value = false;
      } else {
        ElMessage.error(response.message || "Lỗi thanh toán");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      ElMessage.error("Lỗi thanh toán: " + (error.message || "Không xác định"));
    } finally {
      loading.close();
    }
  } catch (error) {
    console.error("Error in payment completion:", error);
    ElMessage.error("Lỗi xử lý thanh toán");
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// ===== INITIALIZATION =====
onMounted(async () => {
  try {
    // Load initial data
    await loadDraftOrders();

    // Tự động tạo đơn nháp trống khi mở POS
    if (orderTabs.value.length === 0) {
      await createInitialDraft();
    }

    // Load sample products for testing (can remove in production)
    // setTimeout(() => {
    //   const sampleProducts = [
    //     { id: 1, name: "Pepsi 330ml", price: 9500, image: "" },
    //     { id: 2, name: "Coca Cola 500ml", price: 12000, image: "" },
    //     { id: 3, name: "Bánh mì thịt", price: 20000, image: "" }
    //   ];
    //   sampleProducts.forEach(product => addToCart(product));
    // }, 500);

    // Keyboard shortcuts
    window.addEventListener("keydown", handleKeyPress);
  } catch (error) {
    console.error("Error in onMounted:", error);
  }
});

const handleKeyPress = async (e) => {
  // F3 - Focus search input in topbar
  if (e.key === "F3") {
    e.preventDefault();
    // Focus to search input in topbar
    const searchInput = document.querySelector(
      'input[placeholder*="sản phẩm"]',
    );
    if (searchInput) {
      searchInput.focus();
      searchInput.select(); // Select all text if any
    }
  }
  // F6 - Open discount modal
  if (e.key === "F6") {
    e.preventDefault();
    showDiscountModal.value = true;
  }
  // F7 - Save draft
  if (e.key === "F7") {
    e.preventDefault();
    await saveDraft();
  }
  // F9 - Checkout
  if (e.key === "F9") {
    e.preventDefault();
    if (currentOrder.value.items.length > 0) {
      checkout();
    } else {
      ElMessage.warning("Vui lòng thêm sản phẩm vào đơn hàng");
    }
  }
  // F10 - Toggle auto print
  if (e.key === "F10") {
    e.preventDefault();
    autoPrint.value = !autoPrint.value;
    ElMessage.success(`In tự động: ${autoPrint.value ? "Bật" : "Tắt"}`);
  }
};
</script>

<style scoped>
.pos-page {
  background-color: #f1f5f9;
  min-height: 100vh;
}

/* ===== MAIN LAYOUT ===== */
.pos-main {
  display: grid;
  grid-template-columns: 70% 30%;
  gap: 16px;
  padding: 16px;
  min-height: calc(100vh - 48px);
}

/* ===== LEFT COLUMN: CART ===== */
.left-column {
  display: flex;
  flex-direction: column;
}

.cart-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cart-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.btn-split-line {
  padding: 8px 14px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.btn-split-line:hover {
  background: #e2e8f0;
}

.cart-body {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

/* Empty State */
.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 40px;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
}

/* Cart Table */
.cart-table {
  width: 100%;
  border-collapse: collapse;
}

.cart-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.cart-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cart-table th.col-product {
  width: 40%;
}

.cart-table th.col-price {
  width: 20%;
}

.cart-table th.col-quantity {
  width: 20%;
}

.cart-table th.col-total {
  width: 15%;
}

.cart-table th.col-action {
  width: 5%;
}

.cart-row {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.cart-row:hover {
  background: #f8fafc;
}

.cart-table td {
  padding: 16px;
  vertical-align: middle;
}

/* Product Cell */
.product-cell {
  padding: 12px 16px !important;
}

.product-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.product-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.product-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-thumbnail span {
  font-size: 1.5rem;
  opacity: 0.3;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
  line-height: 1.4;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-unit {
  font-size: 0.8rem;
  color: #94a3b8;
}

.product-note-input {
  width: 100%;
  max-width: 250px;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.8rem;
  outline: none;
  transition: all 0.2s;
}

.product-note-input:focus {
  border-color: #1e40af;
  box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.1);
}

/* Price Cell */
.price-cell {
  font-size: 0.9rem;
  color: #475569;
}

.price-value {
  font-weight: 500;
}

/* Quantity Cell */
.qty-controls {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f1f5f9;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover {
  background: #1e40af;
  color: white;
}

.qty-input {
  width: 50px;
  text-align: center;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  outline: none;
}

.qty-input::-webkit-inner-spin-button,
.qty-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Total Cell */
.total-cell {
  font-size: 1rem;
  font-weight: 700;
  color: #1e40af;
}

/* Action Cell */
.action-cell {
  text-align: center;
}

.btn-remove-item {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #fee2e2;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #dc2626;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-remove-item:hover {
  background: #fecaca;
}

/* ===== RIGHT COLUMN: PAYMENT ===== */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payment-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

/* Customer Section */
.customer-search-wrapper {
  position: relative;
}

.customer-search-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 1rem;
  z-index: 1;
}

.customer-search-input {
  flex: 1;
  padding: 10px 14px 10px 42px;
  padding-right: 80px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
}

.customer-section {
  margin-bottom: 12px;
}

.selected-customer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-top: 12px;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.customer-info {
  flex: 1;
  min-width: 0;
}

.customer-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.customer-phone {
  font-size: 0.8rem;
  color: #64748b;
}

.btn-remove-customer {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #fee2e2;
  border: none;
  cursor: pointer;
  color: #dc2626;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-remove-customer:hover {
  background: #fecaca;
}

/* Summary Section */
.summary-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.summary-rows {
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  font-size: 0.95rem;
}

.summary-label {
  color: #64748b;
  font-weight: 500;
}

.summary-value {
  color: #1e293b;
  font-weight: 600;
}

.discount-row {
  position: relative;
}

.btn-discount {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
  color: #475569;
  transition: all 0.2s;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.btn-discount:hover {
  background: #f1f5f9;
}

.discount-value {
  color: #dc2626 !important;
}

.total-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #e2e8f0;
}

.total-label {
  color: #1e293b;
  font-weight: 600;
  font-size: 1rem;
}

.total-value {
  color: #1e40af;
  font-weight: 700;
  font-size: 1.6rem;
}

.btn-checkout-main {
  width: 100%;
  padding: 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
  margin-bottom: 12px;
}

.btn-checkout-main:hover:not(:disabled) {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  box-shadow: 0 6px 16px rgba(30, 64, 175, 0.4);
  transform: translateY(-1px);
}

.btn-checkout-main:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auto-print-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.2s;
}

.auto-print-checkbox:hover {
  background: #f8fafc;
}

.auto-print-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* ===== FOOTER BAR ===== */
.footer-bar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 20px;
  margin-top: 16px;
}

.footer-left {
  display: flex;
  gap: 12px;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.footer-btn-icon {
  font-size: 1.5rem;
}

.footer-btn-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.footer-btn-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.footer-btn-subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
}

.footer-center {
  flex: 1;
  max-width: 400px;
}

.footer-note-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
}

.footer-note-input:focus {
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Footer Icon Buttons */
.footer-icon-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
  font-size: 1.15rem;
  min-width: 64px;
}

.footer-icon-btn:hover {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #1e40af;
}

.footer-icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.footer-icon-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.footer-icon-btn:hover .footer-icon-label {
  color: #1e40af;
}

.footer-badge {
  position: absolute;
  top: 2px;
  right: 4px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* Footer Divider */
.footer-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
  flex-shrink: 0;
}

/* Footer Staff */
.footer-staff {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-staff-icon {
  color: #94a3b8;
  font-size: 0.9rem;
}

.footer-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #1e293b;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M3 5l3 3 3-3'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;
}

.footer-select:hover {
  border-color: #cbd5e1;
  background-color: #f1f5f9;
}

.footer-select:focus {
  border-color: #1e40af;
  box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.1);
}

/* Footer Accent Button */
.footer-accent-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.25);
  white-space: nowrap;
}

.footer-accent-btn:hover {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.35);
  transform: translateY(-1px);
}

.footer-accent-btn i {
  font-size: 0.8rem;
}

.footer-kbd {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 3px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.kbd {
  padding: 3px 7px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.ml-auto {
  margin-left: auto;
}

.text-lg {
  font-size: 1.125rem;
}

/* ===== SCROLLBAR ===== */
.cart-body::-webkit-scrollbar {
  width: 6px;
}

.cart-body::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.cart-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.cart-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .pos-main {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .footer-bar {
    flex-wrap: wrap;
    height: auto;
    padding: 12px;
  }

  .footer-left,
  .footer-right {
    flex-wrap: wrap;
  }
}

/* ===== DRAFT ORDERS MODAL ===== */
.draft-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.draft-item:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.draft-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.draft-item-title {
  font-weight: 600;
  color: #1e293b;
}

.draft-item-meta {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 4px;
}

.draft-item-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.draft-actions {
  display: flex;
  gap: 12px;
}

.draft-action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.draft-action-load {
  background: #e0f2fe;
  color: #0369a1;
}

.draft-action-load:hover {
  background: #bae6fd;
}

.draft-action-delete {
  background: #fef2f2;
  color: #dc2626;
}

.draft-action-delete:hover {
  background: #fee2e2;
}

/* ===== DISCOUNT MODAL IMPROVEMENTS ===== */
.el-dialog .space-y-4 > * + * {
  margin-top: 1rem;
}

.text-xs {
  font-size: 0.75rem;
}

.text-gray-500 {
  color: #6b7280;
}

.mt-1 {
  margin-top: 0.25rem;
}
</style>
