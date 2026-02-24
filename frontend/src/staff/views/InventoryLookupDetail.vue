<template>
  <div class="h-full bg-slate-50 flex flex-col">
    <!-- Back Button & Search Bar -->
    <div
      class="px-6 py-4 border-b bg-white flex flex-col md:flex-row md:items-center gap-4"
    >
      <!-- Back Button -->
      <div class="shrink-0">
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <el-icon><ArrowLeft /></el-icon>
          <span class="font-medium">Tra cứu tồn kho</span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="relative flex-1 max-w-2xl">
        <el-input
          ref="searchInputRef"
          v-model="searchQuery"
          size="large"
          placeholder="Tìm kiếm sản phẩm (tên, mã SKU ...) (F3)"
          clearable
          @keyup.enter="handleSearchSubmit"
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-6">
      <div class="max-w-5xl mx-auto space-y-6">
        <!-- Loading -->
        <div v-if="loading" class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-start gap-6">
            <div class="flex-1">
              <el-skeleton animated>
                <template #template>
                  <el-skeleton-item variant="h1" style="width: 300px" />
                  <el-skeleton-item
                    variant="text"
                    style="width: 150px; margin-top: 12px"
                  />
                  <el-skeleton-item
                    variant="text"
                    style="width: 200px; margin-top: 8px"
                  />
                </template>
              </el-skeleton>
            </div>
            <el-skeleton animated>
              <template #template>
                <el-skeleton-item
                  variant="image"
                  style="width: 120px; height: 120px; border-radius: 12px"
                />
              </template>
            </el-skeleton>
          </div>
        </div>

        <!-- Error / Not Found -->
        <div
          v-else-if="!productDetail"
          class="bg-white rounded-lg shadow-sm border p-12 text-center"
        >
          <div class="text-5xl text-slate-300 mb-4">
            <i class="fa-solid fa-box-open"></i>
          </div>
          <p class="text-slate-500 text-lg font-medium">
            Không tìm thấy thông tin sản phẩm
          </p>
          <button
            @click="goBack"
            class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>

        <template v-else>
          <!-- Product Header Card -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <div class="flex items-start justify-between gap-6">
              <!-- Left: Product Info -->
              <div class="flex-1">
                <h1 class="text-2xl font-bold text-slate-900 mb-2">
                  {{ productDetail.name }}
                </h1>
                <div class="flex items-center gap-4 mb-3">
                  <span
                    class="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded"
                  >
                    {{ productDetail.code }}
                  </span>
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    :class="
                      productDetail.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    "
                  >
                    {{ productDetail.is_active ? "Đang bán" : "Ngừng bán" }}
                  </span>
                </div>
                <div class="text-xl font-semibold text-blue-600 mb-2">
                  {{ formatPrice(productDetail.price) }}
                </div>
                <p
                  v-if="productDetail.description"
                  class="text-sm text-slate-500 mb-3 line-clamp-2"
                >
                  {{ productDetail.description }}
                </p>

                <!-- Total stock summary -->
                <div class="flex items-center gap-4 mt-3">
                  <div
                    class="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg"
                  >
                    <i class="fa-solid fa-cubes text-blue-500"></i>
                    <span class="text-sm text-slate-600">Tổng tồn kho:</span>
                    <span
                      class="font-bold text-lg"
                      :class="
                        productDetail.total_stock > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                    >
                      {{ productDetail.total_stock }}
                    </span>
                  </div>
                  <div
                    class="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg"
                  >
                    <i class="fa-solid fa-store text-purple-500"></i>
                    <span class="text-sm text-slate-600">Chi nhánh:</span>
                    <span class="font-semibold">{{
                      productDetail.stores?.length || 0
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Right: Product Image -->
              <div
                class="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow"
              >
                <el-image
                  :src="getImageUrl(productDetail.imageUrl)"
                  fit="cover"
                  class="w-full h-full"
                >
                  <template #error>
                    <div
                      class="w-full h-full flex items-center justify-center bg-slate-100"
                    >
                      <el-icon color="#ccc" :size="40"><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>
          </div>

          <!-- Variants Card (if multiple) -->
          <div
            v-if="productDetail.variants && productDetail.variants.length > 1"
            class="bg-white rounded-lg shadow-sm border"
          >
            <div class="px-6 py-4 border-b flex items-center gap-2">
              <i class="fa-solid fa-tags text-blue-500"></i>
              <h2 class="text-base font-semibold">Biến thể sản phẩm</h2>
              <span class="text-sm text-slate-400"
                >({{ productDetail.variants.length }})</span
              >
            </div>
            <div class="divide-y">
              <div
                v-for="v in productDetail.variants"
                :key="v.id"
                class="px-6 py-3 flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <span class="font-medium text-slate-800">{{
                    v.name || "Mặc định"
                  }}</span>
                  <span class="text-xs font-mono text-slate-400">{{
                    v.sku
                  }}</span>
                </div>
                <div class="flex items-center gap-6">
                  <span class="text-sm text-slate-600">{{
                    formatPrice(v.selling_price)
                  }}</span>
                  <span
                    class="inline-flex items-center gap-1 text-sm px-2.5 py-0.5 rounded-full font-medium"
                    :class="stockClass(v.total_stock)"
                  >
                    <i class="fa-solid fa-cube text-[10px]"></i>
                    {{ v.total_stock }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Branch Stock Table -->
          <div class="bg-white rounded-lg shadow-sm border">
            <div class="px-6 py-4 border-b flex items-center gap-2">
              <i class="fa-solid fa-location-dot text-green-500"></i>
              <h2 class="text-base font-semibold">Tồn kho theo chi nhánh</h2>
            </div>

            <div
              v-if="productDetail.stores && productDetail.stores.length > 0"
              class="divide-y"
            >
              <div
                v-for="store in productDetail.stores"
                :key="store.store_id"
                class="px-6 py-4"
              >
                <!-- Store header -->
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-store text-slate-400"></i>
                    <span class="font-semibold text-slate-900">{{
                      store.store_name
                    }}</span>
                    <span class="text-xs text-slate-400"
                      >({{ store.store_code }})</span
                    >
                    <span v-if="store.city" class="text-xs text-slate-400">
                      <i class="fa-solid fa-map-pin mr-0.5"></i>{{ store.city }}
                    </span>
                  </div>
                  <span
                    class="font-bold text-sm px-2.5 py-0.5 rounded-full"
                    :class="stockClass(getTotalStoreStock(store))"
                  >
                    Tổng: {{ getTotalStoreStock(store) }}
                  </span>
                </div>

                <!-- Variant breakdown within store -->
                <div
                  v-if="store.variants && store.variants.length > 0"
                  class="ml-6 space-y-1.5"
                >
                  <div
                    v-for="sv in store.variants"
                    :key="sv.variant_id"
                    class="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-slate-50"
                  >
                    <span class="text-slate-600">
                      {{ getVariantName(sv.variant_id) }}
                    </span>
                    <div class="flex items-center gap-4">
                      <span class="text-slate-500">
                        Tồn:
                        <span
                          class="font-semibold"
                          :class="
                            sv.stock > 0 ? 'text-green-600' : 'text-red-600'
                          "
                          >{{ sv.stock }}</span
                        >
                      </span>
                      <span
                        v-if="sv.reserved > 0"
                        class="text-yellow-600 text-xs"
                      >
                        (Đặt trước: {{ sv.reserved }})
                      </span>
                      <span
                        v-if="sv.reorder_point > 0"
                        class="text-xs text-slate-400"
                      >
                        Tối thiểu: {{ sv.reorder_point }}
                      </span>
                      <span
                        v-if="
                          sv.stock <= sv.reorder_point && sv.reorder_point > 0
                        "
                        class="text-xs text-red-500 font-medium"
                      >
                        <i class="fa-solid fa-triangle-exclamation mr-0.5"></i
                        >Cần nhập thêm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty store state -->
            <div v-else class="px-6 py-12 text-center">
              <div class="text-4xl text-slate-300 mb-3">
                <i class="fa-solid fa-warehouse"></i>
              </div>
              <p class="text-slate-500">
                Chưa có dữ liệu tồn kho tại các chi nhánh
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft, Search, Picture } from "@element-plus/icons-vue";
import { getProductInventoryDetail } from "@/services/inventoryLookupService";

