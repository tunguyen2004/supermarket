<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Chuyển kho</h1>
      <el-button type="primary" :icon="Plus" @click="openDrawer()">
        Tạo phiếu chuyển kho
      </el-button>
    </div>

    <el-tabs v-model="activeTab" class="order-tabs">
      <el-tab-pane label="Tất cả" name="all"></el-tab-pane>
      <el-tab-pane label="Nháp" name="draft"></el-tab-pane>
      <el-tab-pane label="Đang chuyển" name="transit"></el-tab-pane>
      <el-tab-pane label="Hoàn thành" name="completed"></el-tab-pane>
      <el-tab-pane label="Đã hủy" name="cancelled"></el-tab-pane>
    </el-tabs>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo mã phiếu..."
          clearable
          :prefix-icon="Search"
        />
        <el-select
          v-if="!isMobile"
          v-model="branchFilter"
          placeholder="Lọc theo chi nhánh"
          clearable
        >
          <el-option
            label="Chi nhánh trung tâm"
            value="Chi nhánh trung tâm"
          ></el-option>
          <el-option label="Kho tổng" value="Kho tổng"></el-option>
        </el-select>
      </div>

      <el-table
        v-if="!isMobile"
        :data="pagedTransfers"
        v-loading="isLoading"
        style="width: 100%"
      >
        <el-table-column prop="transferCode" label="Mã phiếu" width="160" />
        <el-table-column label="Lộ trình" min-width="280">
          <template #default="scope">
            <div class="route-cell">
              <span>{{ scope.row.fromBranch }}</span>
              <el-icon><Right /></el-icon>
              <span>{{ scope.row.toBranch }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdDate" label="Ngày tạo" width="160" />
        <el-table-column
          prop="productCount"
          label="Số SP"
          width="100"
          align="center"
        />
        <el-table-column prop="employee" label="Người tạo" width="150" />
        <el-table-column label="Trạng thái" width="150" align="center">
          <template #default="scope"
            ><el-tag
              :type="getStatusType(scope.row.status)"
              effect="light"
              size="small"
              >{{ scope.row.status }}</el-tag
            ></template
          >
        </el-table-column>
        <el-table-column label="Thao tác" width="120" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="View"
                text
                bg
                @click="openDrawer(row)"
              >
                Xem
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="mobile-card-list">
        <div
          v-for="item in pagedTransfers"
          :key="item.transferCode"
          class="mobile-card"
          @click="openDrawer(item)"
        >
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-title">{{ item.transferCode }}</span>
              <span class="card-subtitle">{{ item.createdDate }}</span>
            </div>
            <el-tag
              :type="getStatusType(item.status)"
              effect="light"
              size="small"
              >{{ item.status }}</el-tag
            >
          </div>
          <div class="card-body">
            <div class="card-row route-cell-mobile">
              <span>{{ item.fromBranch }}</span>
              <el-icon><Right /></el-icon>
              <span>{{ item.toBranch }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Số sản phẩm</span>
              <span class="card-value">{{ item.productCount }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Người tạo</span>
              <span class="card-value">{{ item.employee }}</span>
            </div>
          </div>
        </div>
      </div>

      <el-empty
        v-if="!isLoading && pagedTransfers.length === 0"
        description="Chưa có phiếu chuyển kho nào"
      />
    </div>

    <div class="pagination-container">
      <el-pagination
        v-if="filteredTransfers.length > 0"
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="filteredTransfers.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <el-drawer
      v-model="drawerVisible"
      :title="isEditMode ? 'Chi tiết phiếu chuyển kho' : 'Tạo phiếu chuyển kho'"
      direction="rtl"
      size="60%"
    >
      <div class="drawer-content">
        <el-form :model="form" label-position="top" ref="formRef">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Từ chi nhánh (Kho gửi)">
                <el-select
                  v-model="form.fromBranch"
                  placeholder="Chọn kho gửi"
                  style="width: 100%"
                  :disabled="isEditMode"
                  ><el-option
                    label="Chi nhánh trung tâm"
                    value="Chi nhánh trung tâm"
                  ></el-option
                  ><el-option label="Kho tổng" value="Kho tổng"></el-option
                ></el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Đến chi nhánh (Kho nhận)">
                <el-select
                  v-model="form.toBranch"
                  placeholder="Chọn kho nhận"
                  style="width: 100%"
                  :disabled="isEditMode"
                  ><el-option label="Kho tổng" value="Kho tổng"></el-option
                  ><el-option
                    label="Chi nhánh trung tâm"
                    value="Chi nhánh trung tâm"
                  ></el-option
                ></el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider />
          <div class="product-section-header">
            <p><strong>Danh sách sản phẩm chuyển kho</strong></p>
            <el-button @click="addProduct" :disabled="isEditMode"
              >Thêm sản phẩm</el-button
            >
          </div>
          <el-table
            :data="form.items"
            size="small"
            border
            class="product-table"
          >
            <el-table-column label="Sản phẩm" prop="name" />
            <el-table-column label="Số lượng" prop="quantity" width="100" />
            <el-table-column label="Thao tác" width="80" align="center">
              <template #default="scope">
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  plain
                  @click="removeProduct(scope.$index)"
                  :disabled="isEditMode"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </div>
      <template #footer>
        <div class="drawer-footer">
          <div v-if="isEditMode && form.status === 'Nháp'">
            <el-button @click="drawerVisible = false">Đóng</el-button>
            <el-button type="danger" @click="handleUpdateStatus('Đã hủy')"
              >Hủy phiếu</el-button
            >
            <el-button type="primary" @click="handleUpdateStatus('Đang chuyển')"
              >Bắt đầu chuyển</el-button
            >
          </div>
          <div v-else-if="isEditMode && form.status === 'Đang chuyển'">
            <el-button @click="drawerVisible = false">Đóng</el-button>
            <el-button type="success" @click="handleUpdateStatus('Hoàn thành')"
              >Đã nhận hàng</el-button
            >
          </div>
          <div v-else-if="!isEditMode">
            <el-button @click="drawerVisible = false">Hủy</el-button>
            <el-button type="primary" @click="handleSave"
              >Lưu phiếu nháp</el-button
            >
          </div>
          <div v-else>
            <el-button @click="drawerVisible = false">Đóng</el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import {
  Search,
  Plus,
  View,
  Right,
  Delete,
  Picture,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import inventoryService from "@/services/inventoryService";
import { getProductImages } from "@/services/productService";

const isMobile = ref(false);
const isLoading = ref(true);
const search = ref("");
const activeTab = ref("all");
const branchFilter = ref("");
const currentPage = ref(1);
const pageSize = 10;
const transfers = ref([]);
const stores = ref([]);
const productImages = ref({}); // Cache ảnh sản phẩm
const drawerVisible = ref(false);
const isEditMode = ref(false);

// Fetch product image
const fetchProductImage = async (productId) => {
  if (!productId) return null;
  if (productImages.value[productId]) {
    return productImages.value[productId];
  }
  try {
    const response = await getProductImages(productId);
    const imageUrl =
      response.data.data?.main_image ||
      response.data.data?.gallery?.[0]?.image_url;
    if (imageUrl) {
      productImages.value[productId] = imageUrl.startsWith("http")
        ? imageUrl
        : `http://localhost:5000${imageUrl}`;
    }
    return productImages.value[productId];
  } catch (error) {
    return null;
  }
};
const form = reactive({
  transferCode: null,
  fromBranch: "",
  toBranch: "",
  items: [],
  status: "",
});

const sampleTransfers = [
  {
    transferCode: "CT20250808-01",
    fromBranch: "Chi nhánh trung tâm",
    toBranch: "Kho tổng",
    createdDate: "2025-08-08",
    productCount: 5,
    employee: "Admin",
    status: "Hoàn thành",
    items: [{ name: "Sản phẩm A", quantity: 5 }],
  },
  {
    transferCode: "CT20250807-01",
    fromBranch: "Kho tổng",
    toBranch: "Chi nhánh trung tâm",
    createdDate: "2025-08-07",
    productCount: 3,
    employee: "Admin",
    status: "Đang chuyển",
    items: [{ name: "Sản phẩm B", quantity: 3 }],
  },
  {
    transferCode: "CT20250806-02",
    fromBranch: "Chi nhánh trung tâm",
    toBranch: "Kho tổng",
    createdDate: "2025-08-06",
    productCount: 8,
    employee: "Nhân viên A",
    status: "Nháp",
    items: [{ name: "Sản phẩm C", quantity: 8 }],
  },
  {
    transferCode: "CT20250805-01",
    fromBranch: "Kho tổng",
    toBranch: "Chi nhánh trung tâm",
    createdDate: "2025-08-05",
    productCount: 2,
    employee: "Nhân viên B",
    status: "Đã hủy",
    items: [{ name: "Sản phẩm D", quantity: 2 }],
  },
];

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
const getStatusType = (status) => {
  if (status === "Hoàn thành") return "success";
  if (status === "Đang chuyển") return "primary";
  if (status === "Nháp") return "warning";
  if (status === "Đã hủy") return "danger";
  return "info";
};
const getStatusFromTab = (tabName) =>
  ({
    draft: "Nháp",
    transit: "Đang chuyển",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  }[tabName]);

const filteredTransfers = computed(() => {
  return transfers.value.filter((item) => {
    const searchMatch = search.value
      ? item.transferCode.toLowerCase().includes(search.value.toLowerCase())
      : true;
    const branchMatch = branchFilter.value
      ? item.fromBranch === branchFilter.value ||
        item.toBranch === branchFilter.value
      : true;
    const tabMatch =
      activeTab.value !== "all"
        ? item.status === getStatusFromTab(activeTab.value)
        : true;
    return searchMatch && branchMatch && tabMatch;
  });
});
const pagedTransfers = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredTransfers.value.slice(start, start + pageSize);
});

const resetForm = () => {
  Object.assign(form, {
    transferCode: null,
    fromBranch: "",
    toBranch: "",
    items: [],
    status: "",
  });
};

const openDrawer = (transfer = null) => {
  resetForm();
  if (transfer) {
    isEditMode.value = true;
    Object.assign(form, JSON.parse(JSON.stringify(transfer))); // Deep copy
  } else {
    isEditMode.value = false;
  }
  drawerVisible.value = true;
};

const addProduct = () => {
  form.items.push({
    name: `Sản phẩm mới ${form.items.length + 1}`,
    quantity: 1,
    tempId: Date.now(),
  });
};

const removeProduct = (itemIndex) => {
  form.items.splice(itemIndex, 1);
};

const handleSave = async () => {
  if (!form.fromBranch || !form.toBranch) {
    ElMessage.error("Vui lòng chọn kho gửi và kho nhận.");
    return;
  }
  if (form.items.length === 0) {
    ElMessage.error("Vui lòng thêm ít nhất một sản phẩm vào phiếu.");
    return;
  }

  try {
    // Find store IDs from store names
    const fromStore = stores.value.find((s) => s.name === form.fromBranch);
    const toStore = stores.value.find((s) => s.name === form.toBranch);

    if (!fromStore || !toStore) {
      ElMessage.error("Không tìm thấy thông tin kho");
      return;
    }

    const payload = {
      from_store_id: fromStore.id,
      to_store_id: toStore.id,
      items: form.items.map((item) => ({
        variant_id: parseInt(item.name) || 1, // Assuming name contains variant_id
        quantity: item.quantity,
      })),
      notes: form.notes || "",
    };

    const result = await inventoryService.transferInventory(payload);

    const newTransfer = {
      ...JSON.parse(JSON.stringify(form)),
      transferCode: result.data.transaction_codes?.[0] || `CT${Date.now()}`,
      createdDate: new Date().toISOString().slice(0, 10),
      employee: "Admin",
      status: "Hoàn thành",
      productCount: form.items.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0,
      ),
    };
    transfers.value.unshift(newTransfer);
    drawerVisible.value = false;
    ElMessage.success(result.message || "Chuyển kho thành công!");
  } catch (error) {
    console.error("Error transferring inventory:", error);
    ElMessage.error(error.response?.data?.message || "Không thể chuyển kho");
  }
};

const handleUpdateStatus = (newStatus) => {
  const transfer = transfers.value.find(
    (t) => t.transferCode === form.transferCode,
  );
  if (transfer) {
    ElMessageBox.confirm(
      `Bạn có chắc muốn cập nhật trạng thái phiếu thành "${newStatus}" không?`,
      "Xác nhận",
      {
        confirmButtonText: "OK",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    )
      .then(() => {
        transfer.status = newStatus;
        drawerVisible.value = false;
        ElMessage.success("Cập nhật trạng thái thành công!");
      })
      .catch(() => {});
  }
};

watch([search, activeTab, branchFilter], () => {
  currentPage.value = 1;
});

onMounted(async () => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  try {
    isLoading.value = true;
    const storesRes = await inventoryService.getStores();
    stores.value = storesRes.data || [];
    transfers.value = sampleTransfers;
  } catch (error) {
    console.error("Error loading stores:", error);
    ElMessage.error("Không thể tải danh sách kho");
  } finally {
    isLoading.value = false;
  }
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});
</script>
<style scoped>
/* ===== Layout cơ bản ===== */
:root {
  --sidebar-offset: 260px;
} /* nếu sidebar của bạn có biến offset */
.page-container {
  margin-left: var(--sidebar-offset); /* bỏ nếu bạn không dùng biến offset */
  padding: 16px;
  background: #f9fafb;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

/* Tabs */
.order-tabs {
  margin-bottom: 1px;
}
.order-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}
.order-tabs :deep(.el-tabs__item) {
  font-weight: 600;
}

/* Container + filters */
.table-container {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}
.filters-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}
.page-container :deep(.el-input__wrapper),
.page-container :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
}

