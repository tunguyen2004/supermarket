<template>
  <div class="h-full bg-white flex flex-col">
    <PageHeader title="Tra cứu tồn kho" />

    <!-- Search Bar -->
    <div class="px-6 py-4 border-b">
      <div class="flex items-center gap-4 max-w-5xl mx-auto">
        <div class="relative flex-1 max-w-2xl">
          <el-input
            ref="searchInputRef"
            v-model="searchQuery"
            size="large"
            placeholder="Tìm kiếm sản phẩm (tên, mã SKU, barcode ...) (F3)"
            clearable
            @input="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- Store filter -->
        <el-select
          v-model="storeFilter"
          placeholder="Tất cả chi nhánh"
          size="large"
          clearable
          style="width: 220px"
          @change="fetchProducts"
        >
          <el-option
            v-for="s in stores"
            :key="s.id"
            :label="s.name"
            :value="s.id"
          />
        </el-select>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-6">
      <div class="max-w-5xl mx-auto">
        <!-- Product List Card -->
        <div class="bg-white rounded-lg shadow-sm border">
          <!-- Card Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b">
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
              class="px-6 py-4 hover:bg-blue-50/50 cursor-pointer transition-colors"
              @click="goToDetail(product.product_id)"
            >
              <div class="flex items-center gap-4">
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
              class="px-6 py-16 text-center"
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
            class="px-6 py-4 border-t flex items-center justify-between"
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
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Search, Picture } from "@element-plus/icons-vue";
import { searchProducts } from "@/services/inventoryLookupService";
import formatCurrency from "@/utils/formatCurrency";
import PageHeader from "@/staff/components/PageHeader.vue";
import apiClient from "@/services/apiClient";

const router = useRouter();
const route = useRoute();
const searchInputRef = ref(null);
const searchQuery = ref("");
const sortBy = ref("name_asc");
const storeFilter = ref(null);
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
