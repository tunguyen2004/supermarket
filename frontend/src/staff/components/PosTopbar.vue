<template>
  <!-- Header fixed full width -->
  <header
    class="fixed top-0 left-0 right-0 h-15 text-white z-50 flex items-center px-3"
  >
    <!-- Logo -->
    <div class="flex items-center justify-center mr-3">
      <el-dropdown trigger="click" placement="bottom-start">
        <button
          class="w-8 h-8 rounded-lg bg-white grid place-items-center shadow-sm p-1"
          title="Menu"
        >
          <img
            src="/logo-icon.png"
            alt="Logo"
            class="w-full h-full object-contain text-2xl"
          />
        </button>

        <template #dropdown>
          <div
            class="w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 text-slate-800 text-lg"
          >
            <button class="menu-item" @click="go('/staff/pos')">
              Bán hàng
            </button>
            <button class="menu-item" @click="go('/staff/pos')">
              Trả hàng
            </button>

            <div class="my-2 h-px bg-slate-200"></div>

            <button class="menu-item" @click="go('/staff/orders')">
              Tra cứu đơn hàng
            </button>
            <button class="menu-item" @click="go('/staff/end-of-day')">
              Báo cáo cuối ngày
            </button>
            <!-- tồn kho làm sau -->
            <!-- <button class="menu-item" @click="go('/staff/inventories')">Tra cứu tồn kho</button> -->
          </div>
        </template>
      </el-dropdown>
    </div>

    <!-- Search - Large -->
    <div class="flex-1 max-w-xl mr-4 relative">
      <div
        class="bg-white rounded-[50px] px-4 py-2 flex items-center gap-3 h-[45px] shadow-sm focus-within:outline-none focus-within:ring-0"
      >
        <span class="text-slate-400 text-xl"
          ><i class="fa-solid fa-magnifying-glass"></i
        ></span>

        <input
          v-model="searchQuery"
          @input="handleSearchInput"
          @keydown.enter="handleSearchEnter"
          @focus="showDropdown = true"
          @blur="handleSearchBlur"
          class="bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full placeholder-slate-400 text-slate-700 text-sm font-medium"
          placeholder="Nhập tên sản phẩm hoặc mã SKU"
        />

        <kbd class="search-kbd">F3</kbd>
      </div>

      <!-- Search Results Dropdown -->
      <div
        v-if="showDropdown && (searchResults.length > 0 || isSearching)"
        class="search-dropdown"
      >
        <!-- Loading State -->
        <div v-if="isSearching" class="search-item">
          <i class="fa-solid fa-spinner fa-spin mr-2"></i>
          Đang tìm kiếm...
        </div>

        <!-- Search Results -->
        <div
          v-else-if="searchResults.length > 0"
          v-for="product in searchResults.slice(0, 5)"
          :key="product.id"
          class="search-item"
          @mousedown="selectProduct(product)"
        >
          <div class="search-thumb">
            <img v-if="product.image" :src="product.image" :alt="product.name" />
            <span v-else>📦</span>
          </div>
          <div class="flex-1">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-meta">
              <span class="product-sku">{{ product.sku }}</span> •
              <span class="product-price">{{
                formatPrice(product.price)
              }}</span>
              •
              <span class="product-stock">Tồn: {{ product.stock }}</span>
            </div>
          </div>
          <div class="add-icon">
            <i class="fa-solid fa-plus"></i>
          </div>
        </div>

        <!-- No Results -->
        <div v-else class="search-item text-gray-500">
          Không tìm thấy sản phẩm nào
        </div>
      </div>
    </div>

    <!-- Tabs Đơn hàng - Center -->
    <div class="flex items-center gap-2 mx-4">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="tab-button"
        :class="t.id === activeId ? 'tab-active' : 'tab-inactive'"
        @click="$emit('select', t.id)"
      >
        <span>{{ t.name }}</span>
        <button
          class="close-btn"
          :class="t.id === activeId ? 'close-btn-active' : 'close-btn-inactive'"
          @click.stop="$emit('close', t.id)"
          title="Đóng đơn"
        >
          ×
        </button>
      </button>

      <button class="add-tab-btn" @click="$emit('add')" title="Thêm đơn mới">
        +
      </button>
    </div>

    <!-- Right Section - Info & User -->
    <div class="ml-auto flex items-center gap-3">
      <!-- Branch Info -->
      <div
        class="flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded-lg hover:bg-blue-700 transition cursor-pointer"
      >
        <span class="text-xl"><i class="fa-solid fa-location-dot"></i></span>
        <span class="text-xs font-medium">{{ props.storeName }}</span>
      </div>

      <!-- Status Icons -->
      <div class="flex items-center gap-1">
        <button
          class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition"
          title="Kết nối WiFi"
        >
          <span class="text-lg"><i class="fa-solid fa-wifi"></i></span>
        </button>

        <button
          class="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition"
          title="Thông báo"
        >
          <span class="text-xl"><i class="fa-solid fa-bell"></i></span>
          <span
            class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
          >
            2
          </span>
        </button>
      </div>

      <!-- User Avatar -->
      <el-dropdown trigger="click" placement="bottom-end">
        <div class="user-avatar" :title="userDisplayName">
          {{ userInitials }}
        </div>

        <template #dropdown>
          <div
            class="w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2 text-slate-800 text-lg"
          >
            <div class="px-3 py-2 font-semibold border-b border-slate-200 mb-2">
              <span class="user-name">{{ userDisplayName }}</span>
            </div>
            <button class="menu-item">
              <span class="mr-2"><i class="fa-solid fa-heart"></i></span> Góp ý
            </button>
            <button class="menu-item" @click="logout">
              <span class="mr-2"
                ><i class="fa-solid fa-arrow-right-from-bracket"></i
              ></span>
              Đăng xuất
            </button>
          </div>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const props = defineProps({
  tabs: { type: Array, required: true },
  activeId: { type: [String, Number], required: true },
  searchResults: { type: Array, default: () => [] },
  isSearching: { type: Boolean, default: false },
  storeName: { type: String, default: "Cửa hàng chính" },
});