const route = useRoute();
const router = useRouter();

const searchInputRef = ref(null);
const searchQuery = ref("");
const loading = ref(false);
const productDetail = ref(null);

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
  return `http://localhost:5000${url}`;
};

// Get variant name by ID
const getVariantName = (variantId) => {
  if (!productDetail.value?.variants) return "Mặc định";
  const v = productDetail.value.variants.find((x) => x.id === variantId);
  return v ? v.name || v.sku || "Mặc định" : "Mặc định";
};

// Get total stock for a store
const getTotalStoreStock = (store) => {
  if (!store.variants) return 0;
  return store.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
};

// Fetch product inventory detail
const fetchProductDetail = async () => {
  loading.value = true;
  try {
    const productId = route.params.productId;
    const response = await getProductInventoryDetail(productId);
    if (response.success) {
      productDetail.value = response.data;
    } else {
      throw new Error(response.message || "Lỗi tải dữ liệu");
    }
  } catch (error) {
    console.error("Error fetching product detail:", error);
    ElMessage.error("Không thể tải thông tin sản phẩm");
    productDetail.value = null;
  } finally {
    loading.value = false;
  }
};

// Handle search submit
const handleSearchSubmit = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: "/staff/inventory-lookup",
      query: { q: searchQuery.value },
    });
  }
};

// Go back to list
const goBack = () => {
  router.push("/staff/inventory-lookup");
};

// Keyboard shortcut F3 to focus search
const handleKeydown = (e) => {
  if (e.key === "F3") {
    e.preventDefault();
    searchInputRef.value?.focus();
  }
};

onMounted(() => {
  fetchProductDetail();
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
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
