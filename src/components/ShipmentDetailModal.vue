<template>
  <el-dialog
    v-model="dialogVisible"
    :title="'Chi tiết vận đơn ' + (shipment ? shipment.shipmentCode : '')"
    width="600px"
    @close="handleClose"
  >
    <div v-if="shipment" class="shipment-details">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Mã vận đơn">{{ shipment.shipmentCode }}</el-descriptions-item>
        <el-descriptions-item label="Mã đơn hàng">{{ shipment.orderCode }}</el-descriptions-item>
        <el-descriptions-item label="Khách hàng">{{ shipment.customerName }}</el-descriptions-item>
        <el-descriptions-item label="Đối tác vận chuyển">{{ shipment.carrier }}</el-descriptions-item>
        <el-descriptions-item label="Phí vận chuyển">
          <span style="font-weight: bold;">{{ formatCurrency(shipment.shippingFee) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Trạng thái">
          <el-select v-model="editableStatus" placeholder="Cập nhật" size="small" style="width: 150px;">
            <el-option
              v-for="s in availableStatuses"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h4>Lịch sử vận đơn</h4>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in trackingHistory"
          :key="index"
          :timestamp="activity.timestamp"
          :type="activity.type"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Đóng</el-button>
        <el-button type="primary">In vận đơn</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  shipment: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'update:shipment']);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const handleClose = () => {
  dialogVisible.value = false;
};

const editableStatus = ref('');
const availableStatuses = [
  'Chờ lấy hàng',
  'Đang giao',
  'Giao thành công',
  'Chuyển hoàn',
];

watch(() => props.shipment, (newShipment) => {
  if (newShipment) {
    editableStatus.value = newShipment.status;
  }
}, { immediate: true });

watch(editableStatus, (newStatus) => {
  if (props.shipment && newStatus !== props.shipment.status) {
    emit('update:shipment', { ...props.shipment, status: newStatus });
  }
});

// Dummy data for tracking history
const trackingHistory = ref([
    { content: 'Giao hàng thành công', timestamp: '2025-08-09 14:30', type: 'success' },
    { content: 'Đang giao hàng', timestamp: '2025-08-09 09:15' },
    { content: 'Đã lấy hàng', timestamp: '2025-08-08 18:00' },
    { content: 'Đối tác đã tạo vận đơn', timestamp: '2025-08-08 16:00' },
]);

// Helper functions
const formatCurrency = (value) => (value || 0).toLocaleString("vi-VN") + "đ";
</script>

<style scoped>
.shipment-details h4 {
    margin-top: 20px;
    margin-bottom: 15px;
}
</style>