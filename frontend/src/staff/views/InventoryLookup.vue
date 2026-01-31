<template>
  <div class="h-full bg-white flex flex-col">
    <PageHeader title="Tra cứu tồn kho" />

    <!-- Search Bar -->
    <div class="px-6 py-4 border-b">
      <div class="relative max-w-2xl">
        <el-input
          ref="searchInputRef"
          v-model="searchQuery"
          size="large"
          placeholder="Tìm kiếm sản phẩm (tên, mã SKU ...) (F3)"
          clearable
          @input="handleSearch"
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
              style="width: 160px"
              @change="handleSortChange"
            >
              <el-option label="Mặc định" value="default" />
              <el-option label="Tên A-Z" value="name_asc" />
              <el-option label="Tên Z-A" value="name_desc" />
              <el-option label="Giá thấp - cao" value="price_asc" />
              <el-option label="Giá cao - thấp" value="price_desc" />
            </el-select>
          </div>

          <!-- Product List -->
          <div v-loading="loading" class="divide-y">
            <!-- Loading Skeleton -->
            <div v-if="loading && products.length === 0" class="space-y-1">
              <div v-for="i in 5" :key="i" class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <el-skeleton animated>
                    <template #template>
                      <el-skeleton-item
                        variant="image"
                        style="width: 60px; height: 60px"
                      />
                    </template>
                  </el-skeleton>
                  <div class="flex-1">
                    <el-skeleton animated>
                      <template #template>
                        <el-skeleton-item variant="text" style="width: 200px" />
                        <el-skeleton-item
                          variant="text"
                          style="width: 150px; margin-top: 8px"
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
              :key="product.id"
              class="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
              @click="goToDetail(product.id)"
            >
              <div class="flex items-center gap-4">
                <!-- Thumbnail -->
                <div
                  class="w-15 h-15 flex-shrink-0 rounded overflow-hidden bg-slate-100"
                >
                  <el-image
                    :src="product.imageUrl || 'https://via.placeholder.com/60'"
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
                  <p
                    v-if="product.subName"
                    class="text-sm text-slate-500 truncate mt-1"
                  >
                    {{ product.subName }}
                  </p>
                </div>

                <!-- Price & Stock -->
                <div class="text-right flex-shrink-0">
                  <div
                    v-if="product.price"
                    class="font-semibold text-slate-900"
                  >
                    {{ formatCurrency(product.price) }}
                  </div>
                  <div class="text-sm text-slate-500 mt-1">
                    Tồn kho: {{ product.stockDisplay || "---" }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="!loading && products.length === 0"
              class="px-6 py-12 text-center"
            >
              <el-icon :size="48" color="#cbd5e1" class="mb-3"><Box /></el-icon>
              <p class="text-slate-500">
                {{
                  searchQuery
                    ? "Không có sản phẩm phù hợp"
                    : "Chưa có sản phẩm nào"
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Search, Picture, Box } from "@element-plus/icons-vue";
import { searchProducts } from "@/services/inventoryLookupService";
import { formatCurrency } from "@/utils/formatCurrency";
import PageHeader from "@/staff/components/PageHeader.vue";

const router = useRouter();
const searchInputRef = ref(null);
const searchQuery = ref("");
const sortBy = ref("default");
const loading = ref(false);
const products = ref([]);
const totalProducts = ref(0);

let searchTimeout = null;

// Search with debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    fetchProducts();
  }, 400);
};

// Fetch products from API
const fetchProducts = async () => {
  loading.value = true;

  try {
    const params = {
      query: searchQuery.value,
      limit: 50,
      offset: 0,
    };

    // Parse sort
    if (sortBy.value !== "default") {
      const [field, order] = sortBy.value.split("_");
      params.sort = field;
      params.order = order;
    }

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

// Handle sort change
const handleSortChange = () => {
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
  fetchProducts();
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
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
