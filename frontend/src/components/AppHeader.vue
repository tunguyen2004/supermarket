<!-- src/components/Header.vue (updated) -->
<template>
  <header class="header">
    <!-- Search -->
    <div class="search-container">
      <span class="search-icon">
        <i class="fa fa-search"></i>
      </span>
      <input
        v-model="searchQuery"
        @focus="showSuggestions = true"
        @blur="onInputBlur"
        class="search-input"
        placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..."
        type="text"
      />

      <div v-if="showSuggestions" class="suggestions-box" @mousedown.prevent>
        <div class="suggestion-header">Gợi ý tìm kiếm</div>

        <div
          v-for="(item, index) in filteredSuggestions"
          :key="index"
          class="suggestion-item"
          @click="selectSuggestion(item)"
        >
          <span class="suggestion-icon">{{ item.icon }}</span>
          <span>{{ item.text }}</span>
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
import { ref, computed, onMounted } from "vue";
import { ElPopover, ElTabs, ElTabPane } from "element-plus";
import { useAuth } from "@/composables/useAuth";
import authService from "@/services/authService";
import apiClient from "@/services/apiClient";
import { getProfile } from "@/services/userService";

export default {
  name: "AppHeader",
  setup() {
    // Search + gợi ý
    const searchQuery = ref("");
    const showSuggestions = ref(false);
    const suggestions = ref([
      { icon: "🔍", text: "Sản phẩm bán chạy", type: "product" },
      { icon: "📦", text: "Đơn hàng gần đây", type: "order" },
      { icon: "👤", text: "Khách hàng thân thiết", type: "customer" },
      { icon: "💰", text: "Khuyến mãi đặc biệt", type: "promotion" },
    ]);
    const filteredSuggestions = computed(() => {
      if (!searchQuery.value) return suggestions.value;
      return suggestions.value.filter((item) =>
        item.text.toLowerCase().includes(searchQuery.value.toLowerCase()),
      );
    });
    const selectSuggestion = (item) => {
      searchQuery.value = item.text;
      showSuggestions.value = false;
      console.log("Đã chọn:", item);
    };
    const onInputBlur = () => {
      setTimeout(() => {
        showSuggestions.value = false;
      }, 200);
    };

    // Trợ giúp / Thông báo popover
    const helpOpen = ref(false);
    const notifOpen = ref(false);
    const activeNotifTab = ref("system");

    // Thông báo: để trống để hiển thị trạng thái rỗng như ảnh
    const notifications = ref([]);
    const unreadCount = computed(() => notifications.value.length);

    // User dropdown
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

    const userDisplayName = computed(() => {
      return (
        user.value?.full_name || user.value?.username || "Admin Supermarket"
      );
    });

    const userInitials = computed(() => {
      return (userDisplayName.value || "")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    });
    const toggleDropdown = () => {
      dropdownOpen.value = !dropdownOpen.value;
    };
    const closeDropdown = () => {
      setTimeout(() => {
        dropdownOpen.value = false;
      }, 150);
    };

    // Utils
    const goTo = (path) => {
      window.location.href = path;
    };

    return {
      // search
      searchQuery,
      showSuggestions,
      filteredSuggestions,
      selectSuggestion,
      onInputBlur,
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
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  border-bottom: 1px solid var(--border, #e2e8f0);
}

/* Search */
.search-container {
  position: relative;
  max-width: 480px;
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
  width: 400px;
  padding: 10px 16px 10px 40px;
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
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
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

/* Suggestions */
.suggestions-box {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  max-height: 320px;
  overflow-y: auto;
  animation: fadeInDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.suggestion-header {
  padding: 10px 16px;
  font-weight: 600;
  color: #94a3b8;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.suggestion-item {
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.15s;
  border-radius: 6px;
  margin: 2px 4px;
}
.suggestion-item:hover {
  background: #f1f5f9;
}
.suggestion-icon {
  margin-right: 10px;
  font-size: 1rem;
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
    padding: 8px 12px 8px 36px;
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
  .user-avatar,
  .user-avatar-img {
    width: 32px;
    height: 32px;
  }
}
</style>
