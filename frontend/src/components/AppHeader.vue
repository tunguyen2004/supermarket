<!-- src/components/Header.vue (updated) -->
<template>
  <header class="header">
    <!-- Global Search -->
    <div class="search-container" ref="searchContainerRef">
      <span class="search-icon">
        <i class="fa fa-search"></i>
      </span>
      <input
        ref="searchInputRef"
        v-model="searchQuery"
        @focus="onSearchFocus"
        @blur="onInputBlur"
        @keydown="onSearchKeydown"
        class="search-input"
        placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..."
        type="text"
      />
      <span
        v-if="searchQuery"
        class="search-clear"
        @mousedown.prevent="clearSearch"
      >
        <i class="fa fa-times"></i>
      </span>

      <div v-if="showDropdown" class="search-dropdown" @mousedown.prevent>
        <!-- Loading -->
        <div v-if="isSearching" class="search-loading">
          <i class="fa fa-spinner fa-spin"></i>
          <span>Đang tìm kiếm...</span>
        </div>

        <!-- Kết quả tìm kiếm -->
        <template v-else-if="searchQuery.trim().length > 0 && hasResults">
          <!-- Sản phẩm -->
          <div v-if="searchResults.products.length" class="result-section">
            <div class="result-section-header">
              <i class="fa fa-box"></i>
              <span>Sản phẩm</span>
              <span class="result-count">{{
                searchResults.products.length
              }}</span>
            </div>
            <div
              v-for="(item, idx) in searchResults.products"
              :key="'p-' + item.id"
              class="result-item"
              :class="{
                active: highlightIndex === getGlobalIndex('products', idx),
              }"
              @click="goToProduct(item)"
              @mouseenter="highlightIndex = getGlobalIndex('products', idx)"
            >
              <div class="result-thumb">
                <img
                  v-if="item.image_url"
                  :src="getImageUrl(item.image_url)"
                  alt=""
                />
                <i v-else class="fa fa-image"></i>
              </div>
              <div class="result-info">
                <div
                  class="result-name"
                  v-html="highlightMatch(item.name)"
                ></div>
                <div class="result-meta">
                  <span class="meta-code">{{ item.code }}</span>
                  <span v-if="item.category_name" class="meta-cat">{{
                    item.category_name
                  }}</span>
                </div>
              </div>
              <div class="result-price">{{ formatPrice(item.price) }}</div>
            </div>
          </div>

          <!-- Đơn hàng -->
          <div v-if="searchResults.orders.length" class="result-section">
            <div class="result-section-header">
              <i class="fa fa-receipt"></i>
              <span>Đơn hàng</span>
              <span class="result-count">{{
                searchResults.orders.length
              }}</span>
            </div>
            <div
              v-for="(item, idx) in searchResults.orders"
              :key="'o-' + item.id"
              class="result-item"
              :class="{
                active: highlightIndex === getGlobalIndex('orders', idx),
              }"
              @click="goToOrder(item)"
              @mouseenter="highlightIndex = getGlobalIndex('orders', idx)"
            >
              <div class="result-icon order-icon">
                <i class="fa fa-file-invoice"></i>
              </div>
              <div class="result-info">
                <div class="result-name">{{ item.order_code }}</div>
                <div class="result-meta">
                  <span :class="'status-badge status-' + item.status">{{
                    getOrderStatusText(item.status)
                  }}</span>
                  <span v-if="item.customer_name" class="meta-customer">{{
                    item.customer_name
                  }}</span>
                </div>
              </div>
              <div class="result-price">
                {{ formatPrice(item.final_amount) }}
              </div>
            </div>
          </div>

          <!-- Khách hàng -->
          <div v-if="searchResults.customers.length" class="result-section">
            <div class="result-section-header">
              <i class="fa fa-users"></i>
              <span>Khách hàng</span>
              <span class="result-count">{{
                searchResults.customers.length
              }}</span>
            </div>
            <div
              v-for="(item, idx) in searchResults.customers"
              :key="'c-' + item.id"
              class="result-item"
              :class="{
                active: highlightIndex === getGlobalIndex('customers', idx),
              }"
              @click="goToCustomer(item)"
              @mouseenter="highlightIndex = getGlobalIndex('customers', idx)"
            >
              <div class="result-icon customer-icon">
                <i class="fa fa-user"></i>
              </div>
              <div class="result-info">
                <div
                  class="result-name"
                  v-html="highlightMatch(item.full_name)"
                ></div>
                <div class="result-meta">
                  <span v-if="item.phone" class="meta-phone"
                    ><i class="fa fa-phone"></i> {{ item.phone }}</span
                  >
                  <span v-if="item.email" class="meta-email">{{
                    item.email
                  }}</span>
                </div>
              </div>
              <div v-if="item.group_name" class="result-tag">
                {{ item.group_name }}
              </div>
            </div>
          </div>
        </template>

        <!-- Không tìm thấy -->
        <div
          v-else-if="
            searchQuery.trim().length > 0 && !hasResults && !isSearching
          "
          class="search-empty"
        >
          <i class="fa fa-search"></i>
          <div>
            Không tìm thấy kết quả cho "<strong>{{ searchQuery }}</strong
            >"
          </div>
          <div class="search-empty-hint">Thử tìm với từ khóa khác</div>
        </div>

        <!-- Tìm kiếm gần đây (khi chưa nhập gì) -->
        <template v-else-if="recentSearches.length > 0">
          <div class="result-section">
            <div class="result-section-header">
              <i class="fa fa-clock"></i>
              <span>Tìm kiếm gần đây</span>
              <span class="clear-recent" @click.stop="clearRecentSearches"
                >Xóa</span
              >
            </div>
            <div
              v-for="(term, idx) in recentSearches"
              :key="'recent-' + idx"
              class="result-item recent-item"
              @click="searchFromRecent(term)"
            >
              <div class="result-icon recent-icon">
                <i class="fa fa-history"></i>
              </div>
              <div class="result-info">
                <div class="result-name">{{ term }}</div>
              </div>
              <span class="remove-recent" @click.stop="removeRecentSearch(idx)">
                <i class="fa fa-times"></i>
              </span>
            </div>
          </div>
        </template>

        <!-- Gợi ý mặc định -->
        <template v-else>
          <div class="result-section">
            <div class="result-section-header">
              <i class="fa fa-lightbulb"></i>
              <span>Gợi ý tìm kiếm</span>
            </div>
            <div class="suggestion-chips">
              <span class="chip" @click="searchFromRecent('Sản phẩm bán chạy')"
                >🔥 Sản phẩm bán chạy</span
              >
              <span class="chip" @click="searchFromRecent('Đơn hàng mới')"
                >📦 Đơn hàng mới</span
              >
              <span class="chip" @click="searchFromRecent('Khách hàng VIP')"
                >⭐ Khách hàng VIP</span
              >
            </div>
          </div>
        </template>

        <!-- Footer shortcut -->
        <div v-if="hasResults" class="search-footer">
          <span><kbd>↑↓</kbd> Di chuyển</span>
          <span><kbd>↵</kbd> Chọn</span>
          <span><kbd>Esc</kbd> Đóng</span>
        </div>
      </div>
    </div>

    <!-- Trợ giúp (giống ảnh 1) -->
    <el-popover
      v-model:visible="helpOpen"
      placement="bottom-start"
      :width="340"
      trigger="click"
      popper-class="help-popover"
    >
      <template #reference>
        <button class="icon-btn question" aria-label="Trợ giúp">
          <i class="fa-solid fa-circle-question"></i>
        </button>
      </template>

      <ul class="help-menu" @click.stop>
        <li class="help-item" @click="goTo('/help')">
          <i class="fa-regular fa-circle-question"></i>
          <span>Trung tâm trợ giúp</span>
        </li>
        <li class="help-item" @click="goTo('/devices')">
          <i class="fa-solid fa-cash-register"></i>
          <span>Thiết bị bán hàng</span>
        </li>
        <li class="help-item" @click="goTo('/feedback')">
          <i class="fa-regular fa-comment-dots"></i>
          <span>Đóng góp ý kiến</span>
        </li>
        <li class="help-item two-line" @click="goTo('/onboarding')">
          <i class="fa-regular fa-compass"></i>
          <div class="text-wrap">
            <div class="title">Dành cho khách hàng mới</div>
            <div class="subtitle">
              Cùng Sapo làm quen phần mềm qua các bước đơn giản
            </div>
          </div>
          <i class="fa fa-chevron-right end"></i>
        </li>
      </ul>

      <div class="help-footer">
        <a class="hotline" href="tel:19006750">1900 6750</a>
        <a class="support" href="mailto:support@example.com">Gửi hỗ trợ</a>
      </div>
    </el-popover>

    <!-- Thông báo (giống ảnh 2) -->
    <el-popover
      v-model:visible="notifOpen"
      placement="bottom"
      :width="520"
      trigger="click"
      popper-class="notif-popover"
    >
      <template #reference>
        <button class="icon-btn Notification" aria-label="Thông báo">
          <i class="fa-solid fa-bell"></i>
          <span
            v-if="unreadCount"
            class="dot"
            aria-label="Có thông báo mới"
          ></span>
        </button>
      </template>

      <div class="notif-wrapper" @click.stop>
        <div class="notif-title">Thông báo</div>
        <el-tabs v-model="activeNotifTab" class="notif-tabs">
          <el-tab-pane label="Hệ thống" name="system">
            <div v-if="!notifications.length" class="empty">
              <div class="empty-illustration" aria-hidden="true">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M60 18c-16 0-29 13-29 29v13H27a6 6 0 100 12h66a6 6 0 100-12h-4V47c0-16-13-29-29-29z"
                    stroke="#C9CDD4"
                    stroke-width="3"
                  />
                  <circle
                    cx="73"
                    cy="74"
                    r="12"
                    stroke="#C9CDD4"
                    stroke-width="3"
                  />
                  <path
                    d="M79 68l-12 12"
                    stroke="#F2994A"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div class="empty-text">
                Cửa hàng của bạn chưa có thông báo nào
              </div>
            </div>
            <ul v-else class="notif-list">
              <li
                v-for="(item, idx) in notifications"
                :key="idx"
                class="notif-item"
              >
                <span class="text">{{ item.text }}</span>
                <span class="time">{{ item.time }}</span>
              </li>
            </ul>
          </el-tab-pane>
          <el-tab-pane label="Tin tức" name="news">
            <div class="empty">Chưa có tin tức mới.</div>
          </el-tab-pane>
          <el-tab-pane label="Khuyến mại" name="promo">
            <div class="empty">Chưa có khuyến mại mới.</div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-popover>

    <!-- User -->
    <div
      class="user-dropdown"
      @click="toggleDropdown"
      @blur="closeDropdown"
      tabindex="0"
    >
      <img
        v-if="avatarUrl"
        :src="fullAvatarUrl"
        class="user-avatar-img"
        alt="User Avatar"
      />
      <div v-else class="user-avatar">{{ userInitials }}</div>
      <span class="user-name">{{ userDisplayName }}</span>
      <i class="fa fa-chevron-down dropdown-icon"></i>
      <div v-if="dropdownOpen" class="dropdown-menu" @mousedown.prevent>
        <router-link to="/account" class="dropdown-item no-underline">
          <i class="fa fa-user"></i>
          Tài khoản của bạn
        </router-link>
        <div class="dropdown-item">
          <i class="fa fa-cube"></i>
          Thông tin gói dịch vụ
        </div>
        <div class="dropdown-item" @click="logout">
          <i class="fa fa-sign-out-alt"></i>
          Đăng xuất
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item">Điều khoản dịch vụ</div>
        <div class="dropdown-item">Chính sách bảo mật</div>
      </div>
    </div>
  </header>
