<template>
  <div class="h-full bg-white flex flex-col">
    <PageHeader title="Tra cứu tồn kho" />

    <!-- Search Bar -->
    <div class="px-4 sm:px-6 py-4 border-b">
      <div class="flex flex-wrap items-center gap-3 max-w-5xl mx-auto">
        <div class="relative flex-1 min-w-[200px]">
          <el-input
            ref="searchInputRef"
            v-model="searchQuery"
            size="large"
            placeholder="Tìm kiếm sản phẩm (tên, mã SKU, barcode ...)"
            clearable
            @input="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- Nút tạo phiếu nhập hàng -->
        <el-button type="primary" @click="openPurchaseForm" size="large">
          <i class="fa-solid fa-file-import mr-1.5"></i>
          Tạo phiếu nhập hàng
        </el-button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-3 sm:p-6">
      <div class="max-w-5xl mx-auto">
        <!-- Product List Card -->
        <div class="bg-white rounded-lg shadow-sm border">
          <!-- Card Header -->
          <div
            class="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b"
          >
            <h2 class="text-base font-semibold">
              Sản phẩm
              <span class="text-slate-500 font-normal ml-2"
                >({{ totalProducts }})</span
              >
            </h2>
            <el-select
              v-model="sortBy"
              placeholder="Mặc định"
              size="default"
              style="width: 180px"
              @change="fetchProducts"
            >
              <el-option label="Tên A-Z" value="name_asc" />
              <el-option label="Tên Z-A" value="name_desc" />
              <el-option label="Giá thấp - cao" value="price_asc" />
              <el-option label="Giá cao - thấp" value="price_desc" />
              <el-option label="Tồn kho tăng" value="stock_asc" />
              <el-option label="Tồn kho giảm" value="stock_desc" />
            </el-select>
          </div>

          <!-- Product List -->
          <div v-loading="loading" class="divide-y">
            <!-- Loading Skeleton -->
            <div v-if="loading && products.length === 0" class="space-y-1">
              <div v-for="i in 8" :key="i" class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <el-skeleton animated>
                    <template #template>
                      <el-skeleton-item
                        variant="image"
                        style="width: 56px; height: 56px; border-radius: 8px"
                      />
                    </template>
                  </el-skeleton>
                  <div class="flex-1">
                    <el-skeleton animated>
                      <template #template>
                        <el-skeleton-item variant="text" style="width: 240px" />
                        <el-skeleton-item
                          variant="text"
                          style="width: 160px; margin-top: 8px"
                        />
                      </template>
                    </el-skeleton>
                  </div>
                  <div class="text-right">
                    <el-skeleton animated>
                      <template #template>
                        <el-skeleton-item variant="text" style="width: 100px" />
                        <el-skeleton-item
                          variant="text"
                          style="width: 80px; margin-top: 8px"
                        />
                      </template>
                    </el-skeleton>
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Items -->
            <div
              v-for="product in products"
              :key="`${product.product_id}-${product.variant_id}`"
              class="px-3 sm:px-6 py-3 sm:py-4 hover:bg-blue-50/50 cursor-pointer transition-colors"
              @click="goToDetail(product.product_id)"
            >
              <div class="flex items-center gap-3">
                <!-- Thumbnail -->
                <div
                  class="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100"
                >
                  <el-image
                    :src="getImageUrl(product.image_url)"
                    fit="cover"
                    class="w-full h-full"
                  >
                    <template #error>
                      <div
                        class="w-full h-full flex items-center justify-center bg-slate-100"
                      >
                        <el-icon color="#ccc" :size="24"><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-slate-900 truncate">
                    {{ product.name }}
                  </h3>
                  <div class="flex items-center gap-3 mt-1">
                    <span
                      v-if="product.variant_name"
                      class="text-sm text-slate-500 truncate"
                    >
                      {{ product.variant_name }}
                    </span>
                    <span class="text-xs text-slate-400 font-mono">{{
                      product.sku
                    }}</span>
                    <span
                      v-if="product.barcode"
                      class="text-xs text-slate-400 font-mono"
                    >
                      <i class="fa-solid fa-barcode mr-1"></i
                      >{{ product.barcode }}
                    </span>
                  </div>
                </div>

                <!-- Price & Stock -->
                <div class="text-right flex-shrink-0">
                  <div class="font-semibold text-slate-900">
                    {{ formatPrice(product.price) }}
                  </div>
                  <div class="mt-1 flex items-center justify-end gap-1.5">
                    <span
                      class="inline-flex items-center gap-1 text-sm px-2 py-0.5 rounded-full"
                      :class="stockClass(product.total_stock)"
                    >
                      <i class="fa-solid fa-cube text-[10px]"></i>
                      {{ product.total_stock }}
                    </span>
                    <span
                      v-if="product.store_count > 0"
                      class="text-xs text-slate-400"
                    >
                      ({{ product.store_count }} CN)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="!loading && products.length === 0"
              class="px-4 py-12 text-center"
            >
              <div class="text-5xl text-slate-300 mb-4">
                <i class="fa-solid fa-boxes-stacked"></i>
              </div>
              <p class="text-slate-500 text-lg font-medium">
                {{
                  searchQuery
                    ? "Không tìm thấy sản phẩm phù hợp"
                    : "Chưa có sản phẩm nào"
                }}
              </p>
              <p v-if="searchQuery" class="text-sm text-slate-400 mt-1">
                Thử tìm kiếm với từ khóa khác
              </p>
            </div>
          </div>

          <!-- Pagination -->
          <div
            v-if="totalProducts > pageSize"
            class="px-4 py-3 border-t flex flex-wrap items-center justify-between gap-2"
          >
            <span class="text-sm text-slate-500">
              Hiển thị {{ products.length }} / {{ totalProducts }} sản phẩm
            </span>
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="totalProducts"
              layout="prev, pager, next"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Purchase Request Dialog -->
    <el-dialog
      v-model="purchaseDialogVisible"
      title="Tạo phiếu nhập hàng"
      width="720px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <!-- Search & add product -->
      <div class="mb-4">
        <el-input
          v-model="purchaseSearchQuery"
          placeholder="Tìm sản phẩm để thêm (tên, SKU, barcode...)"
          clearable
          @input="handlePurchaseSearch"
          size="large"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <!-- Search results dropdown -->
        <div
          v-if="purchaseSearchResults.length > 0"
          class="border rounded-lg mt-1 max-h-48 overflow-auto bg-white shadow-lg z-50"
        >
          <div
            v-for="p in purchaseSearchResults"
            :key="`${p.product_id}-${p.variant_id}`"
            class="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-sm"
            @click="addToPurchase(p)"
          >
            <div>
              <span class="font-medium">{{ p.name }}</span>
              <span v-if="p.variant_name" class="text-slate-400 ml-1">
                - {{ p.variant_name }}
              </span>
              <span class="text-xs text-slate-400 font-mono ml-2">{{ p.sku }}</span>
              <span v-if="p.cost_price" class="text-xs text-blue-500 ml-2">
                Giá nhập: {{ formatPrice(p.cost_price) }}
              </span>
            </div>
            <span
              class="text-xs px-2 py-0.5 rounded-full"
              :class="stockClass(p.total_stock)"
            >
              Tồn: {{ p.total_stock }}
            </span>
          </div>
        </div>
      </div>

      <!-- Items table -->
      <el-table :data="purchaseItems" border class="w-full" size="small">
        <el-table-column label="Sản phẩm" min-width="200">
          <template #default="{ row }">
            <div class="font-medium">{{ row.name }}</div>
            <div class="text-xs text-slate-400">
              {{ row.variant_name ? row.variant_name + ' · ' : '' }}{{ row.sku }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Tồn hiện tại" width="100" align="center">
          <template #default="{ row }">
            <span
              class="text-xs px-2 py-0.5 rounded-full"
              :class="stockClass(row.current_stock)"
            >{{ row.current_stock }}</span>
          </template>
        </el-table-column>
        <el-table-column label="SL nhập" width="120" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.quantity"
              :min="1"
              :max="9999"
              size="small"
              controls-position="right"
            />
          </template>
        </el-table-column>
        <el-table-column label="Đơn giá nhập" width="150" align="center">
          <template #default="{ row }">
            <el-input
              v-model="row.formattedCost"
              size="small"
              @input="onCostInput(row)"
              placeholder="0"
            >
              <template #suffix>₫</template>
            </el-input>
          </template>
        </el-table-column>
        <el-table-column label="Thành tiền" width="130" align="right">
          <template #default="{ row }">
            <span class="font-semibold text-sm">
              {{ formatPrice(row.quantity * (row.unit_cost || 0)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column width="50" align="center">
          <template #default="{ $index }">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click="purchaseItems.splice($index, 1)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- Empty state -->
      <div
        v-if="purchaseItems.length === 0"
        class="text-center py-8 text-slate-400"
      >
        <i class="fa-solid fa-boxes-stacked text-3xl mb-2"></i>
        <p>Tìm và thêm sản phẩm cần nhập hàng</p>
      </div>

      <!-- Summary -->
      <div v-if="purchaseItems.length > 0" class="mt-4 flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
        <div class="text-sm text-slate-600">
          <span class="font-semibold">{{ purchaseItems.length }}</span> sản phẩm ·
          <span class="font-semibold">{{ purchaseItems.reduce((s, i) => s + i.quantity, 0) }}</span> đơn vị
        </div>
        <div class="text-lg font-bold text-blue-600">
          Tổng: {{ formatPrice(purchaseTotalAmount) }}
        </div>
      </div>

      <!-- Notes -->
      <div class="mt-4">
        <el-input
          v-model="purchaseNote"
          type="textarea"
          :rows="2"
          placeholder="Ghi chú (nhà cung cấp, lý do nhập...)"
        />
      </div>

      <template #footer>
        <el-button @click="purchaseDialogVisible = false">Hủy</el-button>
        <el-button
          type="primary"
          :loading="submittingPurchase"
          :disabled="purchaseItems.length === 0"
          @click="submitPurchaseRequest"
        >
          <i class="fa-solid fa-paper-plane mr-1.5"></i>
          Gửi phiếu nhập hàng
        </el-button>
      </template>
    </el-dialog>

    <!-- Success dialog -->
    <el-dialog v-model="purchaseSuccessVisible" width="400px" :show-close="false" center>
      <div class="text-center py-4">
        <div class="text-5xl text-green-500 mb-4"><i class="fa-solid fa-circle-check"></i></div>
        <h3 class="text-lg font-semibold mb-2">Đã gửi phiếu nhập hàng!</h3>
        <p class="text-slate-500 mb-1">Mã phiếu: <span class="font-mono font-bold text-blue-600">{{ purchaseCode }}</span></p>
        <p class="text-sm text-slate-400">Phiếu đang chờ admin duyệt trong Sổ quỹ</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="purchaseSuccessVisible = false">Đóng</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Search, Picture, Delete } from "@element-plus/icons-vue";
import { searchProducts } from "@/services/inventoryLookupService";
import cashbookService from "@/services/cashbookService";
import formatCurrency from "@/utils/formatCurrency";
import PageHeader from "@/staff/components/PageHeader.vue";
import apiClient from "@/services/apiClient";

const router = useRouter();
const route = useRoute();
const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

const searchInputRef = ref(null);
const searchQuery = ref("");
const sortBy = ref("stock_asc");
const storeFilter = ref(currentUser.store_id || null);
const loading = ref(false);
const products = ref([]);
const totalProducts = ref(0);
const stores = ref([]);
const currentPage = ref(1);
const pageSize = 50;

let searchTimeout = null;

// Format price
const formatPrice = (val) => {
  const n = Number(val || 0);
  if (n === 0) return "Liên hệ";
  return n.toLocaleString("vi-VN") + " ₫";
};

// Stock styling
const stockClass = (stock) => {
  if (stock <= 0) return "bg-red-100 text-red-700";
  if (stock <= 10) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};

// Image URL
const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return url;
};

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchProducts();
  }, 400);
};

