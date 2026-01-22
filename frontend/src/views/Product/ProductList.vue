<template>
  <div class="page-container product-list-page">
    <div class="page-header">
      <h1 class="page-title">Danh sách sản phẩm</h1>
      <div class="action-buttons-group">
        <el-button
          :icon="Download"
          @click="handleExport"
          :disabled="isLoading || filteredProducts.length === 0"
          >Xuất file</el-button
        >
        <el-button :icon="Upload" @click="triggerImport">Nhập file</el-button>
        <el-button type="primary" :icon="Plus" @click="goToCreateProduct"
          >Thêm sản phẩm</el-button
        >
      </div>
    </div>

    <el-tabs v-model="activeTab" class="product-tabs">
      <el-tab-pane label="Tất cả" name="all" />
      <el-tab-pane label="Hoạt động" name="active" />
      <el-tab-pane label="Ngừng hoạt động" name="inactive" />
      <el-tab-pane label="Hết hàng" name="outofstock" />
    </el-tabs>

    <div class="table-container">
      <!-- THAY cả khối .filters-bar hiện tại bằng khối dưới -->
      <div class="filters-bar">
        <div class="search-input-wrapper">
          <el-input
            v-model="searchQuery"
            placeholder="Tìm theo mã, tên sản phẩm, nhãn hiệu..."
            clearable
            :prefix-icon="Search"
          />
        </div>

        <div v-if="!isMobile" class="advanced-filters">
          <el-select
            v-model="typeFilter"
            placeholder="Loại sản phẩm"
            clearable
            class="adv-select"
          >
            <el-option
              v-for="t in uniqueTypes"
              :key="t"
              :label="t"
              :value="t"
            />
          </el-select>

          <el-select
            v-model="brandFilter"
            placeholder="Nhãn hiệu"
            clearable
            class="adv-select"
          >
            <el-option
              v-for="b in uniqueBrands"
              :key="b"
              :label="b"
              :value="b"
            />
          </el-select>

          <el-switch v-model="onlyWithImage" active-text="Có ảnh" />
        </div>
      </div>

      <!-- Bulk actions -->
      <div v-if="!isMobile && multipleSelection.length > 0" class="bulk-bar">
        <span>Đã chọn {{ multipleSelection.length }} sản phẩm</span>
        <div class="bulk-actions">
          <el-button size="small" @click="bulkActivate(true)"
            >Bật hoạt động</el-button
          >
          <el-button size="small" @click="bulkActivate(false)"
            >Tắt hoạt động</el-button
          >
          <el-button size="small" type="danger" @click="bulkDelete"
            >Xoá</el-button
          >
        </div>
      </div>

      <!-- DESKTOP TABLE -->
      <el-table
        v-if="!isMobile"
        :data="pagedProducts"
        v-loading="isLoading"
        style="width: 100%"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="Sản phẩm" min-width="320">
          <template #default="scope">
            <div class="product-info">
              <el-image class="product-image" :src="scope.row.imageUrl" lazy>
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="product-meta">
                <div class="product-name">{{ scope.row.name }}</div>
                <div class="product-sub">
                  #{{ scope.row.id }} · {{ scope.row.brand || "—" }} ·
                  {{ scope.row.type || "—" }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="160">
          <template #default="scope">
            <el-tag
              :type="scope.row.isActive ? 'success' : 'info'"
              size="small"
              >{{
                scope.row.isActive ? "Đang hoạt động" : "Ngừng hoạt động"
              }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="stock"
          label="Tồn kho"
          width="120"
          sortable
          align="center"
        />
        <el-table-column prop="type" label="Loại" width="180" />
        <el-table-column prop="brand" label="Nhãn hiệu" width="180" />
        <el-table-column label="Thao tác" width="140" align="center">
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
                :icon="Delete"
                type="danger"
                circle
                @click="handleDelete(scope.row)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- MOBILE LIST -->
      <div v-else class="mobile-card-list">
        <div v-for="item in pagedProducts" :key="item.id" class="mobile-card">
          <div class="card-header product-info">
            <el-image class="product-image" :src="item.imageUrl" lazy>
              <template #error
                ><div class="image-slot">
                  <el-icon><Picture /></el-icon></div
              ></template>
            </el-image>
            <div class="card-title">{{ item.name }}</div>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Trạng thái</span>
              <span class="card-value"
                ><el-tag
                  :type="item.isActive ? 'success' : 'info'"
                  size="small"
                  >{{
                    item.isActive ? "Đang hoạt động" : "Ngừng hoạt động"
                  }}</el-tag
                ></span
              >
            </div>
            <div class="card-row">
              <span class="card-label">Tồn kho</span
              ><span class="card-value">{{ item.stock }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Loại</span
              ><span class="card-value">{{ item.type }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Nhãn hiệu</span
              ><span class="card-value">{{ item.brand }}</span>
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
        :total="filteredProducts.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <!-- FORM COMPONENT -->
    <product-form
      v-if="!isLoading"
      :visible="dialogVisible"
      :product="currentProduct"
      @close="closeForm"
      @submit="handleFormSubmit"
      style="max-width: 450px"
    />

    <!-- hidden file input for import -->
    <input
      ref="fileInput"
      type="file"
      accept=".csv"
      style="display: none"
      @change="onFileChosen"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { ElMessageBox, ElMessage, ElNotification } from "element-plus";
import {
  Search,
  Plus,
  Upload,
  Download,
  Picture,
  Edit,
  Delete,
} from "@element-plus/icons-vue";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateStatus,
  exportProducts,
  importProducts,
} from "@/services/productService";
import ProductForm from "@/components/ProductForm.vue";
import { useRouter } from "vue-router";

// --- Responsive ---
const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  fetchProducts();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// --- State ---
const searchQuery = ref("");
const activeTab = ref("all");
const typeFilter = ref("");
const brandFilter = ref("");
const onlyWithImage = ref(false);
const currentPage = ref(1);
const pageSize = 8;
const products = ref([]);
const isLoading = ref(true);
const dialogVisible = ref(false);
const currentProduct = ref(null);
const router = useRouter();
function goToCreateProduct() {
  router.push({ name: "CreateProduct" });
  console.log("Navigate to create product page");
}

// --- Fetch ---
const fetchProducts = async () => {
  isLoading.value = true;
  try {
    const response = await getProducts({ page: 1, limit: 100 });
    const data = response.data?.data;

    // Map API data to frontend structure
    const items = (data?.products || []).map((p) => ({
      ...p,
      brand: p.brand_name || p.brand || "",
      type: p.category_name || p.category || "",
      isActive: p.is_active,
      stock: p.stock !== undefined ? p.stock : 0,
      imageUrl: p.imageUrl || "",
    }));

    products.value = items;
  } catch (e) {
    ElMessage.error("Không thể tải danh sách sản phẩm.");
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

// --- Filters ---
const uniqueBrands = computed(() =>
  Array.from(new Set(products.value.map((p) => p.brand).filter(Boolean))),
);
const uniqueTypes = computed(() =>
  Array.from(new Set(products.value.map((p) => p.type).filter(Boolean))),
);

const filteredProducts = computed(() => {
  let arr = products.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    arr = arr.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        (p.brand || "").toLowerCase().includes(q),
    );
  }
  if (activeTab.value === "active") arr = arr.filter((p) => p.isActive);
  if (activeTab.value === "inactive") arr = arr.filter((p) => !p.isActive);
  if (activeTab.value === "outofstock")
    arr = arr.filter((p) => Number(p.stock) === 0);
  if (typeFilter.value) arr = arr.filter((p) => p.type === typeFilter.value);
  if (brandFilter.value) arr = arr.filter((p) => p.brand === brandFilter.value);
  if (onlyWithImage.value) arr = arr.filter((p) => !!p.imageUrl);
  return arr;
});

const pagedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredProducts.value.slice(start, start + pageSize);
});

watch([searchQuery, activeTab, typeFilter, brandFilter, onlyWithImage], () => {
  currentPage.value = 1;
});

// --- Selection & bulk actions ---
const multipleSelection = ref([]);
const onSelectionChange = (rows) => {
  multipleSelection.value = rows;
};

const bulkActivate = async (isActive) => {
  const rows = multipleSelection.value;
  if (rows.length === 0) return;
  try {
    await ElMessageBox.confirm(
      `Áp dụng trạng thái "${isActive ? "Hoạt động" : "Ngừng hoạt động"}" cho ${
        rows.length
      } sản phẩm?`,
      "Xác nhận",
      { type: "warning" },
    );
  } catch {
    return;
  }

  isLoading.value = true;
  try {
    const ids = rows.map((r) => r.id);
    await bulkUpdateStatus(ids, isActive);

    ElNotification({
      title: "Thành công",
      message: "Đã cập nhật trạng thái hàng loạt.",
      type: "success",
    });
    await fetchProducts();
  } catch (e) {
    ElMessage.error("Cập nhật hàng loạt thất bại.");
  } finally {
    isLoading.value = false;
  }
};

const bulkDelete = async () => {
  const rows = multipleSelection.value;
  if (rows.length === 0) return;
  try {
    await ElMessageBox.confirm(
      `Xoá ${rows.length} sản phẩm đã chọn?`,
      "Xác nhận xoá",
      { type: "warning" },
    );
  } catch {
    return;
  }
  isLoading.value = true;
  try {
    for (const r of rows) {
      await deleteProduct(r.id);
    }
    ElMessage.success("Đã xoá sản phẩm đã chọn");
    await fetchProducts();
  } catch {
    ElMessage.error("Xoá hàng loạt thất bại.");
  } finally {
    isLoading.value = false;
  }
};

// --- CRUD ---
const openForm = (product = null) => {
  currentProduct.value = product;
  dialogVisible.value = true;
};
const closeForm = () => {
  dialogVisible.value = false;
  currentProduct.value = null;
};

const handleFormSubmit = async (formData) => {
  try {
    // Map frontend fields to backend fields
    const payload = {
      ...formData,
      is_active: formData.isActive,
      // Lưu ý: Backend yêu cầu category_id, brand_id, unit_id.
      // Form hiện tại đang submit text, cần cập nhật ProductForm để chọn ID.
    };

    if (currentProduct.value) {
      await updateProduct(currentProduct.value.id, payload);
      ElMessage.success("Cập nhật sản phẩm thành công!");
    } else {
      await createProduct(payload);
      ElMessage.success("Tạo sản phẩm thành công!");
    }
    await fetchProducts();
    closeForm();
  } catch (err) {
    ElMessage.error(
      "Lỗi: " + (err.response?.data?.message || "Đã có lỗi xảy ra."),
    );
  }
};

const handleDelete = (product) => {
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" không?`,
    "Xác nhận xóa",
    { confirmButtonText: "Xóa", cancelButtonText: "Hủy", type: "warning" },
  )
    .then(async () => {
      try {
        await deleteProduct(product.id);
        ElMessage.success("Đã xóa sản phẩm thành công!");
        fetchProducts();
      } catch {
        ElMessage.error("Xóa sản phẩm thất bại.");
      }
    })
    .catch(() => {});
};