</template>

<script>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { useRouter } from "vue-router";
import { ElPopover, ElTabs, ElTabPane } from "element-plus";
import { useAuth } from "@/composables/useAuth";
import authService from "@/services/authService";
import apiClient from "@/services/apiClient";
import { getProfile } from "@/services/userService";
import { globalSearch } from "@/services/searchService";

export default {
  name: "AppHeader",
  setup() {
    const router = useRouter();

    // =================== GLOBAL SEARCH ===================
    const searchQuery = ref("");
    const showDropdown = ref(false);
    const isSearching = ref(false);
    const highlightIndex = ref(-1);
    const searchInputRef = ref(null);
    const searchContainerRef = ref(null);
    const searchResults = ref({ products: [], orders: [], customers: [] });
    const recentSearches = ref([]);

    // Load recent searches from localStorage
    const RECENT_KEY = "supermarket_recent_searches";
    const loadRecentSearches = () => {
      try {
        const saved = localStorage.getItem(RECENT_KEY);
        recentSearches.value = saved ? JSON.parse(saved) : [];
      } catch {
        recentSearches.value = [];
      }
    };
    loadRecentSearches();

    const saveRecentSearch = (term) => {
      if (!term || term.trim().length < 2) return;
      const trimmed = term.trim();
      recentSearches.value = [
        trimmed,
        ...recentSearches.value.filter((t) => t !== trimmed),
      ].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(recentSearches.value));
    };

    const clearRecentSearches = () => {
      recentSearches.value = [];
      localStorage.removeItem(RECENT_KEY);
    };

    const removeRecentSearch = (idx) => {
      recentSearches.value.splice(idx, 1);
      localStorage.setItem(RECENT_KEY, JSON.stringify(recentSearches.value));
    };

    const hasResults = computed(() => {
      const r = searchResults.value;
      return (
        r.products.length > 0 || r.orders.length > 0 || r.customers.length > 0
      );
    });

    const allResultItems = computed(() => {
      const items = [];
      searchResults.value.products.forEach((p) =>
        items.push({ type: "product", data: p }),
      );
      searchResults.value.orders.forEach((o) =>
        items.push({ type: "order", data: o }),
      );
      searchResults.value.customers.forEach((c) =>
        items.push({ type: "customer", data: c }),
      );
      return items;
    });

    const getGlobalIndex = (section, idx) => {
      let offset = 0;
      if (section === "orders") offset = searchResults.value.products.length;
      if (section === "customers")
        offset =
          searchResults.value.products.length +
          searchResults.value.orders.length;
      return offset + idx;
    };

    // Debounce
    let debounceTimer = null;
    const debounceSearch = (fn, delay = 300) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fn, delay);
    };

    watch(searchQuery, (val) => {
      highlightIndex.value = -1;
      if (!val || val.trim().length < 1) {
        searchResults.value = { products: [], orders: [], customers: [] };
        isSearching.value = false;
        return;
      }
      isSearching.value = true;
      debounceSearch(async () => {
        try {
          const res = await globalSearch(val.trim(), 5);
          if (res.success) {
            searchResults.value = res.data;
          }
        } catch (err) {
          console.error("Search error:", err);
          searchResults.value = { products: [], orders: [], customers: [] };
        } finally {
          isSearching.value = false;
        }
      }, 300);
    });

    const onSearchFocus = () => {
      showDropdown.value = true;
    };

    const onInputBlur = () => {
      setTimeout(() => {
        showDropdown.value = false;
      }, 250);
    };

    const clearSearch = () => {
      searchQuery.value = "";
      searchResults.value = { products: [], orders: [], customers: [] };
      highlightIndex.value = -1;
      nextTick(() => searchInputRef.value?.focus());
    };

    const onSearchKeydown = (e) => {
      const total = allResultItems.value.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        highlightIndex.value = (highlightIndex.value + 1) % Math.max(total, 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        highlightIndex.value =
          highlightIndex.value <= 0 ? total - 1 : highlightIndex.value - 1;
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightIndex.value >= 0 && highlightIndex.value < total) {
          const item = allResultItems.value[highlightIndex.value];
          selectResult(item);
        }
      } else if (e.key === "Escape") {
        showDropdown.value = false;
        searchInputRef.value?.blur();
      }
    };

    const selectResult = (item) => {
      saveRecentSearch(searchQuery.value);
      showDropdown.value = false;
      if (item.type === "product") goToProduct(item.data);
      else if (item.type === "order") goToOrder(item.data);
      else if (item.type === "customer") goToCustomer(item.data);
    };

    const goToProduct = (item) => {
      saveRecentSearch(searchQuery.value);
      showDropdown.value = false;
      router.push({ path: "/products", query: { search: item.code } });
    };

    const goToOrder = (item) => {
      saveRecentSearch(searchQuery.value);
      showDropdown.value = false;
      router.push({ path: `/orders/edit/${item.id}` });
    };

    const goToCustomer = (item) => {
      saveRecentSearch(searchQuery.value);
      showDropdown.value = false;
      router.push({
        path: "/customer-list",
        query: { search: item.phone || item.full_name },
      });
    };

    const searchFromRecent = (term) => {
      searchQuery.value = term;
      showDropdown.value = true;
      nextTick(() => searchInputRef.value?.focus());
    };

    // Helpers
    const getImageUrl = (url) => {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      return `http://localhost:5000${url}`;
    };

    const formatPrice = (price) => {
      if (!price && price !== 0) return "";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    };

    const highlightMatch = (text) => {
      if (!text || !searchQuery.value) return text;
      const q = searchQuery.value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!q) return text;
      return text.replace(new RegExp(`(${q})`, "gi"), "<mark>$1</mark>");
    };

    const orderStatusMap = {
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      returned: "Đã trả",
    };
    const getOrderStatusText = (status) => orderStatusMap[status] || status;

    // Keyboard shortcut: Ctrl+K to focus search
    const handleGlobalKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.value?.focus();
        showDropdown.value = true;
      }
    };

    onMounted(() => {
      window.addEventListener("keydown", handleGlobalKeydown);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleGlobalKeydown);
      clearTimeout(debounceTimer);
    });

    // =================== HELP / NOTIF / USER (unchanged) ===================
    const helpOpen = ref(false);
    const notifOpen = ref(false);
    const activeNotifTab = ref("system");
    const notifications = ref([]);
    const unreadCount = computed(() => notifications.value.length);

    const { user, logout } = useAuth();
    const dropdownOpen = ref(false);
    const avatarUrl = ref("");

    const fullAvatarUrl = computed(() => {
      if (!avatarUrl.value) return "";
      if (avatarUrl.value.startsWith("http")) return avatarUrl.value;
      return `http://localhost:5000${avatarUrl.value}`;
    });

    onMounted(async () => {
      try {
        const res = await getProfile();
        if (res.data && res.data.data && res.data.data.avatar_url) {
          avatarUrl.value = res.data.data.avatar_url;
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    });

    const userDisplayName = computed(
      () =>
        user.value?.full_name || user.value?.username || "Admin Supermarket",
    );
    const userInitials = computed(() =>
      (userDisplayName.value || "")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    );
    const toggleDropdown = () => {
      dropdownOpen.value = !dropdownOpen.value;
    };
    const closeDropdown = () => {
      setTimeout(() => {
        dropdownOpen.value = false;
      }, 150);
    };
    const goTo = (path) => {
      window.location.href = path;
    };

    return {
      // search
      searchQuery,
      showDropdown,
      isSearching,
      searchResults,
      hasResults,
      allResultItems,
      highlightIndex,
      searchInputRef,
      searchContainerRef,
      recentSearches,
      onSearchFocus,
      onInputBlur,
      onSearchKeydown,
      clearSearch,
      goToProduct,
      goToOrder,
      goToCustomer,
      searchFromRecent,
      clearRecentSearches,
      removeRecentSearch,
      getGlobalIndex,
      getImageUrl,
      formatPrice,
      highlightMatch,
      getOrderStatusText,
      // popovers
      helpOpen,
      notifOpen,
      activeNotifTab,
      notifications,
      unreadCount,
      // user
      dropdownOpen,
      toggleDropdown,
      closeDropdown,
      userDisplayName,
      userInitials,
      logout,
      avatarUrl,
      fullAvatarUrl,
      // utils
      goTo,
    };
  },
};
</script>

