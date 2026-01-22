<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Danh mục sản phẩm</h1>
      <el-button type="primary" :icon="Plus" @click="openForm()">
        Thêm danh mục
      </el-button>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo mã hoặc tên danh mục..."
          clearable
          :prefix-icon="Search"
        />
      </div>

      <el-table
        v-if="!isMobile"
        :data="collections"
        v-loading="isLoading"
        style="width: 100%"
      >
        <el-table-column prop="code" label="Mã danh mục" width="180" />
        <el-table-column prop="name" label="Tên danh mục" min-width="300" />
        <el-table-column
          prop="product_count"
          label="Số sản phẩm"
          width="150"
          align="center"
        />
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
        <div v-for="item in collections" :key="item.code" class="mobile-card">
          <div class="card-header">
            <span class="card-title">{{ item.name }}</span>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Mã danh mục</span>
              <span class="card-value">{{ item.code }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Số sản phẩm</span>
              <span class="card-value">{{ item.product_count }}</span>
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
        :total="total"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>

    <collection-form
      :visible="dialogVisible"
      :collection="currentCollection"
      @close="closeForm"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { Search, Plus, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import CollectionForm from "@/components/CollectionForm.vue";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "@/services/catalogService";

const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

const search = ref("");
const currentPage = ref(1);
const pageSize = 10;
const total = ref(0);
const collections = ref([]);
const isLoading = ref(true);

const dialogVisible = ref(false);
const currentCollection = ref(null);

let searchTimeout;

const fetchCollections = async () => {
  isLoading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize,
      search: search.value,
    };
    const response = await getCollections(params);
    if (response.data.success) {
      collections.value = response.data.data.collections;
      total.value = response.data.data.pagination.total;
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("Không thể tải danh sách danh mục.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  fetchCollections();
});

const handlePageChange = (val) => {
  currentPage.value = val;
  fetchCollections();
};

watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchCollections();
  }, 300);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

const openForm = (collection = null) => {
  currentCollection.value = collection;
  dialogVisible.value = true;
};

const closeForm = () => {
  dialogVisible.value = false;
  currentCollection.value = null;
};

const handleFormSubmit = async (formData) => {
  try {
    if (currentCollection.value) {
      await updateCollection(currentCollection.value.id, formData);
      ElMessage.success("Cập nhật danh mục thành công!");
    } else {
      await createCollection(formData);
      ElMessage.success("Tạo danh mục thành công!");
    }
    fetchCollections();
    closeForm();
  } catch (error) {
    ElMessage.error("Đã có lỗi xảy ra.");
  }
};

const handleDelete = (collection) => {
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn xóa danh mục "${collection.name}" không?`,
    "Xác nhận xóa",
    {
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await deleteCollection(collection.id);
        ElMessage.success("Đã xóa danh mục thành công!");
        fetchCollections();
      } catch (error) {
        ElMessage.error("Xóa danh mục thất bại.");
      }
    })
    .catch(() => {});
};
</script>

<style scoped>
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
