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
      <el-tab-pane label="Sắp diễn ra" name="upcoming"></el-tab-pane>
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
              >{{ formatDate(scope.row.start_date) }} -
              {{ formatDate(scope.row.end_date) }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="current_uses"
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
              {{ getStatusText(scope.row.status) }}</el-tag
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
                v-if="scope.row.status === 'active'"
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
              >{{ getStatusText(item.status) }}</el-tag
            >
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Hiệu lực</span>
              <span class="card-value"
                >{{ formatDate(item.start_date) }} -
                {{ formatDate(item.end_date) }}</span
              >
            </div>
            <div class="card-row">
              <span class="card-label">Lượt sử dụng</span>
              <span class="card-value">{{ item.current_uses }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              v-if="item.status === 'active'"
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
        v-if="pagination.total > 0"
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="pagination.total"
        :page-size="pagination.limit"
        v-model:current-page="currentPage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useDiscountStore } from "@/store/discount";
import { storeToRefs } from "pinia";
import { Search, Plus, Edit, CircleClose } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

// --- STATE ---
const router = useRouter();
const discountStore = useDiscountStore();
const {
  discounts,
  loading: isLoading,
  pagination,
} = storeToRefs(discountStore);

const isMobile = ref(false);
const search = ref("");
const activeTab = ref("all");
const currentPage = ref(1);
const pageSize = 20;

// --- LOGIC & HELPERS ---
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("vi-VN");

const getStatusType = (status) => {
  const statusMap = {
    active: "success",
    upcoming: "warning",
    expired: "info",
    inactive: "info",
  };
  return statusMap[status] || "";
};

const getStatusText = (status) => {
  const statusMap = {
    active: "Đang diễn ra",
    upcoming: "Sắp diễn ra",
    expired: "Đã kết thúc",
    inactive: "Đã tắt",
  };
  return statusMap[status] || status;
};

// --- COMPUTED PROPERTIES ---
// Backend đã filter theo status và search rồi, không cần filter lại client-side
const pagedDiscounts = computed(() => discounts.value);

// --- ACTIONS ---
const createDiscount = () => {
  router.push({ name: "CreateDiscount" });
};

const editDiscount = (discount) => {
  router.push({ name: "EditDiscount", params: { id: discount.id } });
};

const deactivateDiscount = async (discount) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc muốn kết thúc sớm chương trình khuyến mại "${discount.name}" không?`,
      "Xác nhận hành động",
      {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    );

    const result = await discountStore.deactivateDiscount(discount.id);
    if (result.success) {
      ElMessage.success(
        result.message || "Đã kết thúc chương trình khuyến mại",
      );
      loadDiscounts();
    } else {
      ElMessage.error(result.error || "Có lỗi xảy ra");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("Deactivate error:", error);
    }
  }
};

const loadDiscounts = async () => {
  const params = {
    page: currentPage.value,
    limit: pageSize,
    search: search.value || undefined,
    status: activeTab.value === "all" ? undefined : activeTab.value,
  };

  await discountStore.fetchDiscounts(params);
};

// --- LIFECYCLE & WATCHERS ---
watch([activeTab, search], () => {
  currentPage.value = 1;
  loadDiscounts();
});

watch(currentPage, () => {
  loadDiscounts();
});

onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  loadDiscounts();
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