<style scoped>
.header {
  position: fixed;
  left: 0;
  width: 100%;
  z-index: 2000;
  background: #ffffff;
  color: #1e293b;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  border-bottom: 1px solid var(--border, #e2e8f0);
}

/* Search */
.search-container {
  position: relative;
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 0.95rem;
  z-index: 2;
}
.search-input {
  width: 440px;
  padding: 10px 36px 10px 40px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 10px;
  font-size: 0.9rem;
  background: #f8fafc;
  outline: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  color: #1e293b;
}
.search-input::placeholder {
  color: #94a3b8;
}
.search-input:focus {
  background: #fff;
  border-color: var(--primary, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  width: 480px;
}
.search-clear {
  position: absolute;
  right: 12px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
  z-index: 2;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s;
}
.search-clear:hover {
  background: #e2e8f0;
  color: #64748b;
}

/* Search Dropdown */
.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  min-width: 480px;
  background: #fff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 2001;
  max-height: 460px;
  overflow-y: auto;
  animation: fadeInDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-dropdown::-webkit-scrollbar {
  width: 6px;
}
.search-dropdown::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

/* Loading */
.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 28px 16px;
  color: #94a3b8;
  font-size: 0.9rem;
}
.search-loading i {
  color: var(--primary, #2563eb);
}

/* Result sections */
.result-section {
  padding: 4px 0;
}
.result-section + .result-section {
  border-top: 1px solid #f1f5f9;
}
.result-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.result-section-header i {
  font-size: 0.8rem;
  color: #b0b8c4;
}
.result-count {
  margin-left: auto;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.7rem;
  padding: 1px 7px;
  border-radius: 10px;
  font-weight: 600;
}

/* Result items */
.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 16px;
  cursor: pointer;
  transition: all 0.12s;
  border-radius: 8px;
  margin: 1px 6px;
}
.result-item:hover,
.result-item.active {
  background: #f1f5f9;
}
.result-item.active {
  background: #eff6ff;
}

