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
        <el-table-column
          label="Thao tác"
          width="120"
          align="center"
          fixed="right"
        >
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
        <el-form-item label="Tên đăng nhập" required>
          <el-input
            v-model="form.username"
            placeholder="Nhập tên đăng nhập"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item label="Mật khẩu" required v-if="!isEditMode">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Nhập mật khẩu"
            show-password
          />
        </el-form-item>
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
          <el-input v-model="form.phone" placeholder="Nhập số điện thoại" />
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
        <!-- <el-form-item label="Phòng ban" required>
          <el-select v-model="form.department" placeholder="Chọn phòng ban">
            <el-option
              v-for="dept in departments"
              :key="dept"
              :label="dept"
              :value="dept"
            />
          </el-select>
        </el-form-item> -->
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
            <!-- <el-radio label="suspended">Tạm nghỉ</el-radio> -->
            <el-radio label="inactive">Nghỉ việc</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="Ghi chú">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            placeholder="Nhập ghi chú (nếu có)"
          />
        </el-form-item> -->
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
import { Search, Plus, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import staffService from "@/services/staffService";
import dayjs from "dayjs";

// --- RESPONSIVE STATE ---
const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  fetchStaffList();
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

const staffList = ref([]);
const loading = ref(false);

const roleMapping = {
  1: "Quản trị viên",
  2: "Nhân viên bán hàng",
};

const fetchStaffList = async () => {
  loading.value = true;
  try {
    const response = await staffService.getStaffs();
    // Giả sử response.data.data là mảng users
    const items = response.data.data || [];
    staffList.value = items.map((item) => ({
      id: item.id,
      name: item.full_name,
      email: item.email,
      phone: item.phone,
      username: item.username,
      // Map role_id sang tên chức vụ (nếu API trả về role_id, nếu không thì để trống)
      position: roleMapping[item.role_id] || "Nhân viên",
      role_id: item.role_id,
      // API chưa có department, tạm để trống hoặc hardcode
      department: "Cửa hàng",
      status: item.is_active ? "active" : "inactive",
      joinDate: item.created_at
        ? dayjs(item.created_at).format("DD/MM/YYYY")
        : "",
      avatarUrl: item.avatar_url
        ? `http://localhost:5000${item.avatar_url}`
        : "",
      notes: "",
    }));
  } catch (error) {
    console.error(error);
    ElMessage.error("Không thể tải danh sách nhân viên");
  } finally {
    loading.value = false;
  }
};

const departments = computed(() => {
  const depts = staffList.value.map((s) => s.department);
  return [...new Set(depts)];
});

const positions = computed(() => {
  // Hoặc dùng danh sách cứng nếu muốn
  return Object.values(roleMapping);
});

const filteredStaff = computed(() => {
  let result = staffList.value;

  // Lọc theo từ khóa tìm kiếm
  if (search.value) {
    const searchTerm = search.value.toLowerCase();
    result = result.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
        (item.phone && item.phone.includes(searchTerm)) ||
        (item.email && item.email.toLowerCase().includes(searchTerm)) ||
        (item.position && item.position.toLowerCase().includes(searchTerm)) ||
        (item.username && item.username.toLowerCase().includes(searchTerm)),
    );
  }

  // Lọc theo phòng ban
  if (selectedDepartment.value) {
    result = result.filter(
      (item) => item.department === selectedDepartment.value,
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
  username: "",
  password: "",
  name: "",
  email: "",
  phone: "",
  position: "", // UI display only? Or map back to role_id?
  role_id: 2, // Default role
  department: "Cửa hàng",
  status: "active",
  joinDate: "", // Read only or update? API doesn't support update join date
  notes: "",
});

// --- CRUD FUNCTIONS ---
const openAddStaffDialog = () => {
  isEditMode.value = false;
  Object.assign(form, {
    id: null,
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    role_id: 2,
    position: roleMapping[2],
    department: "Cửa hàng",
    status: "active",
    joinDate: dayjs().format("YYYY-MM-DD"),
    notes: "",
  });
  drawerVisible.value = true;
};

const openEditDialog = (staff) => {
  isEditMode.value = true;
  Object.assign(form, {
    ...staff,
    // Cần giữ role_id nếu có trong staff, nếu không map từ position
  });
  // Map position back to role_id if needed or ensure staff object has role_id
  if (!form.role_id) {
    // Simple reverse mapping lookup if needed, or default
    const entry = Object.entries(roleMapping).find(
      ([k, v]) => v === form.position,
    );
    if (entry) form.role_id = parseInt(entry[0]);
  }

  drawerVisible.value = true;
};

const handleSave = async () => {
  if (!form.name || !form.email || !form.phone) {
    ElMessage.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
    return;
  }

  if (isEditMode.value) {
    try {
      // 1. Cập nhật thông tin cơ bản
      await staffService.updateStaff(form.id, {
        full_name: form.name,
        phone: form.phone,
        // API update info chỉ nhận full_name, phone như mô tả
      });

      // 2. Cập nhật role (nếu role thay đổi và logic form cho phép chọn role)
      // Hiện tại form dùng select position bind vào form.position string.
      // Cần logic map form.position về role_id để gọi API update role.
      // Giả sử form có select role_id (cần sửa template)
      if (form.role_id) {
        await staffService.updateStaffRole(form.id, form.role_id);
      }

      ElMessage.success("Cập nhật nhân viên thành công!");
      fetchStaffList();
      drawerVisible.value = false;
    } catch (error) {
      console.error(error);
      ElMessage.error(
        error.response?.data?.message || "Lỗi cập nhật nhân viên",
      );
    }
  } else {
    // Thêm mới
    if (!form.username || !form.password) {
      ElMessage.error("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }

    try {
      await staffService.createStaff({
        username: form.username,
        email: form.email,
        full_name: form.name,
        phone: form.phone,
        password: form.password,
        role_id: form.role_id,
      });
      ElMessage.success("Thêm nhân viên thành công!");
      fetchStaffList();
      drawerVisible.value = false;
    } catch (error) {
      console.error(error);
      ElMessage.error(error.response?.data?.message || "Lỗi thêm nhân viên");
    }
  }
};

const handleDelete = (staff) => {
  ElMessageBox.confirm(
    `Bạn có chắc muốn xóa nhân viên "${staff.name}" không?`,
    "Xác nhận xóa",
    {
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await staffService.deleteStaff(staff.id);
        ElMessage.success("Xóa thành công");
        fetchStaffList();
      } catch (error) {
        console.error(error);
        ElMessage.error("Xóa thất bại");
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
.advanced-filters {
  display: flex;
  gap: 12px;
  width: 400px;
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
