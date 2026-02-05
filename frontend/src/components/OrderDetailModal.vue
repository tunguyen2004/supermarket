<template>
  <el-dialog
    v-model="dialogVisible"
    :title="'Chi tiết đơn hàng ' + (order ? order.orderCode : '')"
    width="600px"
    @close="handleClose"
  >
    <div v-if="order" class="order-details">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Mã đơn hàng">{{
          order.orderCode
        }}</el-descriptions-item>
        <el-descriptions-item label="Ngày tạo">{{
          order.orderDate
        }}</el-descriptions-item>
        <el-descriptions-item label="Khách hàng">
          <div>{{ order.customerName }}</div>
          <small v-if="order.customerPhone" style="color: #909399">{{
            order.customerPhone
          }}</small>
        </el-descriptions-item>
        <el-descriptions-item label="Cửa hàng">{{
          order.store || "N/A"
        }}</el-descriptions-item>
        <el-descriptions-item label="Phương thức TT">{{
          order.paymentMethod || "N/A"
        }}</el-descriptions-item>
        <el-descriptions-item label="Người tạo">{{
          order.createdBy || "N/A"
        }}</el-descriptions-item>
        <el-descriptions-item label="Thanh toán">
          <el-tag
            :type="getPaymentStatusType(order.paymentStatus)"
            size="small"
            >{{ order.paymentStatus }}</el-tag
          >
        </el-descriptions-item>
        <el-descriptions-item label="Trạng thái">
          <el-tag
            :type="getFulfillmentStatusType(order.fulfillmentStatus)"
            size="small"
            >{{ order.fulfillmentStatus }}</el-tag
          >
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h4>Sản phẩm trong đơn ({{ order.items?.length || 0 }} mặt hàng)</h4>
      <el-table :data="orderItems" style="width: 100%">
        <el-table-column label="Sản phẩm">
          <template #default="scope">
            <div>{{ scope.row.product || scope.row.product_name }}</div>
            <small v-if="scope.row.sku" style="color: #909399"
              >SKU: {{ scope.row.sku }}</small
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="quantity"
          label="Số lượng"
          width="100"
          align="center"
        />
        <el-table-column label="Đơn giá" width="120" align="right">
          <template #default="scope">{{
            formatCurrency(scope.row.unit_price)
          }}</template>
        </el-table-column>
        <el-table-column label="Giảm giá" width="100" align="right">
          <template #default="scope">
            <span v-if="scope.row.discount_per_item > 0" style="color: #f56c6c">
              -{{ formatCurrency(scope.row.discount_per_item) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Thành tiền" width="120" align="right">
          <template #default="scope">{{
            formatCurrency(
              scope.row.line_total ||
                scope.row.total ||
                scope.row.unit_price * scope.row.quantity -
                  (scope.row.discount_per_item || 0),
            )
          }}</template>
        </el-table-column>
      </el-table>

      <el-divider />

      <el-descriptions :column="2" border>
        <el-descriptions-item label="Tạm tính">
          {{ formatCurrency(order.subtotal || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="Giảm giá">
          <span style="color: #f56c6c"
            >-{{ formatCurrency(order.discount || 0) }}</span
          >
        </el-descriptions-item>
        <el-descriptions-item label="Thuế">
          {{ formatCurrency(order.tax || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="Phí vận chuyển">
          {{ formatCurrency(order.shipping || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="Tổng cộng" :span="2">
          <span style="font-weight: bold; color: #f56c6c; font-size: 18px">{{
            formatCurrency(order.totalAmount)
          }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider v-if="order.notes?.customer || order.notes?.internal" />

      <div v-if="order.notes?.customer || order.notes?.internal">
        <h4>Ghi chú</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item
            v-if="order.notes?.customer"
            label="Ghi chú của khách"
          >
            {{ order.notes.customer }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="order.notes?.internal"
            label="Ghi chú nội bộ"
          >
            {{ order.notes.internal }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    <template #footer>
      <span
        class="dialog-footer"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <div>
          <el-button
            v-if="canCancel"
            type="danger"
            plain
            @click="handleCancelOrder"
            :loading="isCancelling"
          >
            Hủy đơn hàng
          </el-button>
        </div>
        <div style="display: flex; gap: 8px">
          <el-select
            v-if="canUpdateStatus"
            v-model="selectedStatus"
            placeholder="Cập nhật trạng thái"
            style="width: 180px"
            @change="handleUpdateStatus"
            :disabled="isUpdating"
          >
            <el-option label="Chờ xử lý" value="pending" />
            <el-option label="Đang xử lý" value="processing" />
            <el-option label="Đã giao" value="shipped" />
            <el-option label="Hoàn thành" value="delivered" />
          </el-select>
          <el-select
            v-if="canUpdatePayment"
            v-model="selectedPaymentStatus"
            placeholder="Thanh toán"
            style="width: 150px"
            @change="handleUpdatePayment"
            :disabled="isUpdating"
          >
            <el-option label="Đã thanh toán" value="paid" />
            <el-option label="Chưa thanh toán" value="unpaid" />
          </el-select>
          <el-button @click="handleClose">Đóng</el-button>
        </div>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import orderService from "@/services/orderService";

const props = defineProps({
  modelValue: Boolean,
  order: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "refresh"]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const isUpdating = ref(false);
const isCancelling = ref(false);
const selectedStatus = ref("");
const selectedPaymentStatus = ref("");

// Map status to API values
const mapStatusToApi = (status) => {
  const statusMap = {
    "Chờ xử lý": "pending",
    "Hoàn thành": "completed",
    "Đã hủy": "cancelled",
  };
  return statusMap[status] || status;
};

const mapPaymentStatusToApi = (status) => {
  return status === "Đã thanh toán" ? "paid" : "unpaid";
};

// Watch order changes to update selected values
watch(
  () => props.order,
  (newOrder) => {
    if (newOrder) {
      selectedStatus.value = mapStatusToApi(newOrder.fulfillmentStatus);
      selectedPaymentStatus.value = mapPaymentStatusToApi(
        newOrder.paymentStatus,
      );
    }
  },
  { immediate: true },
);

// Check if order can be cancelled (not already cancelled or completed)
const canCancel = computed(() => {
  return (
    props.order?.fulfillmentStatus !== "Đã hủy" &&
    props.order?.fulfillmentStatus !== "Hoàn thành"
  );
});

// Check if status can be updated
const canUpdateStatus = computed(() => {
  return props.order?.fulfillmentStatus !== "Đã hủy";
});

// Check if payment status can be updated
const canUpdatePayment = computed(() => {
  return props.order?.fulfillmentStatus !== "Đã hủy";
});

const handleClose = () => {
  dialogVisible.value = false;
};

// Update order status
const handleUpdateStatus = async () => {
  try {
    isUpdating.value = true;
    console.log("Sending status update:", selectedStatus.value);
    await orderService.updateOrder(props.order.id, {
      status: selectedStatus.value,
    });
    ElMessage.success("Cập nhật trạng thái thành công");
    emit("refresh");
    handleClose();
  } catch (error) {
    console.error("Error updating order status:", error);
    console.error("Response data:", error.response?.data);
    console.error("Status code:", error.response?.status);
    const errorMsg =
      error.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng";
    ElMessage.error(errorMsg);
    // Reset to original value
    selectedStatus.value = mapStatusToApi(props.order.fulfillmentStatus);
  } finally {
    isUpdating.value = false;
  }
};

// Update payment status
const handleUpdatePayment = async () => {
  try {
    isUpdating.value = true;
    await orderService.updateOrder(props.order.id, {
      payment_status: selectedPaymentStatus.value,
    });
    ElMessage.success("Cập nhật trạng thái thanh toán thành công");
    emit("refresh");
    handleClose();
  } catch (error) {
    console.error("Error updating payment status:", error);
    ElMessage.error("Không thể cập nhật trạng thái thanh toán");
    // Reset to original value
    selectedPaymentStatus.value = mapPaymentStatusToApi(
      props.order.paymentStatus,
    );
  } finally {
    isUpdating.value = false;
  }
};

// Cancel order
const handleCancelOrder = async () => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      "Vui lòng nhập lý do hủy đơn hàng",
      "Xác nhận hủy đơn",
      {
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
        inputPlaceholder: "Nhập lý do...",
        inputValidator: (value) => {
          if (!value || value.trim().length === 0) {
            return "Vui lòng nhập lý do hủy đơn";
          }
          return true;
        },
      },
    );

    isCancelling.value = true;
    await orderService.cancelOrder(props.order.id, reason);
    ElMessage.success("Hủy đơn hàng thành công");
    emit("refresh");
    handleClose();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Error cancelling order:", error);
      ElMessage.error("Không thể hủy đơn hàng");
    }
  } finally {
    isCancelling.value = false;
  }
};

// Map order items from API
const orderItems = computed(() => {
  return props.order?.items || [];
});

// Helper functions
const formatCurrency = (value) => (value || 0).toLocaleString("vi-VN") + "đ";
const getPaymentStatusType = (status) =>
  status === "Đã thanh toán" ? "success" : "warning";
const getFulfillmentStatusType = (status) => {
  if (status === "Hoàn thành") return "success";
  if (status === "Đang giao") return "primary";
  if (status === "Chờ xử lý") return "warning";
  if (status === "Đã hủy") return "danger";
  return "info";
};
</script>

<style scoped>
.order-details {
  /* Add some styles if needed */
}
.el-descriptions-item__label {
  font-weight: 500;
}
</style>
