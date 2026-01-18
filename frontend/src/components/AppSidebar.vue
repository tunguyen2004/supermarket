<template>
  <div>
    <nav
      class="sidebar"
      :class="{
        collapsed: isCollapsed && !isMobile,
        mobile: isMobile,
        open: isMobile && mobileOpen,
      }"
      v-show="!isMobile || mobileOpen"
      :style="
        isMobile && mobileOpen
          ? 'width:100vw;min-width:0;max-width:100vh;left:0;height:100%;'
          : ''
      "
    >
      <!-- Header -->
      <div class="sidebar-logo">
        <button class="sidebar-toggle" @click="toggleSidebar">
          <i v-if="isMobile && mobileOpen" class="fa-solid fa-xmark"></i>
          <i v-else class="fa-solid fa-bars"></i>
        </button>
        <span v-if="(!isCollapsed && !isMobile) || (isMobile && mobileOpen)">
          MiniMarket
        </span>
      </div>

      <!-- Menu -->
      <ul class="sidebar-menu">
        <li v-for="item in menuItems" :key="item.to || item.label">
          <!-- Có submenu -->
          <div
            v-if="item.children"
            class="sidebar-parent"
            @mouseenter="onParentEnter(item, $event)"
            @mouseleave="onParentLeave"
          >
            <a
              href="javascript:void(0)"
              @click="handleParentClick(item)"
              :class="{ active: isParentActive(item) }"
            >
              <i class="icon" :class="item.icon"></i>
              <span
                v-if="(!isCollapsed && !isMobile) || (isMobile && mobileOpen)"
              >
                {{ item.label }}
              </span>
            </a>

            <!-- Submenu inline (expanded/mobile) -->
            <ul
              v-if="(!isCollapsed && !isMobile) || (isMobile && mobileOpen)"
              v-show="isParentOpen(item)"
              class="sidebar-submenu"
            >
              <li v-for="sub in item.children" :key="sub.to">
                <router-link
                  :to="sub.to"
                  :class="{ active: isRouteActive(sub.to) }"
                  @click="closeMobileSidebar"
                >
                  <span>{{ sub.label }}</span>
                </router-link>
              </li>
            </ul>

            <!-- Flyout (collapsed desktop) -->
            <ul
              v-else
              class="sidebar-submenu flyout"
              v-show="isHoverOpen(item)"
              :style="{
                top: flyoutPos.top + 'px',
                left: 80 + 'px',
              }"
              @mouseenter="hoverParent = item.label"
              @mouseleave="onParentLeave"
            >
              <li class="flyout-title">{{ item.label }}</li>
              <li v-for="sub in item.children" :key="sub.to">
                <router-link
                  :to="sub.to"
                  :class="{ active: isRouteActive(sub.to) }"
                >
                  <span>{{ sub.label }}</span>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Không có submenu -->
          <router-link
            v-else
            :to="item.to"
            :class="{ active: isRouteActive(item.to) }"
            @click="closeMobileSidebar"
          >
            <i class="icon" :class="item.icon"></i>
            <span
              v-if="(!isCollapsed && !isMobile) || (isMobile && mobileOpen)"
            >
              {{ item.label }}
            </span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Overlay mobile -->
    <div
      v-if="isMobile && mobileOpen"
      class="sidebar-overlay"
      @click="closeMobileSidebar"
      style="z-index: 3999"
    ></div>

    <!-- Nút hamburger (mobile) -->
    <button
      v-if="isMobile && !mobileOpen"
      class="sidebar-hamburger"
      @click="toggleSidebar"
      aria-label="Open menu"
      style="z-index: 4001"
    >
      <i class="fa-solid fa-bars"></i>
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