/* Thumbnail */
.result-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.result-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.result-thumb i {
  color: #cbd5e1;
  font-size: 1rem;
}

/* Result icon (for orders, customers) */
.result-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.95rem;
}
.order-icon {
  background: #eff6ff;
  color: #2563eb;
}
.customer-icon {
  background: #f0fdf4;
  color: #16a34a;
}
.recent-icon {
  background: #f8fafc;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 0.85rem;
}

/* Result info */
.result-info {
  flex: 1;
  min-width: 0;
}
.result-name {
  font-size: 0.88rem;
  color: #1e293b;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.result-name :deep(mark) {
  background: #fef08a;
  color: #1e293b;
  border-radius: 2px;
  padding: 0 1px;
}
.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 3px;
  font-size: 0.78rem;
  color: #94a3b8;
}
.meta-code {
  color: #64748b;
  font-family: "SF Mono", "Cascadia Code", monospace;
  font-size: 0.75rem;
}
.meta-cat {
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.72rem;
}
.meta-phone i {
  font-size: 0.7rem;
  margin-right: 3px;
}
.meta-customer {
  color: #64748b;
}

/* Price */
.result-price {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.85rem;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Tags */
.result-tag {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f0fdf4;
  color: #16a34a;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Status badges */
.status-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
}
.status-pending {
  background: #fef3c7;
  color: #92400e;
}
.status-confirmed {
  background: #dbeafe;
  color: #1e40af;
}
.status-shipping {
  background: #e0e7ff;
  color: #3730a3;
}
.status-completed {
  background: #dcfce7;
  color: #166534;
}
.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}
.status-returned {
  background: #f3e8ff;
  color: #6b21a8;
}

