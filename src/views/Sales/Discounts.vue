<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Khuyến mại</h1>
      <el-button type="primary" :icon="Plus" @click="createDiscount">
        Tạo khuyến mại
      </el-button>
    </div>

    <el-tabs v-model="activeTab" class="order-tabs">
      <el-tab-pane label="Tất cả" name="all"></el-tab-pane>
      <el-tab-pane label="Đang diễn ra" name="active"></el-tab-pane>
      <el-tab-pane label="Sắp diễn ra" name="scheduled"></el-tab-pane>
      <el-tab-pane label="Đã kết thúc" name="expired"></el-tab-pane>
    </el-tabs>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo tên hoặc mã khuyến mại..."
          clearable
          :prefix-icon="Search"
        />
      </div>

      <el-table
        v-if="!isMobile"
        :data="pagedDiscounts"
        v-loading="isLoading"
        style="width: 100%"
      >
        <el-table-column label="Tên chương trình" min-width="300">
          <template #default="scope">
            <div class="discount-info">
              <div class="discount-name">{{ scope.row.name }}</div>
              <div class="discount-code">
                Mã: <strong>{{ scope.row.code }}</strong>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Thời gian hiệu lực" width="250">
          <template #default="scope">
            <span
              >{{ formatDate(scope.row.startDate) }} -
              {{ formatDate(scope.row.endDate) }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="usageCount"
          label="Lượt sử dụng"
          width="150"
          align="center"
        />
        <el-table-column label="Trạng thái" width="150" align="center">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              effect="light"
              size="small"
            >
              {{ scope.row.status }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="220" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="Edit"
                text
                bg
                @click="editDiscount(scope.row)"
                >Sửa</el-button
              >
              <el-button
                v-if="scope.row.status === 'Đang diễn ra'"
                size="small"
                :icon="CircleClose"
                text
                bg
                type="danger"
                @click="deactivateDiscount(scope.row)"
                >Kết thúc</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="mobile-card-list">
        <div
          v-for="item in pagedDiscounts"
          :key="item.code"
          class="mobile-card"
        >
          <div class="card-header">
            <div class="discount-info">
              <div class="discount-name">{{ item.name }}</div>
              <div class="discount-code">
                Mã: <strong>{{ item.code }}</strong>
              </div>
            </div>
            <el-tag
              :type="getStatusType(item.status)"
              effect="light"
              size="small"
              >{{ item.status }}</el-tag
            >
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Hiệu lực</span>
              <span class="card-value"
                >{{ formatDate(item.startDate) }} -
                {{ formatDate(item.endDate) }}</span
              >
            </div>
            <div class="card-row">
              <span class="card-label">Lượt sử dụng</span>
              <span class="card-value">{{ item.usageCount }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              v-if="item.status === 'Đang diễn ra'"
              size="small"
              :icon="CircleClose"
              text
              bg
              type="danger"
              @click="deactivateDiscount(item)"
              >Kết thúc</el-button
            >
            <el-button
              size="small"
              :icon="Edit"
              text
              bg
              @click="editDiscount(item)"
              >Sửa</el-button
            >
          </div>
        </div>
      </div>

      <el-empty
        v-if="!isLoading && pagedDiscounts.length === 0"
        description="Không có khuyến mại nào phù hợp"
      />
    </div>

    <div class="pagination-container">
      <el-pagination
        v-if="filteredDiscounts.length > 0"
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="filteredDiscounts.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Search, Plus, Edit, CircleClose } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

// --- STATE ---
const router = useRouter();
const isMobile = ref(false);
const isLoading = ref(true);
const search = ref("");
const activeTab = ref("all");
const currentPage = ref(1);
const pageSize = 10;
const discounts = ref([]);

// --- DỮ LIỆU MẪU (đã bỏ status) ---
const sampleDiscounts = [
  {
    id: 1,
    name: "Giảm 20% tổng đơn hàng",
    code: "SALE20",
    startDate: "2025-08-01",
    endDate: "2025-08-31",
    usageCount: 152,
  },
  {
    id: 2,
    name: "Freeship cho đơn từ 500k",
    code: "FREESHIP500",
    startDate: "2025-08-01",
    endDate: "2025-08-31",
    usageCount: 89,
  },
  {
    id: 3,
    name: "Lễ Quốc Khánh - Giảm 50k",
    code: "MUNG2THANG9",
    startDate: "2025-09-01",
    endDate: "2025-09-02",
    usageCount: 0,
  },
  {
    id: 4,
    name: "Chào hè - Giảm 15%",
    code: "SUMMER15",
    startDate: "2025-06-01",
    endDate: "2025-07-31",
    usageCount: 340,
  },
  {
    id: 5,
    name: "Giảm 100k cho khách hàng VIP",
    code: "VIP100K",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    usageCount: 25,
  },
  {
    id: 6,
    name: "Giảm 10% cho đơn đầu tiên",
    code: "FIRST10",
    startDate: "2025-07-01",
    endDate: "2025-07-31",
    usageCount: 120,
  },
  {
    id: 7,
    name: "Tặng 1 sản phẩm khi mua 2",
    code: "BUY2GET1",
    startDate: "2025-08-15",
    endDate: "2025-09-15",
    usageCount: 45,
  },
  {
    id: 8,
    name: "Giảm 30% cho sản phẩm mới",
    code: "NEW30",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
    usageCount: 60,
  },
  {
    id: 9,
    name: "Giảm 50k cho đơn từ 300k",
    code: "SALE50K",
    startDate: "2025-08-10",
    endDate: "2025-08-20",
    usageCount: 80,
  },
  {
    id: 10,
    name: "Giảm 5% toàn bộ cửa hàng",
    code: "ALL5",
    startDate: "2025-07-15",
    endDate: "2025-08-15",
    usageCount: 200,
  },
  {
    id: 11,
    name: "Tặng voucher 20k cho khách mới",
    code: "WELCOME20",
    startDate: "2025-06-01",
    endDate: "2025-12-31",
    usageCount: 30,
  },
  {
    id: 12,
    name: "Giảm 15% cho nhóm sản phẩm A",
    code: "GROUPA15",
    startDate: "2025-08-05",
    endDate: "2025-08-25",
    usageCount: 55,
  },
  {
    id: 13,
    name: "Freeship toàn quốc",
    code: "FREESHIPVN",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
    usageCount: 100,
  },
  {
    id: 14,
    name: "Giảm 100k cho đơn từ 1 triệu",
    code: "SALE100K",
    startDate: "2025-08-01",
    endDate: "2025-08-31",
    usageCount: 70,
  },
  {
    id: 15,
    name: "Tặng quà sinh nhật",
    code: "BIRTHDAYGIFT",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    usageCount: 15,
  },
  // ...Thêm dữ liệu mẫu khác nếu cần
];

// --- LOGIC & HELPERS ---
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("vi-VN");

const getStatusInfo = (item) => {
  const now = new Date();
  const startDate = new Date(item.startDate);
  const endDate = new Date(item.endDate);
  endDate.setHours(23, 59, 59, 999); // Tính đến hết ngày

  if (now < startDate) return { text: "Sắp diễn ra", type: "warning" };
  if (now > endDate) return { text: "Đã kết thúc", type: "info" };
  return { text: "Đang diễn ra", type: "success" };
};

const getStatusType = (statusText) => {
  if (statusText === "Đang diễn ra") return "success";
  if (statusText === "Sắp diễn ra") return "warning";
  if (statusText === "Đã kết thúc") return "info";
  return "";
};

const getStatusFromTab = (tabName) => {
  const statusMap = {
    active: "Đang diễn ra",
    scheduled: "Sắp diễn ra",
    expired: "Đã kết thúc",
  };
  return statusMap[tabName];
};

// --- COMPUTED PROPERTIES ---
const processedDiscounts = computed(() => {
  // Thêm trường status động vào mỗi object
  return discounts.value.map((d) => ({
    ...d,
    status: getStatusInfo(d).text,
  }));
});

const filteredDiscounts = computed(() => {
  return processedDiscounts.value.filter((item) => {
    const searchMatch = search.value
      ? item.name.toLowerCase().includes(search.value.toLowerCase()) ||
        item.code.toLowerCase().includes(search.value.toLowerCase())
      : true;

    const tabMatch =
      activeTab.value === "all"
        ? true
        : item.status === getStatusFromTab(activeTab.value);

    return searchMatch && tabMatch;
  });
});

const pagedDiscounts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredDiscounts.value.slice(start, start + pageSize);
});

// --- ACTIONS ---
const createDiscount = () => {
  router.push({ name: "CreateDiscount" });
};

const editDiscount = (discount) => {
  router.push({ name: "EditDiscount", params: { id: discount.id } });
};

const deactivateDiscount = (discount) => {
  ElMessageBox.confirm(
    `Bạn có chắc muốn kết thúc sớm chương trình khuyến mại "${discount.name}" không?`,
    "Xác nhận hành động",
    {
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      type: "warning",
    }
  )
    .then(() => {
      const index = discounts.value.findIndex((d) => d.id === discount.id);
      if (index !== -1) {
        // Cập nhật ngày kết thúc là ngày hôm qua để đảm bảo nó trở thành "Đã kết thúc"
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        discounts.value[index].endDate = yesterday.toISOString().split("T")[0];
      }
      ElMessage.success("Đã kết thúc chương trình khuyến mại.");
    })
    .catch(() => {});
};

// --- LIFECYCLE & WATCHERS ---
watch([activeTab, search], () => {
  currentPage.value = 1;
});

onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  setTimeout(() => {
    discounts.value = sampleDiscounts;
    isLoading.value = false;
  }, 500);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
});
</script>

