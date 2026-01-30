<template>
  <div class="page-container feature-locked-page">
    <div class="page-header">
      <h1 class="page-title">Trả hàng nhập</h1>
    </div>

    <div class="content-container">
      <el-empty description=" " :image-size="120">
        <template #description>
          <h2 class="empty-state-title">
            Tính năng dành cho gói quản lý đa chi nhánh
          </h2>
          <p class="empty-state-desc">
            Đây là tính năng nâng cao giúp bạn quản lý việc trả hàng cho nhà
            cung cấp một cách hiệu quả giữa các chi nhánh. Vui lòng liên hệ để
            được tư vấn nâng cấp và sử dụng.
          </p>
        </template>

        <el-button
          type="primary"
          size="large"
          :icon="Phone"
          @click="contactSupport"
        >
          Liên hệ Hotline: 1900 6750
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { Phone } from "@element-plus/icons-vue";
import inventoryService from "@/services/inventoryService";

const contactSupport = () => {
  // Mở trình gọi điện trên di động
  window.location.href = "tel:19006750";
};

// API sẵn sàng sử dụng khi tính năng được mở:
// inventoryService.returnInventory({
//   store_id: 1,
//   items: [{ variant_id: 3, quantity: 10 }],
//   notes: "Trả hàng hư hỏng"
// });
</script>

<style scoped>
/* @import './responsive-style.css'; */

.feature-locked-page {
  display: flex;
  flex-direction: column;
}

.content-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 40px;
}

.empty-state-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-top: 24px;
  margin-bottom: 8px;
}

.empty-state-desc {
  font-size: 1rem;
  color: #6b7280;
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 24px;
}

/* Tùy chỉnh el-empty component */
.content-container :deep(.el-empty__description) {
  margin-top: 0;
}

/* ----- GLOBAL LAYOUT & TYPOGRAPHY ----- */
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

/* ----- CONTAINERS & BARS ----- */
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

/* ----- MOBILE CARD STYLES ----- */
.mobile-card-list {
  padding: 16px;
}
.mobile-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 600;
}
.card-title {
  color: #111827;
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

/* ----- ELEMENT PLUS CUSTOMIZATION ----- */
.page-container :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}
.page-container :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
}

/* ----- DESKTOP OVERRIDES ----- */
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
    max-width: 400px;
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
