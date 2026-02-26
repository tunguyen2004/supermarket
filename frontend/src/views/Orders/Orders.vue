<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Đơn hàng</h1>
      <el-button type="primary" :icon="Plus" @click="createOrder">
        Tạo đơn hàng
      </el-button>
    </div>

    <el-tabs v-model="activeTab" class="order-tabs">
      <el-tab-pane label="Tất cả" name="all"></el-tab-pane>
      <el-tab-pane label="Chờ xử lý" name="pending"></el-tab-pane>
      <el-tab-pane label="Hoàn thành" name="completed"></el-tab-pane>
      <el-tab-pane label="Đã hủy" name="cancelled"></el-tab-pane>
      <el-tab-pane label="Khách lẻ" name="walk_in"></el-tab-pane>
    </el-tabs>

    <div class="table-container">
      <div class="filters-bar">
        <el-input
          v-model="search"
          placeholder="Tìm theo mã đơn, tên hoặc SĐT khách..."
          clearable
          :prefix-icon="Search"
        />
        <el-date-picker
          v-if="!isMobile"
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="Từ ngày"
          end-placeholder="Đến ngày"
        />
      </div>

      <el-table
        v-if="!isMobile"
        :data="pagedOrders"
        v-loading="isLoading"
        style="width: 100%"
        :default-sort="{ prop: sortKey, order: sortDir === 'DESC' ? 'descending' : 'ascending' }"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="orderCode" label="Mã đơn hàng" width="140" sortable="custom" />
        <el-table-column label="Khách hàng" min-width="180">
          <template #default="scope">
            <div class="customer-cell">{{ scope.row.customerName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="orderDate" label="Ngày tạo" width="160" sortable="custom" />
        <el-table-column prop="createdBy" label="Người tạo" width="150" />
        <el-table-column label="Tổng tiền" width="150" align="right" prop="totalAmount" sortable="custom">
          <template #default="scope">
            <span class="total-amount">{{
              formatCurrency(scope.row.totalAmount)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Thanh toán" width="140" align="center">
          <template #default="scope">
            <el-tag
              :type="getPaymentStatusType(scope.row.paymentStatus)"
              size="small"
              >{{ scope.row.paymentStatus }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="Giao hàng" width="140" align="center">
          <template #default="scope">
            <el-tag
              :type="getFulfillmentStatusType(scope.row.fulfillmentStatus)"
              effect="light"
              size="small"
              >{{ scope.row.fulfillmentStatus }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="120" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="View"
                text
                bg
                @click="viewOrder(row)"
                >Xem</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="mobile-card-list">
        <div
          v-for="item in pagedOrders"
          :key="item.orderCode"
          class="mobile-card"
        >
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-title">{{ item.orderCode }}</span>
              <span class="card-subtitle">{{ item.customerName }}</span>
            </div>
            <span class="total-amount">{{
              formatCurrency(item.totalAmount)
            }}</span>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Ngày tạo</span>
              <span class="card-value">{{ item.orderDate }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Thanh toán</span>
              <span class="card-value"
                ><el-tag
                  :type="getPaymentStatusType(item.paymentStatus)"
                  size="small"
                  >{{ item.paymentStatus }}</el-tag
                ></span
              >
            </div>
            <div class="card-row">
              <span class="card-label">Giao hàng</span>
              <span class="card-value"
                ><el-tag
                  :type="getFulfillmentStatusType(item.fulfillmentStatus)"
                  effect="light"
                  size="small"
                  >{{ item.fulfillmentStatus }}</el-tag
                ></span
              >
            </div>
          </div>
          <div class="card-footer">
            <el-button
              size="small"
              :icon="View"
              text
              bg
              @click="viewOrder(item)"
              >Xem chi tiết</el-button
            >
          </div>
        </div>
      </div>

      <el-empty
        v-if="!isLoading && pagedOrders.length === 0"
        description="Không có đơn hàng nào phù hợp"
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

    <order-detail-modal
      v-if="selectedOrder"
      v-model="isModalVisible"
      :order="selectedOrder"
      @refresh="handleRefresh"
    />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { Search, Plus, View } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import OrderDetailModal from "@/components/OrderDetailModal.vue";
import orderService from "@/services/orderService";

const router = useRouter();

// --- STATE ---
const isMobile = ref(false);
const isLoading = ref(true);
const search = ref("");
const activeTab = ref("all");
const dateRange = ref("");
const currentPage = ref(1);
const pageSize = 10;
const totalItems = ref(0);
const orders = ref([]);
const sortKey = ref("created_at");
const sortDir = ref("DESC");
const isModalVisible = ref(false);
const selectedOrder = ref(null);

// --- LOGIC ---
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

// Fetch orders from API
const fetchOrders = async () => {
  try {
    isLoading.value = true;

    // Map tab name to API status values
    const statusMap = {
      pending: "pending",
      shipping: "shipping",
      completed: "completed",
      cancelled: "cancelled",
    };

    // Build date range params
    let fromDate, toDate;
    if (dateRange.value && dateRange.value.length === 2) {
      fromDate = new Date(dateRange.value[0]).toISOString().split("T")[0];
      toDate = new Date(dateRange.value[1]).toISOString().split("T")[0];
    }

    const params = {
      limit: pageSize,
      offset: (currentPage.value - 1) * pageSize,
      search: search.value || undefined,
      status:
        activeTab.value !== "all" && activeTab.value !== "walk_in"
          ? statusMap[activeTab.value]
          : undefined,
      customer_type: activeTab.value === "walk_in" ? "walk_in" : undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      sort: sortKey.value,
      order: sortDir.value,
    };

    const result = await orderService.getOrders(params);

    // Map API response to display format
    orders.value = result.data.map((order) => ({
      id: order.id,
      orderCode: order.order_code,
      customerName: order.customer?.name || "Khách lẻ",
      customerPhone: order.customer?.phone || "",
      orderDate: new Date(order.created_at || order.date).toLocaleString(
        "vi-VN",
      ),
      createdBy:
        typeof order.created_by === "string"
          ? order.created_by
          : order.created_by?.name || "N/A",
      totalAmount: order.amount?.total,
      paymentStatus:
        order.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán",
      fulfillmentStatus: mapStatusToVietnamese(order.status),
      paymentMethod: order.payment_method,
      items: order.items,
      notes: order.notes,
      store: order.store,
    }));

    totalItems.value = result.pagination?.total || 0;
  } catch (error) {
    console.error("Error fetching orders:", error);
    ElMessage.error("Không thể tải danh sách đơn hàng");
  } finally {
    isLoading.value = false;
  }
};

// Map API status to Vietnamese
const mapStatusToVietnamese = (status) => {
  const statusMap = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đã giao",
    delivered: "Hoàn thành",
    cancelled: "Đã hủy",
    // Legacy support
    shipping: "Đang giao",
    completed: "Hoàn thành",
  };
  return statusMap[status] || "Chờ xử lý";
};

const formatCurrency = (value) => value.toLocaleString("vi-VN") + "đ";
const getPaymentStatusType = (status) =>
  status === "Đã thanh toán" ? "success" : "warning";

const getFulfillmentStatusType = (status) => {
  if (status === "Hoàn thành") return "success";
  if (status === "Đã giao") return "success";
  if (status === "Đang giao" || status === "Đang xử lý") return "primary";
  if (status === "Chờ xử lý") return "warning";
  if (status === "Đã hủy") return "danger";
  return "info";
};

// Use server-side data directly (no client-side filtering)
const filteredOrders = computed(() => orders.value);
const pagedOrders = computed(() => orders.value);

// Watch filters and refetch from server
watch([activeTab, search, dateRange], () => {
  currentPage.value = 1;
  fetchOrders();
});

// Watch page change
watch(currentPage, () => {
  fetchOrders();
});

// Map frontend prop -> backend sort field
const propToSortField = {
  orderCode: "order_code",
  orderDate: "created_at",
  totalAmount: "final_amount",
};

const handleSortChange = ({ prop, order: dir }) => {
  if (!dir) {
    // Reset to default sort
    sortKey.value = "created_at";
    sortDir.value = "DESC";
  } else {
    sortKey.value = propToSortField[prop] || "created_at";
    sortDir.value = dir === "ascending" ? "ASC" : "DESC";
  }
  currentPage.value = 1;
  fetchOrders();
};

const createOrder = () => {
  router.push({ name: "NewOrder" });
};

const viewOrder = async (order) => {
  try {
    isLoading.value = true;
    // Gọi API chi tiết đơn hàng
    const result = await orderService.getOrderById(order.id);

    // Map dữ liệu chi tiết để hiển thị
    selectedOrder.value = {
      id: result.data.id,
      orderCode: result.data.order_code,
      customerName: result.data.customer?.name || "Khách lẻ",
      customerPhone: result.data.customer?.phone || "",
      customerEmail: result.data.customer?.email || "",
      orderDate: new Date(
        result.data.created_at || result.data.date,
      ).toLocaleString("vi-VN"),
      totalAmount: result.data.amount?.total || result.data.amount?.final || 0,
      subtotal: result.data.amount?.subtotal || 0,
      discount: result.data.amount?.discount || 0,
      tax: result.data.amount?.tax || 0,
      shipping: result.data.amount?.shipping || 0,
      paymentStatus:
        result.data.payment_status === "paid"
          ? "Đã thanh toán"
          : "Chưa thanh toán",
      fulfillmentStatus: mapStatusToVietnamese(result.data.status),
      paymentMethod: result.data.payment_method,
      shippingAddress: result.data.shipping_address,
      items: result.data.items || [],
      notes: result.data.notes || {},
      store:
        typeof result.data.store === "string"
          ? result.data.store
          : result.data.store?.name || "",
      createdBy:
        typeof result.data.created_by === "string"
          ? result.data.created_by
          : result.data.created_by?.name || "",
      createdAt: new Date(result.data.created_at).toLocaleString("vi-VN"),
      updatedAt: result.data.updated_at
        ? new Date(result.data.updated_at).toLocaleString("vi-VN")
        : null,
    };

    isModalVisible.value = true;
  } catch (error) {
    console.error("Error fetching order details:", error);
    ElMessage.error("Không thể tải chi tiết đơn hàng");
  } finally {
    isLoading.value = false;
  }
};

// Handle refresh after updating order
const handleRefresh = () => {
  fetchOrders();
};

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  fetchOrders();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});
</script>

<style scoped>
/* @import './responsive-style.css'; Sử dụng file CSS chung */

.total-amount {
  font-weight: 600;
  color: #1f2937;
}
.customer-cell {
  font-weight: 500;
}
.filters-bar {
  justify-content: space-between;
}
.order-tabs {
  margin-bottom: 1px; /* Cho tab nằm sát với table-container */
}
.order-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 20px;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  border: 1px solid #e5e7eb;
  border-bottom: none;
}

/* Ghi đè style của table-container để nó khớp với tab */
.table-container {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

/* Responsive cho Tabs */
@media (max-width: 767px) {
  .order-tabs :deep(.el-tabs__header) {
    padding: 0;
  }
  .order-tabs :deep(.el-tabs__nav) {
    width: 100%;
    display: flex;
  }
  .order-tabs :deep(.el-tabs__item) {
    flex: 1;
    text-align: center;
    padding: 0 5px; /* Giảm padding cho vừa màn hình mobile */
  }
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
    max-width: 400px;
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