// --- Export/Import ---
const handleExport = async () => {
  if (filteredProducts.value.length === 0) return;
  try {
    const response = await exportProducts();
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    ElMessage.success("Đã xuất file thành công!");
  } catch (e) {
    ElMessage.error("Xuất file thất bại.");
  }
};

const fileInput = ref(null);
const triggerImport = () => fileInput.value?.click();

const onFileChosen = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  isLoading.value = true;
  try {
    await importProducts(file);
    ElNotification({
      title: "Nhập file thành công",
      message: "Dữ liệu đã được cập nhật.",
      type: "success",
    });
    await fetchProducts();
  } catch (err) {
    ElMessage.error(
      "Lỗi nhập file: " + (err.response?.data?.message || err.message),
    );
  } finally {
    isLoading.value = false;
    e.target.value = "";
  }
};
</script>

<style scoped>
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.product-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.product-name {
  font-weight: 600;
  color: #111827;
}
.product-sub {
  font-size: 12px;
  color: #6b7280;
}
.product-image {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid #f3f4f6;
}
.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}
.action-buttons-group {
  display: flex;
  gap: 8px;
}

.bulk-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #eef2f7;
}
.bulk-actions {
  display: flex;
  gap: 8px;
}

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

.page-container :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}
.page-container :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
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
    max-width: 420px;
  }
  .page-container
    :deep(
      .el-pagination.is-background .el-pager li:not(.is-disabled).is-active
    ) {
    background-color: #2563eb;
  }
}

/* căn đều 2 bên & canh giữa theo chiều dọc */
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* ô tìm kiếm chiếm phần còn lại */
.search-input-wrapper {
  flex: 1;
  min-width: 260px;
}

/* cụm lọc nâng cao nằm ngang, auto wrap khi chật */
.advanced-filters {
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  align-items: center;
  gap: 12px;
}

/* cố định bề ngang của select để không nhảy hàng sớm */
.advanced-filters .adv-select {
  width: 220px;
}

/* dưới ~1024px thì cho cụm lọc xếp dọc gọn */
@media (max-width: 1024px) {
  .advanced-filters {
    grid-auto-flow: row;
    grid-template-columns: 1fr;
  }
}
</style>