<style scoped>
.filters-bar {
  justify-content: space-between;
}
.order-tabs {
  margin-bottom: 1px;
}
.order-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 20px;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  border: 1px solid #e5e7eb;
  border-bottom: none;
}
.table-container {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.discount-name {
  font-weight: 600;
  color: #111827;
}
.discount-code {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 2px;
}

/* GLOBAL STYLES */
.page-container {
  padding: 16px;
  background-color: #f9fafb;
  font-family: "Inter", sans-serif;
  min-height: 100vh;
}
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}
.table-container {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* MOBILE CARD STYLES */
.mobile-card-list {
  padding: 16px;
}
.mobile-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.card-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}
.card-label {
  color: #6b7280;
}
.card-value {
  color: #111827;
  font-weight: 500;
  text-align: right;
}
.card-footer {
  padding: 8px 16px;
  background-color: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ELEMENT PLUS CUSTOMIZATION */
.page-container :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}
.page-container :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
}

/* RESPONSIVE OVERRIDES */
@media (max-width: 767px) {
  .order-tabs :deep(.el-tabs__header) {
    padding: 0;
  }
  .order-tabs :deep(.el-tabs__nav) {
    width: 100%;
    display: flex;
  }
  .order-tabs :deep(.el-tabs__item) {
    flex: 1;
    text-align: center;
    padding: 0 5px;
  }
}
@media (min-width: 768px) {
  .page-container {
    padding: 24px 32px;
  }
  .page-title {
    font-size: 1.75rem;
  }
  .filters-bar {
    padding: 16px 20px;
  }
  .pagination-container {
    justify-content: flex-end;
  }
  .page-container :deep(.el-button--primary) {
    background-color: #2563eb;
    border-color: #2563eb;
  }
  .page-container :deep(.el-input) {
    /* max-width: 400px; */
  }
  .page-container :deep(.el-table th) {
    background-color: #f9fafb !important;
    color: #6b7280;
    font-weight: 600;
  }
  .page-container :deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid #f3f4f6;
    padding: 14px 0;
  }
  .page-container :deep(.el-table .el-table__row:hover > td) {
    background-color: #f9fafb !important;
  }
  .page-container
    :deep(
      .el-pagination.is-background .el-pager li:not(.is-disabled).is-active
    ) {
    background-color: #2563eb;
  }
}
</style>