export default {
  name: "AppSidebar",
  setup() {
    const router = useRouter();
    const route = useRoute();

    const isCollapsed = ref(false);
    const isMobile = ref(false);
    const mobileOpen = ref(false);

    const openParent = ref(null); // mở theo click (expanded/mobile)
    const hoverParent = ref(null); // mở theo hover (collapsed)
    const flyoutPos = ref({ top: 0, left: 0 });

    const menuItems = [
      { to: "/dashboard", icon: "fa-solid fa-house", label: "Tổng quan" },
      { to: "/staff", icon: "fa-solid fa-user", label: "Nhân viên quản lý" },
      {
        icon: "fa-solid fa-file-invoice",
        label: "Đơn hàng",
        children: [
          { to: "/orders", label: "Danh sách đơn hàng" },
          { to: "/draft-orders", label: "Đơn hàng nháp" },
          { to: "/order-returns", label: "Trả hàng" },
          { to: "/checkouts", label: "Đơn chưa hoàn tất" },
        ],
      },
      {
        icon: "fa-solid fa-truck",
        label: "Vận chuyển",
        children: [
          { to: "/reports-shipments", label: "Tổng quan" },
          { to: "/shipments", label: "Vận đơn" },
        ],
      },
      {
        icon: "fa-solid fa-box-archive",
        label: "Sản phẩm",
        children: [
          { to: "/products", label: "Danh sách sản phẩm" },
          { to: "/collections", label: "Danh mục sản phẩm" },
          { to: "/catalogs", label: "Bảng giá" },
        ],
      },
      {
        icon: "fa-solid fa-warehouse",
        label: "Quản lý kho",
        children: [
          { to: "/inventories", label: "Tồn kho" },
          { to: "/purchase-orders", label: "Đặt hàng nhập" },
          { to: "/receive-inventories", label: "Nhập hàng" },
          { to: "/supplier-returns", label: "Trả hàng nhập" },
          { to: "/stock-transfers", label: "Chuyển Kho" },
          { to: "/suppliers", label: "Nhà cung cấp" },
        ],
      },
      {
        icon: "fa-solid fa-users",
        label: "Khách hàng",
        children: [
          { to: "/customer-list", label: "Khách hàng" },
          { to: "/customer-groups", label: "Nhóm khách hàng" },
        ],
      },
      { to: "/discounts", icon: "fa-solid fa-tags", label: "Khuyến mại" },
      { to: "/Fundbook", icon: "fa-solid fa-wallet", label: "Sổ quỹ" },
      {
        icon: "fa-solid fa-chart-line",
        label: "Báo cáo",
        children: [
          { to: "/reports", label: "Tổng quan báo cáo" },
          { to: "/reports-list", label: "Danh sách báo cáo" },
        ],
      },
    ];

    /* Active helpers */
    const isRouteActive = (path) =>
      route.path === path || route.path.startsWith(path + "/");

    const isParentActive = (parentItem) =>
      !!parentItem.children &&
      parentItem.children.some((c) => isRouteActive(c.to));

    const isParentOpen = (item) => openParent.value === item.label;
    const isHoverOpen = (item) => hoverParent.value === item.label;

    /* Handlers */
    const handleParentClick = (item) => {
      // Expanded/mobile: mở inline + điều hướng child đầu
      if (isMobile.value || !isCollapsed.value) {
        openParent.value = isParentOpen(item) ? null : item.label;
        if (item.children?.[0]?.to) {
          router.push(item.children[0].to);
          closeMobileSidebar();
        }
      } else if (item.children?.[0]?.to) {
        // Collapsed desktop: click → đi thẳng child đầu
        router.push(item.children[0].to);
      }
    };

    const onParentEnter = (item, evt) => {
      if (isMobile.value || !isCollapsed.value || !item.children) return;
      hoverParent.value = item.label;

      const rect = evt.currentTarget.getBoundingClientRect();
      const sbEl = document.querySelector(".sidebar");
      const sbWidth = sbEl ? sbEl.getBoundingClientRect().width : 80;
      const GAP = 8;

      const top = Math.max(12, Math.min(rect.top, window.innerHeight - 200));
      flyoutPos.value = { top, left: sbWidth + GAP };
    };

    const onParentLeave = () => {
      if (isMobile.value || !isCollapsed.value) return;
      hoverParent.value = null;
    };

    const setInitialOpenParent = () => {
      for (const it of menuItems) {
        if (isParentActive(it)) {
          openParent.value = it.label;
          break;
        }
      }
    };

    const handleResize = () => {
      if (window.innerWidth <= 900) {
        isMobile.value = true;
        isCollapsed.value = false;
      } else if (window.innerWidth <= 1200) {
        isMobile.value = false;
        isCollapsed.value = true;
      } else {
        isMobile.value = false;
        isCollapsed.value = false;
      }
      if (!isMobile.value) mobileOpen.value = false;
      hoverParent.value = null;
    };

    const toggleSidebar = () => {
      if (isMobile.value) mobileOpen.value = !mobileOpen.value;
      else isCollapsed.value = !isCollapsed.value;
    };

    const closeMobileSidebar = () => {
      if (isMobile.value) mobileOpen.value = false;
    };

    /* Lifecycle */
    onMounted(() => {
      handleResize();
      setInitialOpenParent();
      window.addEventListener("resize", handleResize);
    });
    onBeforeUnmount(() => window.removeEventListener("resize", handleResize));

    watch(
      () => route.path,
      () => {
        hoverParent.value = null;
        setInitialOpenParent();
      }
    );

    return {
      isCollapsed,
      isMobile,
      mobileOpen,
      menuItems,
      openParent,
      hoverParent,
      flyoutPos,
      isParentOpen,
      isParentActive,
      isRouteActive,
      isHoverOpen,
      toggleSidebar,
      closeMobileSidebar,
      handleParentClick,
      onParentEnter,
      onParentLeave,
    };
  },
};
</script>

