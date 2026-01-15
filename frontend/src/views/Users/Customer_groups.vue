<template>
  <div class="customer-groups-page">
    <div class="page-header">
      <h1 class="page-title">Nhóm khách hàng</h1>
      <el-button type="primary" :icon="Plus" @click="openDialog()">
        Thêm nhóm
      </el-button>
    </div>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo mã hoặc tên nhóm..."
          clearable
          :prefix-icon="Search"
          @keyup.enter="onSearch"
          @clear="onSearch"
        />
      </div>

      <el-table v-if="!isMobile" :data="pagedGroups" style="width: 100%">
        <el-table-column label="Tên nhóm" min-width="350">
          <template #default="scope">
            <div class="group-info">
              <div class="group-icon">
                <el-icon><Folder /></el-icon>
              </div>
              <div>
                <div class="group-name">{{ scope.row.name }}</div>
                <div class="group-description">{{ scope.row.description }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="Mã nhóm" width="180" />
        <el-table-column
          prop="customerCount"
          label="Số khách hàng"
          width="180"
          align="center"
        >
          <template #default="scope">
            <div class="customer-count">
              <el-icon><User /></el-icon>
              <span>{{ scope.row.customerCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="280" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="View"
                text
                bg
                @click="viewCustomersInGroup(scope.row)"
                >Xem khách</el-button
              >
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
        <div v-for="item in pagedGroups" :key="item.code" class="mobile-card">
          <div class="card-header">
            <div class="group-info">
              <div class="group-icon">
                <el-icon><Folder /></el-icon>
              </div>
              <div>
                <div class="group-name">{{ item.name }}</div>
                <div class="group-description">{{ item.description }}</div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Mã nhóm</span>
              <span class="card-value">{{ item.code }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Số khách hàng</span>
              <span class="card-value customer-count">
                <el-icon><User /></el-icon>
                <span>{{ item.customerCount }}</span>
              </span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              size="small"
              :icon="View"
              text
              bg
              @click="viewCustomersInGroup(item)"
              >Xem khách</el-button
            >
            <el-button
              size="small"
              :icon="Edit"
              text
              bg
              @click="openDialog(item)"
              >Sửa</el-button
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
        v-if="pagedGroups.length === 0"
        description="Không có nhóm khách hàng nào"
      />
    </div>

    <div class="pagination-container">
      <el-pagination
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="filteredGroups.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="
        isEditMode ? 'Chỉnh sửa nhóm khách hàng' : 'Thêm nhóm khách hàng mới'
      "
      width="500px"
      :fullscreen="isMobile"
    >
      <el-form :model="form" label-position="top">
        <el-form-item label="Tên nhóm" required>
          <el-input
            v-model="form.name"
            placeholder="Ví dụ: Khách VIP, Khách sỉ..."
          />
        </el-form-item>
        <el-form-item label="Mã nhóm">
          <el-input
            v-model="form.code"
            placeholder="Mã sẽ tự tạo nếu để trống"
          />
        </el-form-item>
        <el-form-item label="Mô tả">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="Nhập mô tả ngắn cho nhóm"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" @click="handleSave">Lưu</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  Search,
  Plus,
  Edit,
  View,
  User,
  Folder,
  Delete,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

// --- ROUTER & RESPONSIVE STATE ---
const router = useRouter();
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
const groups = ref([
  {
    code: "GR001",
    name: "Khách lẻ",
    customerCount: 120,
    description: "Khách hàng mua hàng không thường xuyên.",
  },
  {
    code: "GR002",
    name: "Khách sỉ",
    customerCount: 35,
    description: "Đối tác mua hàng số lượng lớn.",
  },
  {
    code: "GR003",
    name: "Đại lý",
    customerCount: 18,
    description: "Các đại lý phân phối sản phẩm.",
  },
  {
    code: "GR004",
    name: "Khách VIP",
    customerCount: 7,
    description: "Khách hàng có doanh số cao nhất.",
  },
  {
    code: "GR005",
    name: "Khách doanh nghiệp",
    customerCount: 10,
    description: "Khách hàng là các công ty, tổ chức.",
  },
]);

// --- FORM STATE & DIALOG ---
const dialogVisible = ref(false);
const isEditMode = ref(false);
const form = reactive({
  code: "",
  name: "",
  description: "",
  customerCount: 0,
});

const filteredGroups = computed(() => {
  if (!search.value) {
    return groups.value;
  }
  const searchTerm = search.value.toLowerCase();
  return groups.value.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.code.toLowerCase().includes(searchTerm)
  );
});

const pagedGroups = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredGroups.value.slice(start, end);
});

const onSearch = () => {
  currentPage.value = 1;
};

// --- CRUD & ACTION FUNCTIONS ---
const openDialog = (group = null) => {
  if (group) {
    // Chế độ sửa
    isEditMode.value = true;
    Object.assign(form, group); // Copy dữ liệu của nhóm vào form
  } else {
    // Chế độ thêm mới
    isEditMode.value = false;
    Object.assign(form, {
      // Reset form
      code: "",
      name: "",
      description: "",
      customerCount: 0,
    });
  }
  dialogVisible.value = true;
};

const handleSave = () => {
  if (!form.name) {
    ElMessage.error("Vui lòng nhập tên nhóm.");
    return;
  }

  if (isEditMode.value) {
    // Logic cập nhật
    const index = groups.value.findIndex((g) => g.code === form.code);
    if (index !== -1) {
      groups.value[index] = { ...form };
    }
  } else {
    // Logic thêm mới
    const newGroup = { ...form };
    if (!newGroup.code) {
      // Tự tạo mã mới nếu để trống
      const nextId =
        Math.max(
          ...groups.value.map((g) => parseInt(g.code.replace("GR", "")))
        ) + 1;
      newGroup.code = "GR" + String(nextId).padStart(3, "0");
    }
    groups.value.unshift(newGroup); // Thêm vào đầu danh sách
  }

  ElMessage.success("Lưu thông tin nhóm thành công!");
  dialogVisible.value = false;
};

const handleDelete = (group) => {
  ElMessageBox.confirm(
    `Bạn có chắc muốn xóa nhóm "${group.name}"? Thao tác này không thể hoàn tác.`,
    "Xác nhận xóa",
    {
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy",
      type: "warning",
    }
  )
    .then(() => {
      groups.value = groups.value.filter((g) => g.code !== group.code);
      ElMessage.success("Đã xóa nhóm thành công.");
    })
    .catch(() => {
      // Bắt lỗi khi người dùng nhấn "Hủy"
    });
};

const viewCustomersInGroup = (group) => {
  // Điều hướng đến trang danh sách khách hàng, truyền tên nhóm qua query
  router.push({
    name: "CustomerList", // Giả sử route của bạn tên là 'CustomerList'
    query: { group: group.name },
  });
};
</script>

<style scoped>
/* ----- STYLES CHUNG (cho cả desktop và mobile) ----- */
.customer-groups-page {
  padding: 16px; /* Giảm padding cho mobile */
  background-color: #f9fafb;
  font-family: "Inter", sans-serif;
  height: 100%;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-title {
  font-size: 1.5rem; /* Giảm font-size cho mobile */
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
  padding: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}
.pagination-container {
  display: flex;
  justify-content: center; /* Căn giữa cho mobile */
  margin-top: 24px;
}
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.group-info {
  display: flex;
  align-items: center;
  gap: 16px;
}
.group-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #eff6ff;
  color: #2563eb;
  font-size: 20px;
  flex-shrink: 0;
}
.group-name {
  font-weight: 600;
  color: #111827;
}
.group-description {
  font-size: 0.85rem;
  color: #6b7280;
}
.customer-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 500;
  color: #374151;
}
.customer-count .el-icon {
  color: #9ca3af;
}

/* ----- STYLES RIÊNG CHO MOBILE CARD ----- */
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
}
.card-footer {
  padding: 8px 16px;
  background-color: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ----- ELEMENT PLUS CUSTOMIZATION ----- */
.customer-groups-page :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}
.customer-groups-page :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
}

/* Desktop styles */
@media (min-width: 768px) {
  .customer-groups-page {
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
  .customer-groups-page :deep(.el-button--primary) {
    background-color: #2563eb;
    border-color: #2563eb;
  }
  .customer-groups-page :deep(.el-input) {
    /* max-width: 400px; */
  }
  .customer-groups-page :deep(.el-table th) {
    background-color: #f9fafb !important;
    color: #6b7280;
    font-weight: 600;
  }
  .customer-groups-page :deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid #f3f4f6;
    padding: 14px 0;
  }
  .customer-groups-page :deep(.el-table .el-table__row:hover > td) {
    background-color: #f9fafb !important;
  }
  .customer-groups-page
    :deep(
      .el-pagination.is-background .el-pager li:not(.is-disabled).is-active
    ) {
    background-color: #2563eb;
  }
}
</style>
