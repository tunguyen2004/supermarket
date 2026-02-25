<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Nhà cung cấp</h1>
      <el-button type="primary" :icon="Plus" @click="openDialog()">
        Thêm nhà cung cấp
      </el-button>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo tên, mã, SĐT nhà cung cấp..."
          clearable
          :prefix-icon="Search"
        />
        <el-select
          v-if="!isMobile"
          v-model="statusFilter"
          placeholder="Trạng thái"
          clearable
          style="width: 100%"
        >
          <el-option label="Tất cả trạng thái" value="all"></el-option>
          <el-option label="Đang hợp tác" value="Đang hợp tác"></el-option>
          <el-option label="Ngừng hợp tác" value="Ngừng hợp tác"></el-option>
        </el-select>
      </div>

      <el-table
        v-if="!isMobile"
        :data="pagedSuppliers"
        v-loading="isLoading"
        style="width: 100%"
      >
        <el-table-column label="Nhà cung cấp" min-width="250">
          <template #default="scope">
            <div class="supplier-info">
              <div class="supplier-name">{{ scope.row.name }}</div>
              <div class="supplier-code">Mã: {{ scope.row.code }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Thông tin liên hệ" min-width="220">
          <template #default="scope">
            <div>{{ scope.row.contactPerson }}</div>
            <div class="supplier-contact">{{ scope.row.phone }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="Địa chỉ" min-width="250" />
        <el-table-column label="Trạng thái" width="160" align="center">
          <template #default="scope">
            <el-tag
              :type="getStatusInfo(scope.row.status).type"
              effect="light"
              size="small"
            >
              {{ scope.row.status }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="180" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="Edit"
                text
                bg
                @click="openDialog(scope.row)"
                >Sửa</el-button
              >
              <el-button
                size="small"
                :icon="Delete"
                text
                bg
                type="danger"
                @click="handleDelete(scope.row)"
                >Xóa</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="mobile-card-list">
        <div v-for="item in pagedSuppliers" :key="item.id" class="mobile-card">
          <div class="card-header">
            <div class="supplier-info">
              <div class="supplier-name">{{ item.name }}</div>
              <div class="supplier-code">Mã: {{ item.code }}</div>
            </div>
            <el-tag
              :type="getStatusInfo(item.status).type"
              effect="light"
              size="small"
              >{{ item.status }}</el-tag
            >
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Người liên hệ</span>
              <span class="card-value">{{ item.contactPerson }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Điện thoại</span>
              <span class="card-value">{{ item.phone }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Địa chỉ</span>
              <span class="card-value">{{ item.address }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              size="small"
              :icon="Delete"
              text
              bg
              type="danger"
              @click="handleDelete(item)"
              >Xóa</el-button
            >
            <el-button
              size="small"
              :icon="Edit"
              text
              bg
              @click="openDialog(item)"
              >Sửa</el-button
            >
          </div>
        </div>
      </div>

      <el-empty
        v-if="!isLoading && pagedSuppliers.length === 0"
        description="Không có nhà cung cấp nào"
      />
    </div>

    <div class="pagination-container">
      <el-pagination
        v-if="totalItems > 0"
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="totalItems"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'"
      width="600px"
      :fullscreen="isMobile"
    >
      <el-form :model="form" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Tên nhà cung cấp" required>
              <el-input
                v-model="form.name"
                placeholder="Nhập tên nhà cung cấp"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Mã nhà cung cấp">
              <el-input
                v-model="form.code"
                placeholder="Tự tạo nếu để trống"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Số điện thoại" required>
              <el-input v-model="form.phone" placeholder="Nhập số điện thoại" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Email">
              <el-input v-model="form.email" placeholder="Nhập email" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Địa chỉ">
          <el-input
            v-model="form.address"
            type="textarea"
            :rows="2"
            placeholder="Nhập địa chỉ"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã số thuế">
              <el-input v-model="form.tax_code" placeholder="Nhập mã số thuế" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái">
              <el-switch
                v-model="form.is_active"
                active-text="Đang hợp tác"
                inactive-text="Ngừng hợp tác"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave"
          >Lưu</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from "vue";
import { Search, Plus, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import apiClient from "@/services/apiClient";

// --- STATE ---
const isMobile = ref(false);
const isLoading = ref(true);
const search = ref("");
const statusFilter = ref("all");
const currentPage = ref(1);
const pageSize = 10;
const totalItems = ref(0);
const suppliers = ref([]);
const saving = ref(false);

// --- DIALOG & FORM STATE ---
const dialogVisible = ref(false);
const isEditMode = ref(false);
const form = reactive({
  id: null,
  name: "",
  code: "",
  phone: "",
  email: "",
  address: "",
  tax_code: "",
  is_active: true,
});

// --- HELPERS ---
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
const getStatusInfo = (status) => {
  if (status === "Đang hợp tác") return { type: "success" };
  if (status === "Ngừng hợp tác") return { type: "info" };
  return { type: "primary" };
};

// Map API data to display format
const mapSupplier = (s) => ({
  id: s.id,
  code: s.code,
  name: s.name,
  contactPerson: s.name,
  phone: s.phone || "",
  email: s.email || "",
  address: s.address || "",
  tax_code: s.tax_code || "",
  status: s.is_active ? "Đang hợp tác" : "Ngừng hợp tác",
  is_active: s.is_active,
  city_name: s.city_name || "",
});

// --- FETCH ---
const fetchSuppliers = async () => {
  try {
    isLoading.value = true;
    const params = {
      page: currentPage.value,
      limit: pageSize,
    };
    if (search.value.trim()) params.search = search.value.trim();
    if (statusFilter.value === "Đang hợp tác") params.is_active = true;
    else if (statusFilter.value === "Ngừng hợp tác") params.is_active = false;

    const res = await apiClient.get("/api/suppliers", { params });
    const data = res.data;
    suppliers.value = (data.data || []).map(mapSupplier);
    totalItems.value = data.pagination?.total || 0;
  } catch (err) {
    console.error("Fetch suppliers error:", err);
    ElMessage.error("Không thể tải danh sách nhà cung cấp");
  } finally {
    isLoading.value = false;
  }
};

// --- COMPUTED (server-side pagination) ---
const filteredSuppliers = computed(() => suppliers.value);
const pagedSuppliers = computed(() => suppliers.value);

// --- ACTIONS ---
const openDialog = (supplier = null) => {
  if (supplier) {
    isEditMode.value = true;
    Object.assign(form, {
      id: supplier.id,
      name: supplier.name,
      code: supplier.code,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      tax_code: supplier.tax_code || "",
      is_active: supplier.status === "Đang hợp tác",
    });
  } else {
    isEditMode.value = false;
    Object.assign(form, {
      id: null,
      name: "",
      code: "",
      phone: "",
      email: "",
      address: "",
      tax_code: "",
      is_active: true,
    });
  }
  dialogVisible.value = true;
};

const handleSave = async () => {
  if (!form.name || !form.phone) {
    ElMessage.error("Vui lòng điền các trường bắt buộc: Tên, SĐT.");
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      tax_code: form.tax_code || null,
      is_active: form.is_active,
    };

    if (isEditMode.value) {
      await apiClient.put(`/api/suppliers/${form.id}`, payload);
      ElMessage.success("Cập nhật nhà cung cấp thành công!");
    } else {
      await apiClient.post("/api/suppliers", payload);
      ElMessage.success("Thêm nhà cung cấp thành công!");
    }
    dialogVisible.value = false;
    fetchSuppliers();
  } catch (err) {
    console.error("Save supplier error:", err);
    ElMessage.error(
      err.response?.data?.message || "Không thể lưu nhà cung cấp",
    );
  } finally {
    saving.value = false;
  }
};

const handleDelete = (supplier) => {
  ElMessageBox.confirm(
    `Bạn có chắc muốn xóa nhà cung cấp "${supplier.name}" không?`,
    "Xác nhận xóa",
    { confirmButtonText: "Đồng ý", cancelButtonText: "Hủy", type: "warning" },
  )
    .then(async () => {
      try {
        await apiClient.delete(`/api/suppliers/${supplier.id}`);
        ElMessage.success("Đã xóa nhà cung cấp.");
        fetchSuppliers();
      } catch (err) {
        console.error("Delete supplier error:", err);
        ElMessage.error(
          err.response?.data?.message || "Không thể xóa nhà cung cấp",
        );
      }
    })
    .catch(() => {});
};

// --- LIFECYCLE & WATCHERS ---
watch([search, statusFilter], () => {
  currentPage.value = 1;
  fetchSuppliers();
});

watch(currentPage, () => {
  fetchSuppliers();
});

onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  fetchSuppliers();
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
});
</script>

<style scoped>
/* GENERAL */
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
.input-email {
  width: 560px;
}

/* SUPPLIER INFO */
.supplier-name {
  font-weight: 600;
  color: #111827;
}
.supplier-code,
.supplier-contact {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 2px;
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
.page-container :deep(.el-input__wrapper),
.page-container :deep(.el-select .el-select__wrapper) {
  border-radius: 6px;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
}
.page-container :deep(.el-select) {
  width: 100%;
}

/* DESKTOP OVERRIDES */
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
  .page-container :deep(.el-select) {
    /* width: auto; */
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