/* Empty state */
.search-empty {
  text-align: center;
  padding: 32px 16px;
  color: #94a3b8;
}
.search-empty i {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #cbd5e1;
}
.search-empty strong {
  color: #64748b;
}
.search-empty-hint {
  margin-top: 6px;
  font-size: 0.8rem;
  color: #cbd5e1;
}

/* Recent searches */
.recent-item {
  gap: 10px;
}
.remove-recent {
  color: #cbd5e1;
  font-size: 0.75rem;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.remove-recent:hover {
  color: #ef4444;
  background: #fef2f2;
}
.clear-recent {
  margin-left: auto;
  font-size: 0.72rem;
  color: var(--primary, #2563eb);
  cursor: pointer;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}
.clear-recent:hover {
  text-decoration: underline;
}

/* Suggestion chips */
.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px 12px;
}
.chip {
  padding: 6px 14px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}
.chip:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

/* Search footer */
.search-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 8px 16px;
  border-top: 1px solid #f1f5f9;
  font-size: 0.72rem;
  color: #94a3b8;
}
.search-footer kbd {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.7rem;
  font-family: inherit;
  color: #64748b;
  margin-right: 3px;
}

/* Icon buttons */
.icon-btn {
  margin-left: 8px;
  background: none;
  border: none;
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}
.icon-btn:hover {
  background: #f1f5f9;
}
.icon-btn:hover i {
  color: var(--primary, #2563eb);
}
.icon-btn i {
  font-size: 1.15rem;
  color: #64748b;
  transition: color 0.2s;
}

.Notification .dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid #fff;
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

/* Help Popover */
.help-popover {
  padding: 8px 0 0 0;
}
.help-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}
.help-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s;
  border-radius: 8px;
  margin: 0 4px;
}
.help-item:hover {
  background: #f1f5f9;
}
.help-item i {
  color: #64748b;
  width: 18px;
  text-align: center;
  font-size: 0.95rem;
}
.help-item.two-line {
  align-items: flex-start;
}
.help-item .text-wrap {
  display: flex;
  flex-direction: column;
}
.help-item .title {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}
.help-item .subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 2px;
  max-width: 220px;
}
.help-item .end {
  margin-left: auto;
  color: #cbd5e1;
}
.help-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid var(--border, #e2e8f0);
  padding: 12px 16px;
}
.help-footer .hotline {
  color: var(--primary, #2563eb);
  font-weight: 700;
  text-decoration: none;
  font-size: 0.9rem;
}
.help-footer .support {
  color: var(--primary, #2563eb);
  text-decoration: none;
  font-size: 0.9rem;
}

/* Notification Popover */
.notif-popover {
  padding: 0;
}
.notif-wrapper {
  width: 100%;
}
.notif-title {
  font-weight: 700;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border, #e2e8f0);
  font-size: 1rem;
  color: #1e293b;
}
.notif-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 12px;
}
.notif-tabs :deep(.el-tabs__content) {
  padding: 14px 16px 16px 16px;
}

.empty {
  text-align: center;
  padding: 32px 16px;
  color: #94a3b8;
}
.empty-text {
  margin-top: 12px;
  font-size: 0.9rem;
}

.notif-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.notif-item {
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.notif-item .text {
  color: #1e293b;
  font-size: 0.9rem;
}
.notif-item .time {
  color: #94a3b8;
  font-size: 0.8rem;
  white-space: nowrap;
}

/* User dropdown */
.user-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 16px;
  outline: none;
  user-select: none;
  padding: 4px 8px;
  border-radius: 10px;
  transition: all 0.2s;
}
.user-dropdown:hover {
  background: #f1f5f9;
}
.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary, #2563eb) 0%, #1d4ed8 100%);
  color: #fff;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}
.user-avatar-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  border: 2px solid #e2e8f0;
}
.user-name {
  font-weight: 600;
  color: #1e293b;
  margin-right: 6px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}
