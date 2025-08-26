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
      <div class="user-avatar">{{ userInitials }}</div>
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
import { ref, computed } from "vue";

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
        item.text.toLowerCase().includes(searchQuery.value.toLowerCase())
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
    const dropdownOpen = ref(false);
    const userDisplayName = "Admin TUNA Spa";
    const userInitials = computed(() => {
      return userDisplayName
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
    const logout = () => {
      window.location.href = "/login";
      console.log("Đăng xuất");
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
  background: #f5f5f5;
  color: black;
  padding-top: 10px;
  padding-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.08);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  border-bottom: 2px solid #b5b5b5;
}

/* input */
.search-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 14px;
  color: #999;
  font-size: 1.1rem;
  z-index: 2;
}
.search-input {
  width: 400px;
  padding: 12px 20px 12px 38px; /* padding-left để icon không đè lên text */
  border: none;
  border-radius: 5px;
  font-size: 16px;
  background: #f5f5f5;
  box-shadow: none;
  outline: none;
  transition: all 0.3s;
  border-radius: 1px solid #0dff01;
}
.search-input:focus {
  border: none;
  background: #eaeaea;
}

/* icon buttons */
.icon-btn {
  margin-left: 20px;
  background: none;
  border: none;
  border-radius: 0;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s;
  border-radius: 8px;
}
.icon-btn:hover {
  background: #fff;
}
.icon-btn:hover i {
  color: #2563eb; /* Màu xanh hoặc chọn màu bạn thích */
}
.icon-btn i {
  font-size: 1.3rem;
  color: #555;
  transition: color 0.2s;
}

.Notification .dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e53935;
}

/* Popover: Help */
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
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
}
.help-item:hover {
  background: #f6f6f6;
}
.help-item i {
  color: #6b7280;
  width: 18px;
  text-align: center;
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
  color: #222;
}
.help-item .subtitle {
  font-size: 0.86rem;
  color: #707885;
  margin-top: 2px;
  max-width: 220px;
}
.help-item .end {
  margin-left: auto;
  color: #9aa0a6;
}
.help-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid #eee;
  padding: 10px 16px 12px 16px;
}
.help-footer .hotline {
  color: #0a66c2;
  font-weight: 700;
  text-decoration: none;
}
.help-footer .support {
  color: #0a66c2;
  text-decoration: none;
}

/* Popover: Notification */
.notif-popover {
  padding: 0;
}
.notif-wrapper {
  width: 100%;
}
.notif-title {
  font-weight: 700;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
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
  padding: 28px 10px;
  color: #7a8599;
}
.empty-text {
  margin-top: 10px;
}

.notif-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.notif-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.notif-item .text {
  color: #222;
}
.notif-item .time {
  color: #999;
  font-size: 0.9em;
}

/* Suggestions */
.suggestions-box {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 5px;
  max-height: 300px;
  overflow-y: auto;
}
.suggestion-header {
  padding: 10px 15px;
  font-weight: bold;
  color: #555;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}
.suggestion-item {
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.suggestion-item:hover {
  background-color: #f0f0f0;
}
.suggestion-icon {
  margin-right: 10px;
  color: #4caf50;
}

/* User dropdown (giữ nguyên) */
.user-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 24px;
  outline: none;
  user-select: none;
  margin-right: 20px;
}
.user-avatar {
  width: 38px;
  height: 38px;
  background: #f5b041;
  color: #fff;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  box-shadow: 0 2px 8px rgba(241, 196, 15, 0.12);
}
.user-name {
  font-weight: 600;
  color: #222;
  margin-right: 8px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dropdown-icon {
  font-size: 0.9rem;
  color: #888;
}
.dropdown-menu {
  position: absolute;
  top: 120%;
  right: 0;
  min-width: 220px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(44, 62, 80, 0.18);
  z-index: 1001;
  padding: 8px 0;
  animation: fadeIn 0.18s;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.dropdown-item {
  padding: 12px 22px;
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #222;
  cursor: pointer;
  transition: background 0.18s;
  gap: 10px;
}
.dropdown-item:hover {
  background: #f6f6f6;
}
.dropdown-divider {
  height: 1px;
  background: #eee;
  margin: 6px 0;
}

@media (max-width: 900px) {
  .header {
    z-index: 1998;
    padding: 14px 12px;
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .search-container {
    max-width: 100vw;
    width: 100%;
    margin: 0;
    flex: 1 1 0;
    display: flex;
    justify-content: center;
  }
  .search-input {
    width: 100%;
    min-width: 120px;
    max-width: 350px;
    font-size: 15px;
    padding: 8px 8px;
    margin: 0 auto;
    display: block;
  }
  .icon-btn {
    margin-left: 12px;
  }
  .user-dropdown {
    margin-left: 8px;
    margin-top: 0;
    font-size: 1.4rem;
  }
  .user-name {
    max-width: 60px;
    font-size: 0.92rem;
    display: none;
  }
  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.95rem;
    margin-right: 4px;
  }
  .dropdown-menu {
    min-width: 200px;
    right: 0;
    top: 110%;
  }
  .dropdown-item {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
}
@media (max-width: 600px) {
  .header {
    padding: 14px 12px;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }
  .search-container {
    margin-bottom: 0;
    flex: 1 1 0;
    display: flex;
    justify-content: center;
  }
  .search-input {
    width: 60%;
    min-width: 80px;
    max-width: 200px;
    font-size: 0.95rem;
    padding: 7px 6px;
    margin: 0 auto;
    display: block;
  }
  .user-dropdown {
    margin-left: 12px;
    margin-top: 0;
    font-size: 1.9rem;
  }
  .dropdown-menu {
    right: 0;
    top: 110%;
    width: 120px;
  }
  .dropdown-item {
    padding: 7px 8px;
    font-size: 1.5rem;
  }
  .user-avatar {
    width: 35px;
    height: 35px;
    font-size: 1.3rem;
  }
}
</style>
