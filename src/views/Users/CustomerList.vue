<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Danh sách khách hàng</h1>
      <el-button type="primary" :icon="Plus" @click="openDrawer()">
        Thêm khách hàng
      </el-button>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo tên, SĐT, email..."
          clearable
          :prefix-icon="Search"
          @keyup.enter="onSearch"
          @clear="onSearch"
        />
        <div v-if="!isMobile" class="advanced-filters">
          <el-dropdown @command="handleGroupFilter">
            <el-button>
              {{ selectedGroup || "Nhóm khách hàng" }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="null">Tất cả</el-dropdown-item>
                <el-dropdown-item
                  v-for="group in customerGroups"
                  :key="group"
                  :command="group"
                  >{{ group }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
            >Tag <el-icon class="el-icon--right"><PriceTag /></el-icon
          ></el-button>
        </div>
      </div>

      <el-table v-if="!isMobile" :data="pagedCustomers" style="width: 100%">
        <el-table-column label="Khách hàng" min-width="250">
          <template #default="scope">
            <div class="customer-info">
              <el-avatar :size="40" :src="scope.row.avatarUrl">{{
                scope.row.name.charAt(0)
              }}</el-avatar>
              <div>
                <div class="customer-name">{{ scope.row.name }}</div>
                <div class="customer-contact">{{ scope.row.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="Email" width="220" />
        <el-table-column prop="group" label="Nhóm" width="150" />
        <el-table-column
          prop="totalSpent"
          label="Tổng chi tiêu"
          width="180"
          sortable
        >
          <template #default="scope">
            <span class="total-spent">{{
              formatCurrency(scope.row.totalSpent)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="120" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="Edit"
                circle
                @click="openDrawer(scope.row)"
              />
              <el-button
                size="small"
                :icon="Delete"
                circle
                type="danger"
                plain
                @click="handleDelete(scope.row)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="mobile-card-list">
        <div v-for="item in pagedCustomers" :key="item.id" class="mobile-card">
          <div class="card-header customer-info">
            <el-avatar :size="40" :src="item.avatarUrl">{{
              item.name.charAt(0)
            }}</el-avatar>
            <div>
              <div class="customer-name">{{ item.name }}</div>
              <div class="customer-contact">{{ item.phone }}</div>
            </div>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Email</span>
              <span class="card-value">{{ item.email }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Nhóm</span>
              <span class="card-value">{{ item.group }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Tổng chi tiêu</span>
              <span class="card-value total-spent">{{
                formatCurrency(item.totalSpent)
              }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              size="small"
              :icon="Edit"
              text
              bg
              @click="openDrawer(item)"
              >Chỉnh sửa</el-button
            >
            <el-button
              size="small"
              :icon="Delete"
              text
              bg
              type="danger"
              @click="handleDelete(item)"
              >Xóa</el-button
            >
          </div>
        </div>
      </div>
      <el-empty
        v-if="pagedCustomers.length === 0"
        description="Không có khách hàng nào"
      />
    </div>

    <div class="pagination-container">
      <el-pagination
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="filteredCustomers.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <el-drawer
      v-model="drawerVisible"
      :title="isEditMode ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'"
      direction="rtl"
      size="450px"
    >
      <el-form :model="form" label-position="top">
        <el-form-item label="Tên khách hàng" required>
          <el-input v-model="form.name" placeholder="Nhập tên khách hàng" />
        </el-form-item>
        <el-form-item label="Số điện thoại" required>
          <el-input v-model="form.phone" placeholder="Nhập số điện thoại" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="form.email" placeholder="Nhập email" />
        </el-form-item>
        <el-form-item label="Nhóm khách hàng">
          <el-select v-model="form.group" placeholder="Chọn nhóm khách hàng">
            <el-option
              v-for="group in customerGroups"
              :key="group"
              :label="group"
              :value="group"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawerVisible = false">Hủy</el-button>
        <el-button type="primary" @click="handleSave">Lưu</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import {
  Search,
  Plus,
  Edit,
  Delete,
  ArrowDown,
  PriceTag,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

// --- RESPONSIVE STATE ---
const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
});
onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// --- COMPONENT LOGIC ---
const search = ref("");
const currentPage = ref(1);
const pageSize = 10;
const selectedGroup = ref(null);

const customers = ref([
  {
    id: 1,
    name: "Trần Văn An",
    phone: "0905123456",
    email: "an.tv@example.com",
    group: "Khách VIP",
    totalSpent: 15600000,
    avatarUrl: "",
  },
  {
    id: 2,
    name: "Nguyễn Thị Bình",
    phone: "0913654321",
    email: "binh.nt@example.com",
    group: "Khách thân thiết",
    totalSpent: 8250000,
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    id: 3,
    name: "Lê Hoàng Cường",
    phone: "0987111222",
    email: "cuong.lh@example.com",
    group: "Khách sỉ",
    totalSpent: 22000000,
    avatarUrl: "",
  },
  {
    id: 4,
    name: "Phạm Mỹ Duyên",
    phone: "0933555888",
    email: "duyen.pm@example.com",
    group: "Khách lẻ",
    totalSpent: 150000,
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026705d",
  },
  {
    id: 5,
    name: "Võ Thành Danh",
    phone: "0977999000",
    email: "danh.vt@example.com",
    group: "Khách mới",
    totalSpent: 320000,
    avatarUrl: "",
  },
  {
    id: 6,
    name: "Đỗ Ngọc Giang",
    phone: "0945121212",
    email: "giang.dn@example.com",
    group: "Khách thân thiết",
    totalSpent: 5400000,
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026706d",
  },
]);

// --- FORM STATE & DRAWER ---
const drawerVisible = ref(false);
const isEditMode = ref(false);
const form = reactive({
  id: null,
  name: "",
  phone: "",
  email: "",
  group: "Khách mới",
});

const formatCurrency = (value) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const customerGroups = computed(() => {
  const groups = customers.value.map((c) => c.group);
  return [...new Set(groups)]; // Lấy các nhóm duy nhất
});

const filteredCustomers = computed(() => {
  let result = customers.value;
  // Lọc theo từ khóa tìm kiếm
  if (search.value) {
    const searchTerm = search.value.toLowerCase();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.phone.includes(searchTerm) ||
        item.email.toLowerCase().includes(searchTerm)
    );
  }
  // Lọc theo nhóm khách hàng
  if (selectedGroup.value) {
    result = result.filter((item) => item.group === selectedGroup.value);
  }
  return result;
});

const pagedCustomers = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredCustomers.value.slice(start, start + pageSize);
});

const onSearch = () => {
  currentPage.value = 1;
};

const handleGroupFilter = (group) => {
  selectedGroup.value = group;
  currentPage.value = 1;
};

// --- CRUD FUNCTIONS ---
const openDrawer = (customer = null) => {
  if (customer) {
    isEditMode.value = true;
    Object.assign(form, customer);
  } else {
    isEditMode.value = false;
    Object.assign(form, {
      // Reset form
      id: null,
      name: "",
      phone: "",
      email: "",
      group: "Khách mới",
    });
  }
  drawerVisible.value = true;
};

const handleSave = () => {
  if (!form.name || !form.phone) {
    ElMessage.error("Vui lòng nhập Tên và Số điện thoại.");
    return;
  }

  if (isEditMode.value) {
    // Update logic
    const index = customers.value.findIndex((c) => c.id === form.id);
    if (index !== -1) {
      customers.value[index] = { ...form };
    }
  } else {
    // Create logic
    customers.value.unshift({
      ...form,
      id: Date.now(), // Tạo ID tạm thời
      totalSpent: 0,
      avatarUrl: "",
    });
  }

  ElMessage.success("Lưu khách hàng thành công!");
  drawerVisible.value = false;
};

const handleDelete = (customer) => {
  ElMessageBox.confirm(
    `Bạn có chắc muốn xóa khách hàng "${customer.name}" không?`,
    "Xác nhận xóa",
    {
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      type: "warning",
    }
  )
    .then(() => {
      customers.value = customers.value.filter((c) => c.id !== customer.id);
      ElMessage.success("Xóa thành công");
    })
    .catch(() => {});
};
</script>

<style scoped>
.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.customer-name {
  font-weight: 600;
  color: #111827;
}
.customer-contact {
  font-size: 0.85rem;
  color: #6b7280;
}
.total-spent {
  font-weight: 500;
  color: #166534; /* Green for money */
}

/* Thêm style cho card-value của mobile */
.mobile-card .card-value.total-spent {
  font-size: 1rem;
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
.advanced-filters {
  display: flex;
  gap: 12px;
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
  padding: 0 16px;
}
.mobile-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-block: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 600;
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
.page-container :deep(.el-input__wrapper),
.page-container :deep(.el-select .el-select__wrapper) {
  border-radius: 6px;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
  width: 100%;
}
.page-container :deep(.el-select) {
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
    width: 400px;
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