// Fetch products from API
const fetchProducts = async () => {
  loading.value = true;
  try {
    const [field, order] = sortBy.value.split("_");
    const params = {
      query: searchQuery.value || "",
      sort: field,
      order: order?.toUpperCase() || "ASC",
      limit: pageSize,
      offset: (currentPage.value - 1) * pageSize,
    };
    if (storeFilter.value) params.store_id = storeFilter.value;

    const response = await searchProducts(params);
    if (response.success) {
      products.value = response.data || [];
      totalProducts.value = response.pagination?.total || products.value.length;
    } else {
      throw new Error(response.message || "Lỗi tải dữ liệu");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    ElMessage.error("Không thể tải danh sách sản phẩm");
    products.value = [];
    totalProducts.value = 0;
  } finally {
    loading.value = false;
  }
};

// Fetch stores for filter
const fetchStores = async () => {
  try {
    const { data: res } = await apiClient.get("/api/stores");
    if (res.success) stores.value = res.data || [];
  } catch (e) {
    console.error("Error fetching stores:", e);
  }
};

// Page change
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchProducts();
};

// Navigate to detail page
const goToDetail = (productId) => {
  router.push(`/staff/inventory-lookup/${productId}`);
};

// ========== Purchase Request ==========
const purchaseDialogVisible = ref(false);
const purchaseSearchQuery = ref("");
const purchaseSearchResults = ref([]);
const purchaseItems = ref([]);
const purchaseNote = ref("");
const submittingPurchase = ref(false);
const purchaseSuccessVisible = ref(false);
const purchaseCode = ref("");