const emit = defineEmits([
  "add",
  "select",
  "close",
  "search",
  "selectProduct",
  "clearSearch",
]);

// Search functionality
const searchQuery = ref("");
const showDropdown = ref(false);
let searchTimeout = null;

const handleSearchInput = () => {
  // Debounce search input
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim()) {
      emit("search", searchQuery.value.trim());
    } else {
      emit("clearSearch");
    }
  }, 500); // Wait 500ms after user stops typing
};

const handleSearchEnter = () => {
  // Immediate search on Enter
  clearTimeout(searchTimeout);
  if (searchQuery.value.trim()) {
    emit("search", searchQuery.value.trim());
  }
};

const handleSearchBlur = () => {
  // Hide dropdown after a small delay to allow for click
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

const selectProduct = (product) => {
  emit("selectProduct", product);
  searchQuery.value = ""; // Clear search
  showDropdown.value = false;
  emit("clearSearch");
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const router = useRouter();
const go = (path) => router.push(path);
const { logout, user } = useAuth();

const userDisplayName = computed(
  () => user.value?.full_name || user.value?.username || "Admin dohuyy",
);
const userInitials = computed(() => {
  const name = userDisplayName.value;
  return name.charAt(0).toUpperCase();
});
</script>

<style scoped>
header {
  /* height: 60px; */
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.user-avatar:hover {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: scale(1.05);
}

.user-name {
  font-weight: 600;
}

.menu-item {
  width: 100%;
  text-align: left;
  padding: 10px 10px;
  border-radius: 10px;
}
.menu-item:hover {
  background: rgb(241 245 249); /* slate-100 */
}

.search-kbd {
  padding: 2px 6px;
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* ===== TAB STYLES ===== */
.tab-button {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: none;
  cursor: pointer;
}

/* Active Tab - White Background, Dark Text */
.tab-active {
  background: white;
  color: #1e293b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
  z-index: 10;
}

.tab-active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.8) 20%,
    rgba(255, 255, 255, 1) 50%,
    rgba(255, 255, 255, 0.8) 80%,
    transparent 100%
  );
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.8),
    0 0 20px rgba(255, 255, 255, 0.4);
}

/* Close Button - Base */
.close-btn {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 4px;
}

/* Close Button - Active Tab */
.close-btn-active {
  color: #64748b;
}

.close-btn-active:hover {
  background: #f1f5f9;
  color: #dc2626;
  transform: scale(1.1);
}

/* Close Button - Inactive Tab */
.close-btn-inactive {
  color: rgba(255, 255, 255, 0.6);
}

.close-btn-inactive:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: scale(1.1);
}

/* Inactive Tab - Dark Background, White Text */
.tab-inactive {
  background: rgba(30, 58, 138, 0.6);
  color: rgba(255, 255, 255, 0.85);
}

.tab-inactive:hover {
  background: rgba(30, 58, 138, 0.8);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Add Tab Button */
.add-tab-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(30, 58, 138, 0.6);
  color: white;
  font-size: 20px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-tab-btn:hover {
  background: rgba(30, 58, 138, 0.8);
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* ===== SEARCH DROPDOWN ===== */
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
  border: 1px solid #e2e8f0;
}

.search-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover {
  background: #f8fafc;
}

.search-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.search-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.search-thumb span {
  font-size: 1rem;
  opacity: 0.3;
}

.product-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
  margin-bottom: 2px;
}

.product-meta {
  font-size: 0.75rem;
  color: #64748b;
}

.product-sku {
  color: #7c3aed;
}

.product-price {
  color: #059669;
  font-weight: 600;
}

.product-stock {
  color: #dc2626;
}

.add-icon {
  width: 24px;
  height: 24px;
  background: #1e40af;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}
</style>
