<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Quản lý nhân viên</h1>
      <el-button type="primary" :icon="Plus" @click="openAddStaffDialog">
        Thêm nhân viên
      </el-button>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo tên, email, SĐT, chức vụ..."
          clearable
          :prefix-icon="Search"
          @keyup.enter="onSearch"
          @clear="onSearch"
        />
        <div v-if="!isMobile" class="advanced-filters">
          <el-select
            v-model="selectedDepartment"
            placeholder="Phòng ban"
            clearable
            @change="onSearch"
          >
            <el-option
              v-for="dept in departments"
              :key="dept"
              :label="dept"
              :value="dept"
            />
          </el-select>
          <el-select
            v-model="selectedPosition"
            placeholder="Chức vụ"
            clearable
            @change="onSearch"
          >
            <el-option
              v-for="pos in positions"
              :key="pos"
              :label="pos"
              :value="pos"
            />
          </el-select>
          <el-select
            v-model="selectedStatus"
            placeholder="Trạng thái"
            clearable
            @change="onSearch"
          >
            <el-option label="Đang làm việc" value="active" />
            <el-option label="Nghỉ việc" value="inactive" />
            <el-option label="Tạm nghỉ" value="suspended" />
          </el-select>
        </div>
      </div>

      <el-table v-if="!isMobile" :data="pagedStaff" style="width: 100%">
        <el-table-column label="Nhân viên" min-width="250">
          <template #default="scope">
            <div class="staff-info">
              <el-avatar :size="40" :src="scope.row.avatarUrl">
                {{ scope.row.name.charAt(0) }}
              </el-avatar>
              <div>
                <div class="staff-name">{{ scope.row.name }}</div>
                <div class="staff-contact">{{ scope.row.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="Email" width="220" />
        <el-table-column prop="position" label="Chức vụ" width="150" />
        <el-table-column prop="department" label="Phòng ban" width="150" />
        <el-table-column label="Trạng thái" width="130" align="center">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === 'active'
                  ? 'success'
                  : scope.row.status === 'suspended'
                  ? 'warning'
                  : 'info'
              "
              size="small"
            >
              {{
                scope.row.status === "active"
                  ? "Đang làm việc"
                  : scope.row.status === "suspended"
                  ? "Tạm nghỉ"
                  : "Nghỉ việc"
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="Ngày vào làm" width="140" />
        <el-table-column label="Thao tác" width="120" align="center" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="Edit"
                circle
                @click="openEditDialog(scope.row)"
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
        <div v-for="item in pagedStaff" :key="item.id" class="mobile-card">
          <div class="card-header staff-info">
            <el-avatar :size="40" :src="item.avatarUrl">
              {{ item.name.charAt(0) }}
            </el-avatar>
            <div>
              <div class="staff-name">{{ item.name }}</div>
              <div class="staff-contact">{{ item.phone }}</div>
            </div>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Email</span>
              <span class="card-value">{{ item.email }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Chức vụ</span>
              <span class="card-value">{{ item.position }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Phòng ban</span>
              <span class="card-value">{{ item.department }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Trạng thái</span>
              <span class="card-value">
                <el-tag
                  :type="
                    item.status === 'active'
                      ? 'success'
                      : item.status === 'suspended'
                      ? 'warning'
                      : 'info'
                  "
                  size="small"
                >
                  {{
                    item.status === "active"
                      ? "Đang làm việc"
                      : item.status === "suspended"
                      ? "Tạm nghỉ"
                      : "Nghỉ việc"
                  }}
                </el-tag>
              </span>
            </div>
            <div class="card-row">
              <span class="card-label">Ngày vào làm</span>
              <span class="card-value">{{ item.joinDate }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              size="small"
              :icon="Edit"
              text
              bg
              @click="openEditDialog(item)"
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
        v-if="pagedStaff.length === 0"
        description="Không có nhân viên nào"
      />
    </div>

    <div class="pagination-container">
      <el-pagination
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="filteredStaff.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <el-drawer
      v-model="drawerVisible"
      :title="isEditMode ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'"
      direction="rtl"
      size="500px"
      :fullscreen="isMobile"
    >
      <el-form :model="form" label-position="top" class="staff-form">
        <el-form-item label="Họ và tên" required>
          <el-input v-model="form.name" placeholder="Nhập họ và tên" />
        </el-form-item>
        <el-form-item label="Email" required>
          <el-input
            v-model="form.email"
            type="email"
            placeholder="Nhập email"
          />
        </el-form-item>
        <el-form-item label="Số điện thoại" required>
          <el-input
            v-model="form.phone"
            placeholder="Nhập số điện thoại"
          />
        </el-form-item>
        <el-form-item label="Chức vụ" required>
          <el-select v-model="form.position" placeholder="Chọn chức vụ">
            <el-option
              v-for="pos in positions"
              :key="pos"
              :label="pos"
              :value="pos"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Phòng ban" required>
          <el-select v-model="form.department" placeholder="Chọn phòng ban">
            <el-option
              v-for="dept in departments"
              :key="dept"
              :label="dept"
              :value="dept"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Ngày vào làm" required>
          <el-date-picker
            v-model="form.joinDate"
            type="date"
            placeholder="Chọn ngày vào làm"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Trạng thái" required>
          <el-radio-group v-model="form.status">
            <el-radio label="active">Đang làm việc</el-radio>
            <el-radio label="suspended">Tạm nghỉ</el-radio>
            <el-radio label="inactive">Nghỉ việc</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            placeholder="Nhập ghi chú (nếu có)"
          />
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
const selectedDepartment = ref(null);
const selectedPosition = ref(null);
const selectedStatus = ref(null);

// Dữ liệu mẫu
const staffList = ref([
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "an.nguyen@supermarket.com",
    phone: "0905123456",
    position: "Quản lý",
    department: "Quản lý",
    status: "active",
    joinDate: "15/01/2020",
    avatarUrl: "",
    notes: "",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "binh.tran@supermarket.com",
    phone: "0913654321",
    position: "Nhân viên bán hàng",
    department: "Bán hàng",
    status: "active",
    joinDate: "20/03/2021",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    notes: "",
  },
  {
    id: 3,
    name: "Lê Hoàng Cường",
    email: "cuong.le@supermarket.com",
    phone: "0987111222",
    position: "Thu ngân",
    department: "Bán hàng",
    status: "active",
    joinDate: "10/05/2021",
    avatarUrl: "",
    notes: "",
  },
  {
    id: 4,
    name: "Phạm Mỹ Duyên",
    email: "duyen.pham@supermarket.com",
    phone: "0933555888",
    position: "Nhân viên kho",
    department: "Kho",
    status: "active",
    joinDate: "05/07/2021",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026705d",
    notes: "",
  },
  {
    id: 5,
    name: "Võ Thành Danh",
    email: "danh.vo@supermarket.com",
    phone: "0977999000",
    position: "Nhân viên bán hàng",
    department: "Bán hàng",
    status: "suspended",
    joinDate: "12/09/2021",
    avatarUrl: "",
    notes: "Tạm nghỉ do lý do cá nhân",
  },
  {
    id: 6,
    name: "Đỗ Ngọc Giang",
    email: "giang.do@supermarket.com",
    phone: "0945121212",
    position: "Kế toán",
    department: "Kế toán",
    status: "active",
    joinDate: "01/11/2021",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026706d",
    notes: "",
  },
  {
    id: 7,
    name: "Hoàng Văn Hùng",
    email: "hung.hoang@supermarket.com",
    phone: "0966333444",
    position: "Nhân viên bảo vệ",
    department: "Bảo vệ",
    status: "active",
    joinDate: "20/12/2021",
    avatarUrl: "",
    notes: "",
  },
  {
    id: 8,
    name: "Nguyễn Thị Lan",
    email: "lan.nguyen@supermarket.com",
    phone: "0922444555",
    position: "Nhân viên bán hàng",
    department: "Bán hàng",
    status: "inactive",
    joinDate: "15/02/2022",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026707d",
    notes: "Đã nghỉ việc",
  },
]);

const departments = computed(() => {
  const depts = staffList.value.map((s) => s.department);
  return [...new Set(depts)];
});

const positions = computed(() => {
  const pos = staffList.value.map((s) => s.position);
  return [...new Set(pos)];
});

const filteredStaff = computed(() => {
  let result = staffList.value;

  // Lọc theo từ khóa tìm kiếm
  if (search.value) {
    const searchTerm = search.value.toLowerCase();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.phone.includes(searchTerm) ||
        item.email.toLowerCase().includes(searchTerm) ||
        item.position.toLowerCase().includes(searchTerm) ||
        item.department.toLowerCase().includes(searchTerm)
    );
  }

  // Lọc theo phòng ban
  if (selectedDepartment.value) {
    result = result.filter(
      (item) => item.department === selectedDepartment.value
    );
  }

  // Lọc theo chức vụ
  if (selectedPosition.value) {
    result = result.filter((item) => item.position === selectedPosition.value);
  }

  // Lọc theo trạng thái
  if (selectedStatus.value) {
    result = result.filter((item) => item.status === selectedStatus.value);
  }

  return result;
});

const pagedStaff = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredStaff.value.slice(start, start + pageSize);
});

const onSearch = () => {
  currentPage.value = 1;
};

// --- FORM STATE & DRAWER ---
const drawerVisible = ref(false);
const isEditMode = ref(false);
const form = reactive({
  id: null,
  name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  status: "active",
  joinDate: "",
  notes: "",
});

// --- CRUD FUNCTIONS ---
const openAddStaffDialog = () => {
  isEditMode.value = false;
  Object.assign(form, {
    id: null,
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    status: "active",
    joinDate: "",
    notes: "",
  });
  drawerVisible.value = true;
};

const openEditDialog = (staff) => {
  isEditMode.value = true;
  Object.assign(form, { ...staff });
  drawerVisible.value = true;
};

const handleSave = () => {
  if (!form.name || !form.email || !form.phone || !form.position || !form.department) {
    ElMessage.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
    return;
  }

  if (isEditMode.value) {
    // Update logic (chưa có API)
    const index = staffList.value.findIndex((s) => s.id === form.id);
    if (index !== -1) {
      staffList.value[index] = { ...form };
    }
    ElMessage.success("Cập nhật nhân viên thành công!");
  } else {
    // Create logic (chưa có API)
    staffList.value.unshift({
      ...form,
      id: Date.now(),
      avatarUrl: "",
    });
    ElMessage.success("Thêm nhân viên thành công!");
  }

  drawerVisible.value = false;
};

const handleDelete = (staff) => {
  ElMessageBox.confirm(
    `Bạn có chắc muốn xóa nhân viên "${staff.name}" không?`,
    "Xác nhận xóa",
    {
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      type: "warning",
    }
  )
    .then(() => {
      staffList.value = staffList.value.filter((s) => s.id !== staff.id);
      ElMessage.success("Xóa thành công");
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

.staff-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.staff-name {
  font-weight: 600;
  color: #111827;
}
.staff-contact {
  font-size: 0.85rem;
  color: #6b7280;
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

/* ----- FORM STYLES ----- */
.staff-form {
  padding: 0 8px;
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