let purchaseSearchTimeout = null;

const purchaseTotalAmount = computed(() =>
  purchaseItems.value.reduce((sum, item) => sum + item.quantity * (item.unit_cost || 0), 0)
);

const openPurchaseForm = () => {
  purchaseItems.value = [];
  purchaseSearchQuery.value = "";
  purchaseSearchResults.value = [];
  purchaseNote.value = "";
  purchaseDialogVisible.value = true;
};

const handlePurchaseSearch = () => {
  if (purchaseSearchTimeout) clearTimeout(purchaseSearchTimeout);
  purchaseSearchTimeout = setTimeout(async () => {
    if (!purchaseSearchQuery.value.trim()) {
      purchaseSearchResults.value = [];
      return;
    }
    try {
      const params = {
        query: purchaseSearchQuery.value,
        sort: "name",
        order: "ASC",
        limit: 10,
        offset: 0,
      };
      if (storeFilter.value) params.store_id = storeFilter.value;
      const response = await searchProducts(params);
      if (response.success) {
        purchaseSearchResults.value = (response.data || []).filter(
          (p) => !purchaseItems.value.some((i) => i.variant_id === p.variant_id)
        );
      }
    } catch (e) {
      console.error("Purchase search error:", e);
    }
  }, 300);
};

const addToPurchase = (product) => {
  const cost = product.cost_price || 0;
  purchaseItems.value.push({
    variant_id: product.variant_id,
    product_id: product.product_id,
    name: product.name,
    variant_name: product.variant_name,
    sku: product.sku,
    current_stock: product.total_stock || 0,
    quantity: 10,
    unit_cost: cost,
    formattedCost: cost > 0 ? cost.toLocaleString("vi-VN") : "",
  });
  purchaseSearchQuery.value = "";
  purchaseSearchResults.value = [];
};

