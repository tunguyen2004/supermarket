<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Bảng giá sản phẩm</h1>
      <div class="header-actions">
        <el-button
          type="success"
          :icon="Download"
          @click="handleExport"
          :loading="isExporting"
        >
          Xuất file
        </el-button>
        <el-button type="primary" :icon="Search" @click="onSearch">
          Làm mới
        </el-button>
      </div>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo mã hoặc tên sản phẩm..."
          clearable
          :prefix-icon="Search"
          @keyup.enter="onSearch"
          @clear="onSearch"
        />
      </div>

      <el-table
        v-if="!isMobile"
        :data="pagedCatalogs"
        v-loading="isLoading"
        style="width: 100%"
      >
        <el-table-column prop="code" label="Mã SP" width="150" />
        <el-table-column prop="name" label="Tên sản phẩm" min-width="250" />
        <el-table-column prop="price" label="Giá bán" width="180">
          <template #default="scope">
            <span>{{ formatCurrency(scope.row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="Đơn vị" width="120" />
        <el-table-column label="Thao tác" width="120" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="Edit"
                circle
                @click="openForm(scope.row)"
              />
              <el-button
                size="small"
                type="danger"
                :icon="Delete"
                circle
                @click="handleDelete(scope.row)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="mobile-card-list">
        <div v-for="item in pagedCatalogs" :key="item.id" class="mobile-card">
          <div class="card-header">
            <span class="card-title">{{ item.name }}</span>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Mã SP</span>
              <span class="card-value">{{ item.code }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Giá bán</span>
              <span class="card-value price">{{
                formatCurrency(item.price)
              }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Đơn vị</span>
              <span class="card-value">{{ item.unit }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              size="small"
              :icon="Edit"
              circle
              @click="openForm(item)"
            />
            <el-button
              size="small"
              type="danger"
              :icon="Delete"
              circle
              @click="handleDelete(item)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <el-pagination
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="totalItems"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="fetchCatalogs"
      />
    </div>

    <catalog-form
      :visible="dialogVisible"
      :catalog="currentCatalog"
      @close="closeForm"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Search, Edit, Delete, Download } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import CatalogForm from "@/components/CatalogForm.vue";
import {
  getCatalogs,
  updateCatalog,
  exportCatalog,
} from "@/services/catalogService";

const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

const search = ref("");
const currentPage = ref(1);
const pageSize = 10;
const catalogs = ref([]);
const isLoading = ref(true);
const isExporting = ref(false);

const dialogVisible = ref(false);
const currentCatalog = ref(null);

const totalItems = ref(0);

const fetchCatalogs = async () => {
  isLoading.value = true;
  try {
    const params = {
      search: search.value,
      page: currentPage.value,
      limit: pageSize,
    };
    const response = await getCatalogs(params);
    catalogs.value = response.data.data || response.data;
    totalItems.value = response.data.pagination?.total || catalogs.value.length;
  } catch (error) {
    console.error(error);
    ElMessage.error("Không thể tải danh sách bảng giá.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  fetchCatalogs();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

const formatCurrency = (value) =>
  (value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const pagedCatalogs = computed(() => catalogs.value);

const onSearch = () => {
  currentPage.value = 1;
  fetchCatalogs();
};

const openForm = (catalog = null) => {
  currentCatalog.value = catalog;
  dialogVisible.value = true;
};

const closeForm = () => {
  dialogVisible.value = false;
  currentCatalog.value = null;
};

const handleFormSubmit = async (formData) => {
  try {
    if (currentCatalog.value) {
      // API chỉ cho phép cập nhật giá, không cho tạo mới
      const updateData = {
        cost_price: formData.cost_price,
        selling_price: formData.price,
        is_active: formData.is_active !== false,
      };
      await updateCatalog(currentCatalog.value.id, updateData);
      ElMessage.success("Cập nhật giá thành công!");
    } else {
      ElMessage.warning(
        "Bảng giá được tạo tự động từ sản phẩm. Vui lòng chọn sản phẩm để chỉnh sửa giá.",
      );
      closeForm();
      return;
    }
    fetchCatalogs();
    closeForm();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
  }
};

const handleDelete = (catalog) => {
  ElMessage.warning(
    "Không thể xóa bảng giá. Bạn chỉ có thể vô hiệu hóa sản phẩm từ trang Sản phẩm.",
  );
};

const handleExport = async () => {
  isExporting.value = true;
  try {
    const response = await exportCatalog();

    // Create blob and download
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `bang-gia-${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    ElMessage.success("Xuất file thành công!");
  } catch (error) {
    console.error(error);
    ElMessage.error("Xuất file thất bại.");
  } finally {
    isExporting.value = false;
  }
};
</script>

<style scoped>
.price {
  color: #d9534f;
  font-weight: 600;
}
</style>

<style scoped>
/* ----- GLOBAL LAYOUT & TYPOGRAPHY ----- */
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

.header-actions {
  display: flex;
  gap: 12px;
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
