<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Sổ quỹ</h1>
      <div class="action-buttons-group">
        <el-button :icon="Download" @click="exportData">Xuất file</el-button>
        <el-button type="primary" :icon="Plus" @click="openDrawer()">
          Thêm giao dịch
        </el-button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-card">
      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="-"
        start-placeholder="Từ ngày"
        end-placeholder="Đến ngày"
        value-format="YYYY-MM-DD"
        style="width: 280px"
      />
      <el-select
        v-model="filters.type"
        placeholder="Loại giao dịch"
        clearable
        style="width: 150px"
      >
        <el-option label="Tất cả" value="" />
        <el-option label="Phiếu thu" value="thu" />
        <el-option label="Phiếu chi" value="chi" />
      </el-select>
      <el-select
        v-model="filters.status"
        placeholder="Trạng thái"
        clearable
        style="width: 150px"
      >
        <el-option label="Tất cả" value="" />
        <el-option label="Chờ duyệt" value="pending" />
        <el-option label="Đã duyệt" value="approved" />
        <el-option label="Từ chối" value="rejected" />
        <el-option label="Đã huỷ" value="cancelled" />
      </el-select>
      <el-select
        v-model="filters.store_id"
        placeholder="Cửa hàng"
        clearable
        style="width: 180px"
      >
        <el-option label="Tất cả" value="" />
        <el-option
          v-for="s in stores"
          :key="s.id"
          :label="s.name"
          :value="s.id"
        />
      </el-select>
      <el-button type="primary" :icon="Search" @click="handleSearch"
        >Tìm kiếm</el-button
      >
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon income-icon">
          <i class="fa-solid fa-arrow-down"></i>
        </div>
        <div>
          <div class="stat-title">Tổng thu trong kỳ</div>
          <div class="stat-value income">
            {{ formatCurrency(summary.totalIncome) }}
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon expense-icon">
          <i class="fa-solid fa-arrow-up"></i>
        </div>
        <div>
          <div class="stat-title">Tổng chi trong kỳ</div>
          <div class="stat-value expense">
            {{ formatCurrency(summary.totalExpense) }}
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon net-icon">
          <i class="fa-solid fa-scale-balanced"></i>
        </div>
        <div>
          <div class="stat-title">Chênh lệch</div>
          <div
            class="stat-value"
            :class="summary.netAmount >= 0 ? 'income' : 'expense'"
          >
            {{ formatCurrency(summary.netAmount) }}
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending-icon">
          <i class="fa-solid fa-clock"></i>
        </div>
        <div>
          <div class="stat-title">Chờ duyệt</div>
          <div class="stat-value pending-text">
            {{ summary.pendingCount }} phiếu
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <el-table
        v-if="!isMobile"
        :data="transactions"
        v-loading="isLoading"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column type="index" label="STT" width="55" />
        <el-table-column
          prop="date_key"
          label="Ngày"
          width="110"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatDate(row.date_key) }}
          </template>
        </el-table-column>
        <el-table-column prop="transaction_code" label="Mã phiếu" width="160" />
        <el-table-column label="Loại" width="130" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.transaction_type === 'thu' ? 'success' : 'danger'"
              size="small"
            >
              {{ row.type_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="Diễn giải"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="recipient_name"
          label="Đối tượng"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="payment_method_name"
          label="Phương thức"
          width="140"
        />
        <el-table-column
          label="Số tiền"
          width="150"
          align="right"
          sortable="custom"
          prop="amount"
        >
          <template #default="{ row }">
            <span
              :class="row.transaction_type === 'thu' ? 'income' : 'expense'"
              class="font-semibold"
            >
              {{ row.transaction_type === "thu" ? "+" : "-"
              }}{{ formatCurrency(row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="statusTagType(row.status)"
              size="small"
              effect="light"
            >
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_by_name" label="Người tạo" width="130" />
        <el-table-column
          prop="store_name"
          label="Cửa hàng"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          label="Thao tác"
          width="160"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip content="Xem chi tiết" placement="top">
                <el-button
                  size="small"
                  :icon="View"
                  circle
                  @click="viewDetail(row)"
                />
              </el-tooltip>
              <el-tooltip
                v-if="row.status === 'pending'"
                content="Duyệt"
                placement="top"
              >
                <el-button
                  size="small"
                  :icon="Check"
                  type="success"
                  circle
                  plain
                  @click="handleApprove(row)"
                />
              </el-tooltip>
              <el-tooltip
                v-if="row.status === 'pending'"
                content="Sửa"
                placement="top"
              >
                <el-button
                  size="small"
                  :icon="Edit"
                  circle
                  @click="openDrawer(row)"
                />
              </el-tooltip>
              <el-tooltip content="Xóa" placement="top">
                <el-button
                  size="small"
                  :icon="Delete"
                  type="danger"
                  circle
                  plain
                  @click="handleDelete(row)"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <template #append>
          <div v-if="transactions.length > 0" class="table-footer-summary">
            <div class="summary-item">
              <span>Tổng thu:</span>
              <strong class="income">{{
                formatCurrency(summary.totalIncome)
              }}</strong>
            </div>
            <div class="summary-item">
              <span>Tổng chi:</span>
              <strong class="expense">{{
                formatCurrency(summary.totalExpense)
              }}</strong>
            </div>
            <div class="summary-item">
              <span>Chênh lệch:</span>
              <strong :class="summary.netAmount >= 0 ? 'income' : 'expense'">
                {{ formatCurrency(summary.netAmount) }}
              </strong>
            </div>
          </div>
        </template>
      </el-table>

      <!-- Mobile Cards -->
      <div v-if="isMobile && !isLoading" class="mobile-card-list">
        <div v-for="item in transactions" :key="item.id" class="mobile-card">
          <div class="card-header">
            <span class="card-title">{{ item.transaction_code }}</span>
            <el-tag
              :type="item.transaction_type === 'thu' ? 'success' : 'danger'"
              size="small"
            >
              {{ item.type_name }}
            </el-tag>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Số tiền:</span>
              <span
                class="card-value"
                :class="item.transaction_type === 'thu' ? 'income' : 'expense'"
              >
                {{ item.transaction_type === "thu" ? "+" : "-"
                }}{{ formatCurrency(item.amount) }}
              </span>
            </div>
            <div class="card-row">
              <span class="card-label">Diễn giải:</span>
              <span class="card-value">{{ item.description || "-" }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Ngày:</span>
              <span class="card-value">{{ formatDate(item.date_key) }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Trạng thái:</span>
              <el-tag :type="statusTagType(item.status)" size="small">{{
                statusLabel(item.status)
              }}</el-tag>
            </div>
            <div class="card-row">
              <span class="card-label">Người tạo:</span>
              <span class="card-value">{{ item.created_by_name }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button size="small" text :icon="View" @click="viewDetail(item)"
              >Xem</el-button
            >
            <el-button
              v-if="item.status === 'pending'"
              size="small"
              text
              type="success"
              :icon="Check"
              @click="handleApprove(item)"
              >Duyệt</el-button
            >
            <el-button
              v-if="item.status === 'pending'"
              size="small"
              text
              :icon="Edit"
              @click="openDrawer(item)"
              >Sửa</el-button
            >
            <el-button
              size="small"
              text
              type="danger"
              :icon="Delete"
              @click="handleDelete(item)"
              >Xóa</el-button
            >
          </div>
        </div>
      </div>

      <el-empty
        v-if="!isLoading && transactions.length === 0"
        description="Không có giao dịch nào"
      />
    </div>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination
        v-if="pagination.total > 0"
        :small="isMobile"
        background
        layout="total, sizes, prev, pager, next"
        :total="pagination.total"
        :page-size="pagination.limit"
        :page-sizes="[10, 20, 50, 100]"
        v-model:current-page="pagination.page"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- Create/Edit Drawer -->
    <el-drawer
      v-model="drawerVisible"
      :title="isEditMode ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'"
      direction="rtl"
      :size="drawerSize"
      @closed="resetForm"
    >
      <el-form
        :model="form"
        label-position="top"
        ref="formRef"
        :rules="formRules"
      >
        <el-form-item label="Loại giao dịch" prop="cashbook_type">
          <el-radio-group
            v-model="form.direction"
            @change="handleDirectionChange"
          >
            <el-radio-button label="thu">Phiếu thu</el-radio-button>
            <el-radio-button label="chi">Phiếu chi</el-radio-button>
          </el-radio-group>
          <el-select
            v-model="form.cashbook_type"
            placeholder="Chọn loại cụ thể"
            class="mt-3"
            style="width: 100%"
          >
            <el-option
              v-for="t in filteredCashbookTypes"
              :key="t.id"
              :label="t.name"
              :value="t.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Cửa hàng" prop="store_id">
          <el-select
            v-model="form.store_id"
            placeholder="Chọn cửa hàng"
            style="width: 100%"
          >
            <el-option
              v-for="s in stores"
              :key="s.id"
              :label="s.name"
              :value="s.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Số tiền" prop="amount">
          <el-input
            v-model="formattedAmount"
            type="text"
            placeholder="Nhập số tiền"
            clearable
          >
            <template #suffix>đ</template>
          </el-input>
        </el-form-item>

        <el-form-item label="Ngày giao dịch" prop="date_key">
          <el-date-picker
            v-model="form.date_key"
            type="date"
            placeholder="Chọn ngày"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Phương thức thanh toán" prop="payment_method">
          <el-select
            v-model="form.payment_method"
            placeholder="Chọn phương thức"
            style="width: 100%"
          >
            <el-option
              v-for="pm in paymentMethods"
              :key="pm.id"
              :label="pm.name"
              :value="pm.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Đối tượng nhận/chi">
          <el-input
            v-model="form.recipient_name"
            placeholder="Tên người nhận/chi"
          />
        </el-form-item>

        <el-form-item label="SĐT đối tượng">
          <el-input
            v-model="form.recipient_phone"
            placeholder="Số điện thoại (tuỳ chọn)"
          />
        </el-form-item>

        <el-form-item label="Diễn giải" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="VD: Thu tiền hàng, Chi mua văn phòng phẩm..."
          />
        </el-form-item>

        <el-form-item label="Ghi chú">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="2"
            placeholder="Ghi chú thêm..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="drawerVisible = false">Hủy</el-button>
        <el-button type="primary" @click="handleSave" :loading="isSaving">
          {{ isEditMode ? "Cập nhật" : "Tạo phiếu" }}
        </el-button>
      </template>
    </el-drawer>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="Chi tiết giao dịch" width="550px">
      <div v-if="detailData" class="detail-content">
        <div class="detail-row">
          <span class="detail-label">Mã phiếu:</span>
          <span class="detail-value font-semibold">{{
            detailData.transaction_code
          }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Loại:</span>
          <el-tag
            :type="detailData.transaction_type === 'thu' ? 'success' : 'danger'"
            size="small"
          >
            {{ detailData.type_name }}
          </el-tag>
        </div>
        <div class="detail-row">
          <span class="detail-label">Số tiền:</span>
          <span
            class="detail-value font-semibold"
            :class="
              detailData.transaction_type === 'thu' ? 'income' : 'expense'
            "
          >
            {{ formatCurrency(detailData.amount) }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Trạng thái:</span>
          <el-tag :type="statusTagType(detailData.status)" size="small">{{
            statusLabel(detailData.status)
          }}</el-tag>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ngày:</span>
          <span class="detail-value">{{
            formatDate(detailData.date_key)
          }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Cửa hàng:</span>
          <span class="detail-value">{{ detailData.store_name }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phương thức:</span>
          <span class="detail-value">{{
            detailData.payment_method_name || "-"
          }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Đối tượng:</span>
          <span class="detail-value">{{
            detailData.recipient_name || "-"
          }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Diễn giải:</span>
          <span class="detail-value">{{ detailData.description || "-" }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ghi chú:</span>
          <span class="detail-value">{{ detailData.notes || "-" }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Người tạo:</span>
          <span class="detail-value">{{ detailData.created_by_name }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ngày tạo:</span>
          <span class="detail-value">{{
            formatDateTime(detailData.created_at)
          }}</span>
        </div>
        <div v-if="detailData.approved_by_name" class="detail-row">
          <span class="detail-label">Người duyệt:</span>
          <span class="detail-value">{{ detailData.approved_by_name }}</span>
        </div>
        <div v-if="detailData.approved_at" class="detail-row">
          <span class="detail-label">Ngày duyệt:</span>
          <span class="detail-value">{{
            formatDateTime(detailData.approved_at)
          }}</span>
        </div>
      </div>
      <template #footer>
        <div class="detail-dialog-footer">
          <el-button
            v-if="detailData?.status === 'pending'"
            type="success"
            @click="
              handleApprove(detailData);
              detailVisible = false;
            "
          >
            Duyệt
          </el-button>
          <el-button
            v-if="detailData?.status === 'pending'"
            type="warning"
            @click="
              handleReject(detailData);
              detailVisible = false;
            "
          >
            Từ chối
          </el-button>
          <el-button @click="detailVisible = false">Đóng</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from "vue";
import {
  Search,
  Plus,
  Download,
  Edit,
  Delete,
  View,
  Check,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import cashbookService from "@/services/cashbookService";
import apiClient from "@/services/apiClient";

// ===== RESPONSIVE =====
const isMobile = ref(window.innerWidth < 768);
const drawerSize = computed(() => (isMobile.value ? "95%" : "520px"));
const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
};

// ===== STATE =====
const isLoading = ref(false);
const isSaving = ref(false);
const transactions = ref([]);
const stores = ref([]);
const cashbookTypes = ref([]);
const paymentMethods = ref([]);
const drawerVisible = ref(false);
const detailVisible = ref(false);
const isEditMode = ref(false);
const detailData = ref(null);
const formRef = ref(null);

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

const filters = reactive({
  dateRange: null,
  type: "",
  status: "",
  store_id: "",
});

const sortConfig = reactive({
  sortBy: "created_at",
  order: "DESC",
});

const summary = reactive({
  totalIncome: 0,
  totalExpense: 0,
  netAmount: 0,
  pendingCount: 0,
});

const defaultForm = {
  id: null,
  direction: "thu",
  cashbook_type: "SALES_INCOME",
  store_id: null,
  amount: null,
  date_key: new Date().toISOString().split("T")[0],
  payment_method: "CASH",
  description: "",
  recipient_name: "",
  recipient_phone: "",
  notes: "",
};

const form = reactive({ ...defaultForm });

const formRules = {
  cashbook_type: [
    {
      required: true,
      message: "Vui lòng chọn loại giao dịch",
      trigger: "change",
    },
  ],
  store_id: [
    { required: true, message: "Vui lòng chọn cửa hàng", trigger: "change" },
  ],
  amount: [
    { required: true, message: "Vui lòng nhập số tiền", trigger: "blur" },
  ],
  description: [
    { required: true, message: "Vui lòng nhập diễn giải", trigger: "blur" },
  ],
};

// ===== FORMAT AMOUNT INPUT =====
const formattedAmount = computed({
  get() {
    if (form.amount === null || form.amount === undefined) return "";
    return form.amount.toLocaleString("vi-VN");
  },
  set(newValue) {
    const numericValue = newValue.replace(/[^0-9]/g, "");
    form.amount = numericValue === "" ? null : parseInt(numericValue, 10);
  },
});

// ===== COMPUTED =====
const filteredCashbookTypes = computed(() => {
  const dir = form.direction === "thu" ? 1 : -1;
  return cashbookTypes.value.filter((t) => t.transaction_direction === dir);
});

// ===== HELPERS =====
const formatCurrency = (value) => {
  return (value || 0).toLocaleString("vi-VN") + "đ";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN");
};

const statusTagType = (status) => {
  const map = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
    cancelled: "info",
  };
  return map[status] || "info";
};

const statusLabel = (status) => {
  const map = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
    cancelled: "Đã huỷ",
  };
  return map[status] || status;
};

// ===== API CALLS =====
const loadTransactions = async () => {
  try {
    isLoading.value = true;
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: sortConfig.sortBy,
      order: sortConfig.order,
    };

    if (filters.dateRange && filters.dateRange.length === 2) {
      params.from = filters.dateRange[0];
      params.to = filters.dateRange[1];
    }
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;
    if (filters.store_id) params.store_id = filters.store_id;

    const res = await cashbookService.getTransactions(params);
    if (res.success) {
      transactions.value = res.data;
      pagination.total = res.pagination.total;
      pagination.totalPages = res.pagination.totalPages;
    }
  } catch (error) {
    console.error("Load transactions error:", error);
    ElMessage.error("Lỗi tải danh sách giao dịch");
  } finally {
    isLoading.value = false;
  }
};

const loadSummary = async () => {
  try {
    const params = {};
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.from = filters.dateRange[0];
      params.to = filters.dateRange[1];
    }
    if (filters.store_id) params.store_id = filters.store_id;

    const res = await cashbookService.getSummary(params);
    if (res.success) {
      summary.totalIncome = parseFloat(res.data.totals.total_income) || 0;
      summary.totalExpense = parseFloat(res.data.totals.total_expense) || 0;
      summary.netAmount = parseFloat(res.data.totals.net_amount) || 0;

      // Count pending from by_store data
      let pending = 0;
      (res.data.by_store || []).forEach((s) => {
        pending += parseInt(s.pending_count) || 0;
      });
      summary.pendingCount = pending;
    }
  } catch (error) {
    console.error("Load summary error:", error);
  }
};

const loadMetadata = async () => {
  try {
    const [typesRes, methodsRes, storesRes] = await Promise.all([
      cashbookService.getCashbookTypes(),
      cashbookService.getPaymentMethods(),
      apiClient.get("/api/stores").then((r) => r.data),
    ]);

    if (typesRes.success) cashbookTypes.value = typesRes.data;
    if (methodsRes.success) paymentMethods.value = methodsRes.data;
    if (storesRes.success !== false) stores.value = storesRes.data || storesRes;
  } catch (error) {
    console.error("Load metadata error:", error);
  }
};

// ===== HANDLERS =====
const handleSearch = () => {
  pagination.page = 1;
  loadTransactions();
  loadSummary();
};

const handlePageChange = (page) => {
  pagination.page = page;
  loadTransactions();
};

const handleSizeChange = (size) => {
  pagination.limit = size;
  pagination.page = 1;
  loadTransactions();
};

const handleSortChange = ({ prop, order }) => {
  if (prop) {
    sortConfig.sortBy = prop;
    sortConfig.order = order === "ascending" ? "ASC" : "DESC";
  } else {
    sortConfig.sortBy = "created_at";
    sortConfig.order = "DESC";
  }
  loadTransactions();
};

const handleDirectionChange = (dir) => {
  const types = cashbookTypes.value.filter(
    (t) => t.transaction_direction === (dir === "thu" ? 1 : -1),
  );
  if (types.length > 0) {
    form.cashbook_type = types[0].code;
  }
};

const openDrawer = (transaction = null) => {
  if (transaction && transaction.id) {
    isEditMode.value = true;
    Object.assign(form, {
      id: transaction.id,
      direction:
        transaction.transaction_type ||
        (transaction.transaction_direction === 1 ? "thu" : "chi"),
      cashbook_type: transaction.type_code || "",
      store_id: transaction.store_id,
      amount: parseFloat(transaction.amount),
      date_key: transaction.date_key,
      payment_method: transaction.payment_method_code || "CASH",
      description: transaction.description || "",
      recipient_name: transaction.recipient_name || "",
      recipient_phone: transaction.recipient_phone || "",
      notes: transaction.notes || "",
    });
  } else {
    isEditMode.value = false;
    resetForm();
  }
  drawerVisible.value = true;
};

const resetForm = () => {
  Object.assign(form, {
    ...defaultForm,
    store_id: stores.value.length > 0 ? stores.value[0].id : null,
    date_key: new Date().toISOString().split("T")[0],
  });
  formRef.value?.clearValidate();
};

const handleSave = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  if (!form.amount || form.amount <= 0) {
    ElMessage.error("Vui lòng nhập số tiền hợp lệ");
    return;
  }

  try {
    isSaving.value = true;
    const payload = {
      store_id: form.store_id,
      cashbook_type: form.cashbook_type,
      payment_method: form.payment_method,
      amount: form.amount,
      date_key: form.date_key,
      description: form.description,
      recipient_name: form.recipient_name || null,
      recipient_phone: form.recipient_phone || null,
      notes: form.notes || null,
    };

    let res;
    if (isEditMode.value) {
      res = await cashbookService.updateTransaction(form.id, payload);
    } else {
      res = await cashbookService.createTransaction(payload);
    }

    if (res.success) {
      ElMessage.success(res.message || "Lưu giao dịch thành công!");
      drawerVisible.value = false;
      loadTransactions();
      loadSummary();
    } else {
      ElMessage.error(res.message || "Lỗi lưu giao dịch");
    }
  } catch (error) {
    console.error("Save transaction error:", error);
    ElMessage.error(error.response?.data?.message || "Lỗi lưu giao dịch");
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = (transaction) => {
  ElMessageBox.confirm(
    `Bạn có chắc muốn xóa phiếu "${transaction.transaction_code}"?`,
    "Xác nhận xóa",
    { confirmButtonText: "Đồng ý", cancelButtonText: "Hủy", type: "warning" },
  )
    .then(async () => {
      try {
        const res = await cashbookService.deleteTransaction(transaction.id);
        if (res.success) {
          ElMessage.success(res.message || "Xóa thành công");
          loadTransactions();
          loadSummary();
        } else {
          ElMessage.error(res.message || "Lỗi xóa giao dịch");
        }
      } catch (error) {
        ElMessage.error(error.response?.data?.message || "Lỗi xóa giao dịch");
      }
    })
    .catch(() => {});
};

const handleApprove = (transaction) => {
  ElMessageBox.confirm(
    `Duyệt phiếu "${transaction.transaction_code}"?`,
    "Xác nhận duyệt",
    { confirmButtonText: "Duyệt", cancelButtonText: "Hủy", type: "success" },
  )
    .then(async () => {
      try {
        const res = await cashbookService.approveTransaction(
          transaction.id,
          "approve",
        );
        if (res.success) {
          ElMessage.success(res.message || "Duyệt thành công");
          loadTransactions();
          loadSummary();
        }
      } catch (error) {
        ElMessage.error(error.response?.data?.message || "Lỗi duyệt giao dịch");
      }
    })
    .catch(() => {});
};

const handleReject = (transaction) => {
  ElMessageBox.confirm(
    `Từ chối phiếu "${transaction.transaction_code}"?`,
    "Xác nhận từ chối",
    { confirmButtonText: "Từ chối", cancelButtonText: "Hủy", type: "warning" },
  )
    .then(async () => {
      try {
        const res = await cashbookService.approveTransaction(
          transaction.id,
          "reject",
        );
        if (res.success) {
          ElMessage.success(res.message || "Đã từ chối");
          loadTransactions();
          loadSummary();
        }
      } catch (error) {
        ElMessage.error(
          error.response?.data?.message || "Lỗi từ chối giao dịch",
        );
      }
    })
    .catch(() => {});
};

const viewDetail = async (transaction) => {
  try {
    const res = await cashbookService.getTransactionById(transaction.id);
    if (res.success) {
      detailData.value = res.data;
      detailVisible.value = true;
    }
  } catch (error) {
    ElMessage.error("Lỗi tải chi tiết giao dịch");
  }
};

const exportData = () => {
  ElMessage.info("Chức năng xuất file đang phát triển");
};

// ===== LIFECYCLE =====
onMounted(async () => {
  window.addEventListener("resize", handleResize);
  await loadMetadata();
  if (stores.value.length > 0 && !form.store_id) {
    form.store_id = stores.value[0].id;
  }
  await Promise.all([loadTransactions(), loadSummary()]);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
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
.action-buttons-group {
  display: flex;
  gap: 12px;
}

/* ----- FILTER ----- */
.filter-card {
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ----- STATS GRID ----- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.income-icon {
  background: #dcfce7;
  color: #16a34a;
}
.expense-icon {
  background: #fee2e2;
  color: #dc2626;
}
.net-icon {
  background: #dbeafe;
  color: #2563eb;
}
.pending-icon {
  background: #fef3c7;
  color: #d97706;
}
.stat-title {
  color: #6b7280;
  font-size: 0.85rem;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
}
.income {
  color: #16a34a;
}
.expense {
  color: #dc2626;
}
.pending-text {
  color: #d97706;
}
.font-semibold {
  font-weight: 600;
}

/* ----- TABLE ----- */
.table-container {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}
.table-footer-summary {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 20px 40px;
  padding: 16px;
  font-size: 0.95rem;
  background-color: #f8fafc;
}
.summary-item span {
  color: #6b7280;
}
.summary-item strong {
  color: #111827;
}

/* ----- PAGINATION ----- */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* ----- DETAIL DIALOG ----- */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-label {
  color: #6b7280;
  min-width: 120px;
  font-size: 0.9rem;
  flex-shrink: 0;
}
.detail-value {
  color: #111827;
  font-size: 0.95rem;
}
.detail-dialog-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* ----- MOBILE CARDS ----- */
.mobile-card-list {
  padding: 0;
}
.mobile-card {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  overflow: hidden;
}
.mobile-card:last-child {
  border-bottom: none;
}
.card-header {
  padding: 12px 16px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-title {
  color: #111827;
}
.card-body {
  padding: 8px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.card-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  font-size: 0.9rem;
}
.card-label {
  color: #6b7280;
  flex-shrink: 0;
}
.card-value {
  color: #111827;
  font-weight: 500;
  text-align: right;
  word-break: break-word;
}
.card-footer {
  padding: 4px 8px;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

/* ----- FORM HELPERS ----- */
.mt-3 {
  margin-top: 12px;
}

/* ----- ELEMENT PLUS CUSTOMIZATION ----- */
.page-container :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}
.page-container :deep(.el-input__wrapper),
.page-container :deep(.el-select__wrapper) {
  border-radius: 6px;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
}

/* ----- DESKTOP OVERRIDES (>= 768px) ----- */
@media (min-width: 768px) {
  .page-container {
    padding: 24px 32px;
  }
  .page-title {
    font-size: 1.75rem;
  }
  .filter-card {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
  .pagination-container {
    justify-content: flex-end;
  }
  .page-container :deep(.el-button--primary) {
    background-color: #2563eb;
    border-color: #2563eb;
  }
  .page-container :deep(.el-table th) {
    background-color: #f9fafb !important;
    color: #6b7280;
    font-weight: 600;
  }
  .page-container :deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid #f3f4f6;
    padding: 12px 0;
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