const onCostInput = (row) => {
  const numericValue = (row.formattedCost || "").replace(/[^0-9]/g, "");
  row.unit_cost = numericValue === "" ? 0 : parseInt(numericValue, 10);
  row.formattedCost = row.unit_cost > 0 ? row.unit_cost.toLocaleString("vi-VN") : "";
};

const submitPurchaseRequest = async () => {
  if (purchaseItems.value.length === 0) return;

  submittingPurchase.value = true;
  try {
    const items = purchaseItems.value.map((i) => ({
      variant_id: i.variant_id,
      name: i.name,
      variant_name: i.variant_name,
      sku: i.sku,
      quantity: i.quantity,
      unit_cost: i.unit_cost || 0,
    }));

    const description = `Phiếu nhập hàng: ${items.length} sản phẩm — ${items.map((i) => `${i.name}${i.variant_name ? ' (' + i.variant_name + ')' : ''} x${i.quantity}`).join(", ")}`;

    const payload = {
      date_key: new Date().toISOString().split("T")[0],
      cashbook_type: "PURCHASE_EXPENSE",
      amount: purchaseTotalAmount.value || 1,
      payment_method: "CASH",
      description: description.length > 200 ? description.substring(0, 197) + "..." : description,
      recipient_name: purchaseNote.value || null,
      store_id: currentUser.store_id || null,
      reference_type: "purchase_request",
      notes: JSON.stringify({ items, note: purchaseNote.value }),
    };

    const res = await cashbookService.createTransaction(payload);
    if (res.success) {
      purchaseCode.value = res.data.transaction_code || "";
      purchaseDialogVisible.value = false;
      purchaseSuccessVisible.value = true;
      ElMessage.success("Đã gửi phiếu nhập hàng thành công!");
    } else {
      ElMessage.error(res.message || "Lỗi khi tạo phiếu nhập hàng");
    }
  } catch (e) {
    console.error("Submit purchase request error:", e);
    ElMessage.error("Lỗi: " + (e.response?.data?.message || e.message));
  } finally {
    submittingPurchase.value = false;
  }
};

// Keyboard shortcut F3 to focus search
const handleKeydown = (e) => {
  if (e.key === "F3") {
    e.preventDefault();
    searchInputRef.value?.focus();
  }
};

onMounted(() => {
  // Restore search from query param
  if (route.query.q) searchQuery.value = route.query.q;
  fetchStores();
  fetchProducts();
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (searchTimeout) clearTimeout(searchTimeout);
});
</script>

<style scoped>
.search-input :deep(.el-input__wrapper) {
  border-radius: 24px;
  padding: 8px 16px;
  transition: all 0.3s;
}

.search-input :deep(.el-input__wrapper:focus-within) {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}
</style>
