<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Danh sách báo cáo</h1>
      <el-button type="primary" :icon="Plus" @click="addReport">
        Tạo báo cáo mới
      </el-button>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo tên hoặc loại báo cáo..."
          clearable
          :prefix-icon="Search"
          @keyup.enter="onSearch"
          @clear="onSearch"
        />
        <el-select
          v-if="!isMobile"
          v-model="reportTypeFilter"
          placeholder="Lọc theo loại"
          clearable
        >
          <el-option label="Doanh thu" value="Doanh thu"></el-option>
          <el-option label="Tồn kho" value="Tồn kho"></el-option>
          <el-option label="Đơn hàng" value="Đơn hàng"></el-option>
        </el-select>
      </div>

      <el-table v-if="!isMobile" :data="pagedReports" style="width: 100%">
        <el-table-column label="Tên báo cáo" min-width="300">
          <template #default="scope">
            <div class="report-info">
              <div class="report-icon">
                <el-icon
                  ><DataAnalysis
                    v-if="scope.row.type === 'Doanh thu'" /><Tickets
                    v-if="scope.row.type === 'Đơn hàng'" /><Box
                    v-if="scope.row.type === 'Tồn kho'"
                /></el-icon>
              </div>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="Loại" width="150" />
        <el-table-column prop="date" label="Ngày tạo" width="180" />
        <el-table-column label="Thao tác" width="200" align="center">
          <div class="action-buttons">
            <el-button
              size="small"
              :icon="Download"
              text
              bg
              @click="downloadReport(scope.row)"
              >Tải xuống</el-button
            >
            <el-button
              size="small"
              type="danger"
              :icon="Delete"
              text
              bg
              @click="deleteReport(scope.row)"
              >Xóa</el-button
            >
          </div>
        </el-table-column>
      </el-table>

      <div v-else class="mobile-card-list">
        <div v-for="item in pagedReports" :key="item.name" class="mobile-card">
          <div class="card-header report-info">
            <div class="report-icon">
              <el-icon
                ><DataAnalysis v-if="item.type === 'Doanh thu'" /><Tickets
                  v-if="item.type === 'Đơn hàng'" /><Box
                  v-if="item.type === 'Tồn kho'"
              /></el-icon>
            </div>
            <span class="card-title">{{ item.name }}</span>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Loại báo cáo</span>
              <span class="card-value">{{ item.type }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Ngày tạo</span>
              <span class="card-value">{{ item.date }}</span>
            </div>
          </div>
          <el-table-column label="Thao tác" width="200" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button
                  size="small"
                  :icon="Download"
                  text
                  bg
                  @click="downloadReport(row)"
                >
                  Tải xuống
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  text
                  bg
                  @click="deleteReport(row)"
                >
                  Xóa
                </el-button>
              </div>
            </template>
          </el-table-column>
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <el-pagination
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="filteredReports.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <el-dialog
      v-model="isCreateModalVisible"
      title="Tạo báo cáo mới"
      width="500px"
    >
      <el-form :model="newReportForm" label-position="top">
        <el-form-item label="Tên báo cáo">
          <el-input
            v-model="newReportForm.name"
            placeholder="VD: Báo cáo doanh thu tháng 8"
          ></el-input>
        </el-form-item>
        <el-form-item label="Loại báo cáo">
          <el-select
            v-model="newReportForm.type"
            placeholder="Chọn loại báo cáo"
            style="width: 100%"
          >
            <el-option label="Doanh thu" value="Doanh thu"></el-option>
            <el-option label="Tồn kho" value="Tồn kho"></el-option>
            <el-option label="Đơn hàng" value="Đơn hàng"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Khoảng thời gian">
          <el-date-picker
            v-model="newReportForm.dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="Từ ngày"
            end-placeholder="Đến ngày"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isCreateModalVisible = false">Hủy</el-button>
        <el-button type="primary" @click="handleCreateReport">Tạo</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import {
  Search,
  Plus,
  Delete,
  Download,
  DataAnalysis,
  Tickets,
  Box,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

const search = ref("");
const reportTypeFilter = ref("");
const currentPage = ref(1);
const pageSize = 10;

const reports = ref([
  { name: "Báo cáo doanh thu tháng 7", type: "Doanh thu", date: "2025-07-31" },
  { name: "Báo cáo tồn kho quý 2", type: "Tồn kho", date: "2025-06-30" },
  { name: "Báo cáo đơn hàng tuần 30", type: "Đơn hàng", date: "2025-07-27" },
]);

const isCreateModalVisible = ref(false);
const newReportForm = reactive({
  name: "",
  type: "",
  dateRange: "",
});

const filteredReports = computed(() => {
  return reports.value.filter((item) => {
    const searchMatch = search.value
      ? item.name.toLowerCase().includes(search.value.toLowerCase()) ||
        item.type.toLowerCase().includes(search.value.toLowerCase())
      : true;
    const typeMatch = reportTypeFilter.value
      ? item.type === reportTypeFilter.value
      : true;
    return searchMatch && typeMatch;
  });
});

const pagedReports = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredReports.value.slice(start, start + pageSize);
});

const onSearch = () => {
  currentPage.value = 1;
};

const addReport = () => {
  Object.assign(newReportForm, { name: "", type: "", dateRange: "" });
  isCreateModalVisible.value = true;
};

const handleCreateReport = () => {
  if (!newReportForm.name || !newReportForm.type) {
    ElMessage.error("Vui lòng nhập tên và chọn loại báo cáo.");
    return;
  }
  const newReport = {
    name: newReportForm.name,
    type: newReportForm.type,
    date: new Date().toISOString().slice(0, 10),
  };
  reports.value.unshift(newReport);
  isCreateModalVisible.value = false;
  ElMessage.success("Đã tạo báo cáo thành công!");
};

const downloadReport = (report) => {
  ElMessage.info(`Đang chuẩn bị tải xuống báo cáo "${report.name}"...`);
};

const deleteReport = (reportToDelete) => {
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn xóa báo cáo "${reportToDelete.name}"? Hành động này không thể hoàn tác.`,
    "Xác nhận xóa",
    {
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      type: "warning",
    }
  )
    .then(() => {
      reports.value = reports.value.filter(
        (r) => r.name !== reportToDelete.name
      );
      ElMessage.success("Đã xóa báo cáo thành công.");
    })
    .catch(() => {});
};
</script>

<style scoped>
.report-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.report-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #eff6ff;
  color: #2563eb;
  font-size: 18px;
  flex-shrink: 0;
}
.filters-bar {
  justify-content: space-between;
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

:deep(.el-form-item__content) {
  width: 100%;
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