<style scoped>
/* ===== Base ===== */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: #fff;
  color: #1a1a1a;
  border-right: 1px solid #e5e7eb;
  z-index: 4000;
  display: flex;
  flex-direction: column;
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  transition: width 0.3s ease, left 0.3s ease;
}

/* Chỉ set width cho menu của sidebar (tránh flyout full width) */
.sidebar-menu,
.sidebar-menu ul {
  width: 100%;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  width: 100%;
}

/* Header */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 65px;
  padding: 0 20px;
  font-size: 1.4rem;
  font-weight: 600;
  color: #000;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 101;
  border-bottom: 1px solid #e5e7eb;
}
.sidebar-toggle {
  background: none;
  border: none;
  color: #4b5563;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}
.sidebar-toggle:hover {
  background: #f3f4f6;
}

/* Items */
.sidebar-menu {
  flex: 1 1 auto;
  overflow-y: auto;
}
.sidebar-menu a {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #374151;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background 0.2s, color 0.2s;
}
.sidebar-menu a:hover {
  background: #f3f4f6;
  color: #111827;
}
.icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
  color: #6b7280;
  transition: color 0.2s;
}
a:hover .icon {
  color: #111827;
}

/* Active */
.sidebar-menu a.active,
.sidebar-parent > a.active {
  background: #f3f4f6;
  color: #111827;
  font-weight: 600;
}
.sidebar-submenu a.active {
  background: none !important;
  color: #000;
  font-weight: 600;
}

/* Inline submenu */
.sidebar-parent > a {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}
.sidebar-parent > a span {
  text-align: left;
}
.sidebar-submenu {
  margin-top: 6px;
}
.sidebar-submenu a {
  padding-left: 40px;
  font-size: 0.97rem;
  font-weight: 400;
  color: #4b5563;
  background: none !important;
  margin-bottom: 6px;
}
.sidebar-submenu a:hover {
  color: #111827;
}

/* ===== Collapsed (desktop) ===== */
.sidebar.collapsed {
  width: 80px;
}
.sidebar.collapsed .sidebar-logo {
  justify-content: center;
  padding: 0;
}

/* Ẩn chữ CHỈ ở link cấp 1 (không ảnh hưởng flyout) */
.sidebar.collapsed .sidebar-logo span,
.sidebar.collapsed > .sidebar-menu > li > a span,
.sidebar.collapsed > .sidebar-menu > li > .sidebar-parent > a span {
  display: none !important;
}

/* Căn giữa chỉ ở link cấp 1 */
.sidebar.collapsed > .sidebar-menu > li > a,
.sidebar.collapsed > .sidebar-menu > li > .sidebar-parent > a {
  justify-content: center;
}

.sidebar.collapsed .icon {
  font-size: 1.4rem;
  margin: 0;
}

/* Ẩn submenu inline khi collapsed (KHÔNG ẩn flyout) */
.sidebar.collapsed .sidebar-submenu:not(.flyout) {
  display: none !important;
}

/* ===== Flyout (hover khi collapsed) ===== */
/* KHÔNG đặt display ở đây — để v-show điều khiển */
.sidebar.collapsed .sidebar-submenu.flyout {
  position: fixed;
  width: max-content;
  min-width: 220px;
  max-width: 360px;
  max-height: calc(100vh - 24px);
  overflow: auto;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  padding: 8px;
  z-index: 5000;
}
.sidebar.collapsed .sidebar-submenu.flyout a span {
  display: inline !important;
} /* bảo đảm hiện chữ */
.sidebar-submenu.flyout li {
  margin: 0;
}
.sidebar-submenu.flyout a {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 12px;
  border-radius: 8px;
  color: #374151;
  text-decoration: none;
}
.sidebar-submenu.flyout a:hover {
  background: #f3f4f6;
  color: #111827;
}
.sidebar-submenu.flyout .flyout-title {
  font-weight: 700;
  color: #111827;
  padding: 8px 12px 6px;
  pointer-events: none;
}
.sidebar-menu a.active .icon,
.sidebar-parent > a.active .icon,
.sidebar-submenu a.active .icon {
  color: #111827; /* hoặc #000 nếu muốn đen hẳn */
}

/* ===== Mobile ===== */
.sidebar-hamburger {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 4001;
  background: #fff;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(9, 30, 66, 0.2);
  z-index: 3999;
}
@media (min-width: 901px) {
  .sidebar-hamburger {
    display: none !important;
  }
}
@media (max-width: 900px) {
  .sidebar {
    width: 300px;
    max-width: calc(100vw - 60px);
    left: -320px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-right: none;
    transition: left 0.3s ease;
  }
  .sidebar.open {
    left: 0;
  }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