.dropdown-icon {
  font-size: 0.7rem;
  color: #94a3b8;
  transition: transform 0.2s;
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--border, #e2e8f0);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  z-index: 1001;
  padding: 6px;
  animation: fadeInDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-item {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
  gap: 10px;
  border-radius: 8px;
}
.dropdown-item:hover {
  background: #f1f5f9;
  color: #1e293b;
}
.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 0;
}

@media (max-width: 900px) {
  .header {
    z-index: 1998;
    padding: 0 12px;
    height: 56px;
  }
  .search-container {
    max-width: 100vw;
    width: 100%;
    margin: 0;
    flex: 1 1 0;
  }
  .search-input {
    width: 100%;
    min-width: 120px;
    max-width: 350px;
    font-size: 0.85rem;
    padding: 8px 32px 8px 36px;
  }
  .search-input:focus {
    width: 100%;
    max-width: 350px;
  }
  .search-dropdown {
    min-width: 320px;
    left: 0;
    right: auto;
    max-height: 380px;
  }
  .icon-btn {
    margin-left: 4px;
  }
  .user-dropdown {
    margin-left: 4px;
    padding: 4px;
  }
  .user-name {
    max-width: 60px;
    font-size: 0.85rem;
    display: none;
  }
  .user-avatar,
  .user-avatar-img {
    width: 30px;
    height: 30px;
    font-size: 0.85rem;
    margin-right: 4px;
  }
  .dropdown-menu {
    min-width: 200px;
  }
}
@media (max-width: 600px) {
  .search-input {
    width: 60%;
    min-width: 80px;
    max-width: 200px;
    font-size: 0.85rem;
  }
  .search-dropdown {
    min-width: 280px;
    max-height: 340px;
  }
  .result-price {
    display: none;
  }
  .user-avatar,
  .user-avatar-img {
    width: 32px;
    height: 32px;
  }
}
</style>