/* Table (desktop) */
.page-container :deep(.el-table th) {
  background: #f9fafb !important;
  color: #6b7280;
  font-weight: 700;
}
.page-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
}
.page-container :deep(.el-table .el-table__row:hover > td) {
  background: #fafafa !important;
}

/* Route cell (desktop & mobile) */
.route-cell,
.route-cell-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
}
.route-cell {
  font-weight: 600;
}
.route-cell-mobile {
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

/* Nút thao tác trong bảng */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.page-container :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* ===== Mobile cards ===== */
.mobile-card-list {
  padding: 12px;
}
.mobile-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}
.card-header {
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.card-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.card-title {
  font-weight: 800;
  color: #111827;
}
.card-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
}
.card-body {
  padding: 12px 14px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
}
.card-label {
  color: #6b7280;
}
.card-value {
  color: #111827;
  font-weight: 600;
}

/* ===== Drawer (Element Plus trong style scoped) ===== */
:deep(.el-drawer__body) {
  display: flex;
  flex-direction: column;
}
.drawer-content {
  flex: 1 1 auto;
  overflow-y: auto;
  padding-right: 8px;
}
.drawer-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}
.product-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
/* ===== Responsive ===== */
@media (min-width: 1024px) {
  .page-container {
    padding: 24px 32px;
  }
  .page-title {
    font-size: 1.8rem;
  }
  .filters-bar {
    padding: 16px 20px;
  }
}

@media (max-width: 900px) {
  /* nếu sidebar là off-canvas trên mobile, bỏ margin-left */
  .page-container {
    margin-left: 0;
  }
}

@media (max-width: 767px) {
  /* Tabs gọn trên mobile */
  .order-tabs :deep(.el-tabs__header) {
    padding: 0 8px;
  }
  .order-tabs :deep(.el-tabs__nav) {
    display: flex;
    width: 100%;
    overflow-x: auto;
  }
  .order-tabs :deep(.el-tabs__item) {
    flex: 1;
    text-align: center;
    padding: 0 6px;
  }
  /* Drawer rộng hơn trên mobile */
  :deep(.el-drawer) {
    width: 92% !important;
  }
}
</style>
