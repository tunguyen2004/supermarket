<template>
  <div class="h-full bg-white flex flex-col">
    <!-- Back Button & Search Bar -->
    <div class="px-6 py-4 border-b space-y-4">
      <!-- Back Button -->
      <div>
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <el-icon><ArrowLeft /></el-icon>
          <span class="font-medium">Tra cứu tồn kho</span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="relative max-w-2xl">
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
        <!-- Product Header Card -->
        <div v-loading="loading" class="bg-white rounded-lg shadow-sm border">
          <!-- Loading Skeleton -->
          <div v-if="loading" class="p-6">
            <div class="flex items-start justify-between gap-6">
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
                      style="width: 120px; margin-top: 8px"
                    />
                  </template>
                </el-skeleton>
              </div>
              <el-skeleton animated>
                <template #template>
                  <el-skeleton-item
                    variant="image"
                    style="width: 120px; height: 120px"
                  />
                </template>
              </el-skeleton>
            </div>
          </div>

          <!-- Product Info -->
          <div v-else-if="productDetail" class="p-6">
            <div class="flex items-start justify-between gap-6">
              <!-- Left: Product Info -->
              <div class="flex-1">
                <h1 class="text-2xl font-bold text-slate-900 mb-3">
                  {{ productDetail.name }}
                </h1>
                <div
                  v-if="productDetail.price"
                  class="text-xl font-semibold text-slate-900 mb-3"
                >
                  {{ formatCurrency(productDetail.price) }}
                </div>
                <a
                  v-if="productDetail.productDetailUrl"
                  :href="productDetail.productDetailUrl"
                  target="_blank"
                  class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>Xem chi tiết</span>
                  <el-icon><TopRight /></el-icon>
                </a>
              </div>

              <!-- Right: Product Image -->
              <div
                class="w-30 h-30 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100"
              >
                <el-image
                  :src="
                    productDetail.imageUrl || 'https://via.placeholder.com/120'
                  "
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

          <!-- Error State -->
          <div v-else class="p-6 text-center text-slate-500">
            <p>Không tìm thấy thông tin sản phẩm</p>
          </div>
        </div>

        <!-- Branch Stock Table -->
        <div
          v-if="!loading && productDetail"
          class="bg-white rounded-lg shadow-sm border"
        >
          <div class="px-6 py-4 border-b">
            <h2 class="text-base font-semibold">Tồn kho theo chi nhánh</h2>
          </div>

          <div class="divide-y">
            <!-- Loading Skeleton -->
            <div v-if="loading" class="space-y-1">
              <div v-for="i in 3" :key="i" class="px-6 py-4">
                <div class="flex items-center justify-between">
                  <el-skeleton animated>
                    <template #template>
                      <el-skeleton-item variant="text" style="width: 200px" />
                    </template>
                  </el-skeleton>
                  <el-skeleton animated>
                    <template #template>
                      <el-skeleton-item variant="text" style="width: 150px" />
                    </template>
                  </el-skeleton>
                </div>
              </div>
            </div>

            <!-- Branch Items -->
            <div
              v-for="branch in productDetail.branches"
              :key="branch.branchId"
              class="px-6 py-4"
            >
              <div class="flex items-center justify-between">
                <!-- Branch Name -->
                <div class="flex items-center gap-2">
                  <el-icon color="#64748b"><Location /></el-icon>
                  <span class="font-medium text-slate-900">{{
                    branch.branchName
                  }}</span>
                </div>

                <!-- Stock Status -->
                <div class="text-slate-600">
                  <span
                    v-if="branch.stockStatus === 'NOT_MANAGED'"
                    class="text-slate-500"
                  >
                    {{ branch.displayText || "Không quản lý tồn kho" }}
                  </span>
                  <span
                    v-else-if="branch.quantity !== undefined"
                    class="font-medium"
                  >
                    Tồn kho: {{ branch.quantity }}
                  </span>
                  <span v-else class="text-slate-500">---</span>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="
                !productDetail.branches || productDetail.branches.length === 0
              "
              class="px-6 py-12 text-center"
            >
              <el-icon :size="48" color="#cbd5e1" class="mb-3"
                ><Location
              /></el-icon>
              <p class="text-slate-500">Chưa có chi nhánh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  ArrowLeft,
  Search,
  Picture,
  Location,
  TopRight,
} from "@element-plus/icons-vue";
import { getProductInventoryDetail } from "@/services/inventoryLookupService";
import { formatCurrency } from "@/utils/formatCurrency";

const route = useRoute();
const router = useRouter();

const searchInputRef = ref(null);
const searchQuery = ref("");
const loading = ref(false);
const productDetail = ref(null);

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

// Handle search submit (search for different product)
const handleSearchSubmit = () => {
  if (searchQuery.value.trim()) {
    // Navigate back to list with search query
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
