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
              {{ selectedGroupName || "Nhóm khách hàng" }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="null">Tất cả</el-dropdown-item>
                <el-dropdown-item
                  v-for="group in customerGroups"
                  :key="group.id"
                  :command="group.id"
                  >{{ group.name }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
            >Tag <el-icon class="el-icon--right"><PriceTag /></el-icon
          ></el-button>
        </div>
      </div>

      <el-table
        v-if="!isMobile"
        :data="pagedCustomers"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column label="Khách hàng" min-width="280">
          <template #default="scope">
            <div class="customer-info">
              <el-avatar :size="40" :src="scope.row.avatarUrl">{{
                scope.row.name.charAt(0)
              }}</el-avatar>
              <div>
                <div class="customer-name">{{ scope.row.name }}</div>
                <div class="customer-contact">{{ scope.row.phone }}</div>
                <div class="customer-code">{{ scope.row.code }}</div>
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
        <el-table-column label="Thao tác" width="150" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="View"
                circle
                @click="fetchCustomerDetail(scope.row.id)"
              />
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
        :total="totalCustomers"
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
        <el-form-item label="Mã khách hàng">
          <el-input v-model="form.code" placeholder="Tự động: KH-202602-00001" />
        </el-form-item>
        <el-form-item label="Tên khách hàng" required>
          <el-input
            v-model="form.full_name"
            placeholder="Nhập tên khách hàng"
          />
        </el-form-item>
        <el-form-item label="Số điện thoại" required>
          <el-input v-model="form.phone" placeholder="Nhập số điện thoại" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="form.email" placeholder="Nhập email" />
        </el-form-item>
        <el-form-item label="Địa chỉ">
          <el-input v-model="form.address" placeholder="Nhập địa chỉ" />
        </el-form-item>
        <el-form-item label="Ngày sinh">
          <el-date-picker
            v-model="form.date_of_birth"
            type="date"
            placeholder="Chọn ngày sinh"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Giới tính">
          <el-select v-model="form.gender" placeholder="Chọn giới tính" clearable>
            <el-option label="Nam" value="male" />
            <el-option label="Nữ" value="female" />
            <el-option label="Khác" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="Nhóm khách hàng">
          <el-select
            v-model="form.customer_group_id"
            placeholder="Chọn nhóm khách hàng"
          >
            <el-option
              v-for="group in customerGroups"
              :key="group.id"
              :label="group.name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Tỉnh/Thành phố">
          <el-select v-model="form.city_id" placeholder="Chọn tỉnh/thành phố" clearable filterable>
            <el-option
              v-for="city in cities"
              :key="city.id"
              :label="city.name"
              :value="city.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawerVisible = false">Hủy</el-button>
        <el-button type="primary" @click="handleSave">Lưu</el-button>
      </template>
    </el-drawer>

    <!-- Customer Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      title="Chi tiết khách hàng"
      width="90%"
      :style="{ 'max-width': '800px' }"
    >
      <div v-if="selectedCustomer" class="customer-detail">
        <div class="detail-header">
          <el-avatar :size="80" class="detail-avatar">{{
            selectedCustomer.full_name.charAt(0)
          }}</el-avatar>
          <div class="detail-info">
            <h2>{{ selectedCustomer.full_name }}</h2>
            <p class="customer-code">{{ selectedCustomer.code }}</p>
            <el-tag
              :type="
                selectedCustomer.group_name === 'Khách VIP' ? 'warning' : 'info'
              "
            >
              {{ selectedCustomer.group_name }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <div class="detail-content">
          <el-row :gutter="24">
            <el-col :xs="24" :md="12">
              <div class="info-section">
                <h4>Thông tin cơ bản</h4>
                <div class="info-item">
                  <label>Số điện thoại:</label>
                  <span>{{ selectedCustomer.phone }}</span>
                </div>
                <div class="info-item">
                  <label>Email:</label>
                  <span>{{ selectedCustomer.email }}</span>
                </div>
                <div class="info-item">
                  <label>Địa chỉ:</label>
                  <span>{{ selectedCustomer.address }}</span>
                </div>
                <div class="info-item">
                  <label>Tỉnh/Thành phố:</label>
                  <span>{{ selectedCustomer.city_name }}</span>
                </div>
                <div class="info-item">
                  <label>Ngày sinh:</label>
                  <span>{{
                    selectedCustomer.date_of_birth
                      ? new Date(
                          selectedCustomer.date_of_birth,
                        ).toLocaleDateString("vi-VN")
                      : "Chưa có"
                  }}</span>
                </div>
                <div class="info-item">
                  <label>Giới tính:</label>
                  <span>{{ genderMap[selectedCustomer.gender] || selectedCustomer.gender || 'Chưa có' }}</span>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :md="12">
              <div class="info-section">
                <h4>Thống kê mua hàng</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-value">
                      {{ selectedCustomer.total_orders }}
                    </div>
                    <div class="stat-label">Đơn hàng</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">
                      {{
                        formatCurrency(
                          parseFloat(selectedCustomer.total_spent || 0),
                        )
                      }}
                    </div>
                    <div class="stat-label">Tổng chi tiêu</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">
                      {{ selectedCustomer.discount_percentage }}%
                    </div>
                    <div class="stat-label">Chiết khấu</div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-divider />

          <div class="recent-orders">
            <h4>Gần đây nhất</h4>
            <el-table
              :data="selectedCustomer.recent_orders || []"
              style="width: 100%"
            >
              <el-table-column prop="order_code" label="Mã đơn" width="150" />
              <el-table-column label="Ngày" width="120">
                <template #default="scope">
                  {{
                    new Date(scope.row.created_at).toLocaleDateString("vi-VN")
                  }}
                </template>
              </el-table-column>
              <el-table-column label="Trạng thái" width="120">
                <template #default="scope">
                  <el-tag
                    :type="
                      scope.row.status === 'completed'
                        ? 'success'
                        : scope.row.status === 'pending'
                        ? 'warning'
                        : 'danger'
                    "
                    size="small"
                  >
                    {{
                      scope.row.status === "completed"
                        ? "Hoàn thành"
                        : scope.row.status === "pending"
                        ? "Chờ xử lý"
                        : "Hủy"
                    }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Thanh toán" width="120">
                <template #default="scope">
                  <el-tag
                    :type="
                      scope.row.payment_status === 'paid'
                        ? 'success'
                        : 'warning'
                    "
                    size="small"
                  >
                    {{
                      scope.row.payment_status === "paid"
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"
                    }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Số tiền" align="right">
                <template #default="scope">
                  <span class="total-spent">{{
                    formatCurrency(parseFloat(scope.row.final_amount))
                  }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">Đóng</el-button>
          <el-button type="primary" @click="openDrawer(selectedCustomer)"
            >Chỉnh sửa</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from "vue";
import {
  Search,
  Plus,
  Edit,
  Delete,
  ArrowDown,
  PriceTag,
  View,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import customerService from "@/services/customerService";

// --- RESPONSIVE STATE ---
const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// --- COMPONENT LOGIC ---
const search = ref("");
const currentPage = ref(1);
const pageSize = 10;
const selectedGroup = ref(null);
const loading = ref(false);
const customers = ref([]);
const totalCustomers = ref(0);
const customerGroups = ref([]);
const cities = ref([]);
const selectedCustomer = ref(null);
const detailDialogVisible = ref(false);

// --- FORM STATE & DRAWER ---
const drawerVisible = ref(false);
const isEditMode = ref(false);
const form = reactive({
  id: null,
  code: "",
  full_name: "",
  phone: "",
  email: "",
  address: "",
  date_of_birth: "",
  gender: null,
  customer_group_id: null,
  city_id: null,
});

const genderMap = { male: 'Nam', female: 'Nữ', other: 'Khác' };

const formatCurrency = (value) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

// API methods
const fetchCustomers = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: pageSize,
      search: search.value,
      groupId: selectedGroup.value,
    };
    const response = await customerService.getCustomers(params);
    if (response.success) {
      customers.value = response.data.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.full_name,
        phone: item.phone,
        email: item.email,
        group: item.group_name,
        totalSpent: parseFloat(item.total_lifetime_value || 0),
        avatarUrl: "",
        address: item.address,
        date_of_birth: item.date_of_birth,
        gender: item.gender,
        city_name: item.city_name,
        discount_percentage: item.discount_percentage,
      }));
      totalCustomers.value = response.pagination.total;
    }
  } catch (error) {
    ElMessage.error("Không thể tải danh sách khách hàng");
  } finally {
    loading.value = false;
  }
};

const fetchCustomerGroups = async () => {
  try {
    const response = await customerService.getCustomerGroups();
    if (response.success) {
      customerGroups.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching customer groups:", error);
  }
};

const fetchCities = async () => {
  try {
    const response = await customerService.getCities();
    if (response.success) {
      cities.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching cities:", error);
  }
};

const fetchCustomerDetail = async (id) => {
  try {
    loading.value = true;
    const response = await customerService.getCustomerById(id);
    if (response.success) {
      selectedCustomer.value = response.data;
      detailDialogVisible.value = true;
    }
  } catch (error) {
    ElMessage.error("Không thể tải thông tin khách hàng");
  } finally {
    loading.value = false;
  }
};

// Computed properties
const pagedCustomers = computed(() => {
  return customers.value;
});

const selectedGroupName = computed(() => {
  if (!selectedGroup.value) return null;
  const group = customerGroups.value.find((g) => g.id === selectedGroup.value);
  return group ? group.name : null;
});

const onSearch = () => {
  currentPage.value = 1;
  fetchCustomers();
};

const handleGroupFilter = (groupId) => {
  selectedGroup.value = groupId; // null hoặc group id
  currentPage.value = 1;
  fetchCustomers();
};

// --- CRUD FUNCTIONS ---
const openDrawer = (customer = null) => {
  if (customer) {
    isEditMode.value = true;
    // Check if customer is from detail (selectedCustomer) or from list
    const customerData = customer.full_name
      ? customer
      : {
          id: customer.id,
          code: customer.code,
          full_name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          date_of_birth: customer.date_of_birth,
          gender: customer.gender,
          customer_group_id: customer.customer_group_id,
          city_id: customer.city_id,
        };

    Object.assign(form, {
      id: customerData.id,
      code: customerData.code,
      full_name: customerData.full_name,
      phone: customerData.phone,
      email: customerData.email,
      address: customerData.address,
      date_of_birth: customerData.date_of_birth
        ? customerData.date_of_birth.split("T")[0]
        : "",
      gender: customerData.gender,
      customer_group_id: customerData.customer_group_id,
      city_id: customerData.city_id,
    });
  } else {
    isEditMode.value = false;
    Object.assign(form, {
      id: null,
      code: "",
      full_name: "",
      phone: "",
      email: "",
      address: "",
      date_of_birth: "",
      gender: null,
      customer_group_id: null,
      city_id: null,
    });
  }
  drawerVisible.value = true;
};

const handleSave = async () => {
  if (!form.full_name || !form.phone) {
    ElMessage.error("Vui lòng nhập Tên và Số điện thoại.");
    return;
  }

  try {
    loading.value = true;
    if (isEditMode.value) {
      const response = await customerService.updateCustomer(form.id, form);
      if (response.success) {
        ElMessage.success("Cập nhật khách hàng thành công!");
        drawerVisible.value = false;
        fetchCustomers();
      }
    } else {
      const response = await customerService.createCustomer(form);
      if (response.success) {
        ElMessage.success("Thêm khách hàng thành công!");
        drawerVisible.value = false;
        fetchCustomers();
      }
    }
  } catch (error) {
    ElMessage.error(
      isEditMode.value
        ? "Không thể cập nhật khách hàng"
        : "Không thể thêm khách hàng",
    );
  } finally {
    loading.value = false;
  }
};

const handleDelete = (customer) => {
  ElMessageBox.confirm(
    `Bạn có chắc muốn xóa khách hàng "${customer.name}" không?`,
    "Xác nhận xóa",
    {
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        const response = await customerService.deleteCustomer(customer.id);
        if (response.success) {
          ElMessage.success("Xóa khách hàng thành công");
          fetchCustomers();
        }
      } catch (error) {
        ElMessage.error("Không thể xóa khách hàng");
      }
    })
    .catch(() => {});
};

// Watchers
watch(currentPage, () => {
  fetchCustomers();
});

// Initialize data
onMounted(async () => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  await Promise.all([fetchCustomers(), fetchCustomerGroups(), fetchCities()]);
});
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
.customer-code {
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 400;
}
.total-spent {
  font-weight: 500;
  color: #166534; /* Green for money */
}

/* Customer detail dialog styles (FIX: bỏ nesting SCSS) */
.customer-detail .detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.customer-detail .detail-header .detail-avatar {
  flex-shrink: 0;
}
.customer-detail .detail-header .detail-info h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
}
.customer-detail .detail-header .customer-code {
  margin: 4px 0 8px 0;
}

.customer-detail .detail-content .info-section {
  margin-bottom: 20px;
}
.customer-detail .detail-content .info-section h4 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}
.customer-detail .detail-content .info-section .info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}
.customer-detail .detail-content .info-section .info-item label {
  font-weight: 500;
  color: #6b7280;
  min-width: 120px;
}
.customer-detail .detail-content .info-section .info-item span {
  color: #111827;
  text-align: right;
}

.customer-detail .detail-content .info-section .stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}
.customer-detail .detail-content .info-section .stats-grid .stat-item {
  text-align: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.customer-detail
  .detail-content
  .info-section
  .stats-grid
  .stat-item
  .stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}
.customer-detail
  .detail-content
  .info-section
  .stats-grid
  .stat-item
  .stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.customer-detail .detail-content .recent-orders h4 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

/* Mobile responsive for customer detail */
@media (max-width: 768px) {
  .customer-detail .detail-header {
    flex-direction: column;
    text-align: center;
  }
  .customer-detail .detail-header .detail-info h2 {
    font-size: 1.25rem;
  }

  .customer-detail .detail-content .info-section .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .customer-detail .detail-content .info-section .info-item span {
    text-align: left;
  }
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
