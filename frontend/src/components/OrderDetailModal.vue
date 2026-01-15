<template>
  <el-dialog
    v-model="dialogVisible"
    :title="'Chi tiết đơn hàng ' + (order ? order.orderCode : '')"
    width="600px"
    @close="handleClose"
  >
    <div v-if="order" class="order-details">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Mã đơn hàng">{{ order.orderCode }}</el-descriptions-item>
        <el-descriptions-item label="Ngày tạo">{{ order.orderDate }}</el-descriptions-item>
        <el-descriptions-item label="Khách hàng">{{ order.customerName }}</el-descriptions-item>
        <el-descriptions-item label="Tổng tiền">
          <span style="font-weight: bold; color: #f56c6c;">{{ formatCurrency(order.totalAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Thanh toán">
          <el-tag :type="getPaymentStatusType(order.paymentStatus)" size="small">{{ order.paymentStatus }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Giao hàng">
          <el-tag :type="getFulfillmentStatusType(order.fulfillmentStatus)" size="small">{{ order.fulfillmentStatus }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <el-divider />
      
      <h4>Sản phẩm trong đơn</h4>
      <el-table :data="sampleProducts" style="width: 100%">
        <el-table-column prop="name" label="Sản phẩm" />
        <el-table-column prop="quantity" label="Số lượng" width="100" align="center" />
        <el-table-column prop="price" label="Đơn giá" width="120" align="right">
          <template #default="scope">{{ formatCurrency(scope.row.price) }}</template>
        </el-table-column>
        <el-table-column label="Thành tiền" width="120" align="right">
          <template #default="scope">{{ formatCurrency(scope.row.price * scope.row.quantity) }}</template>
        </el-table-column>
      </el-table>

    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Đóng</el-button>
        <el-button type="primary">In đơn hàng</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  order: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const handleClose = () => {
  dialogVisible.value = false;
};

// Dummy data for products, as it's not in the order object
const sampleProducts = [
    { name: 'Áo Thun Basic', quantity: 2, price: 250000 },
    { name: 'Quần Jeans Slimfit', quantity: 1, price: 750000 },
];

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
