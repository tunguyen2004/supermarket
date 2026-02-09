<template>
  <el-dialog
    v-model="dialogVisible"
    :title="'Chi tiết vận đơn ' + (shipment ? shipment.shipmentCode : '')"
    width="600px"
    @close="handleClose"
  >
    <div v-if="shipment" class="shipment-details">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Mã vận đơn">{{
          shipment.shipmentCode
        }}</el-descriptions-item>
        <el-descriptions-item label="Mã đơn hàng">{{
          shipment.orderCode
        }}</el-descriptions-item>
        <el-descriptions-item label="Khách hàng">{{
          shipment.customerName
        }}</el-descriptions-item>
        <el-descriptions-item label="Đối tác vận chuyển">{{
          shipment.carrier
        }}</el-descriptions-item>
        <el-descriptions-item label="Phí vận chuyển">
          <span style="font-weight: bold">{{
            formatCurrency(shipment.shippingFee)
          }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Trạng thái">
          <el-select
            v-model="editableStatus"
            placeholder="Cập nhật"
            size="small"
            style="width: 180px"
          >
            <el-option
              v-for="s in availableStatuses"
              :key="s.code"
              :label="s.name"
              :value="s.code"
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
          :timestamp="new Date(activity.timestamp).toLocaleString('vi-VN')"
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
import { defineProps, defineEmits, computed, ref, watch } from "vue";
import { ElMessage, ElLoading } from "element-plus";
import shipmentService, { mapShipmentStatus } from "@/services/shipmentService";

const props = defineProps({
  modelValue: Boolean,
  shipment: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "update:shipment"]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const handleClose = () => {
  dialogVisible.value = false;
};

const editableStatus = ref("");
const availableStatuses = [
  { code: "pending", name: "Chờ lấy hàng" },
  { code: "confirmed", name: "Đã xác nhận" },
  { code: "picking", name: "Đang lấy hàng" },
  { code: "picked", name: "Đã lấy hàng" },
  { code: "in_transit", name: "Đang vận chuyển" },
  { code: "out_for_delivery", name: "Đang giao hàng" },
  { code: "delivered", name: "Giao thành công" },
  { code: "failed", name: "Giao thất bại" },
  { code: "returned", name: "Chuyển hoàn" },
  { code: "cancelled", name: "Đã hủy" },
];

watch(
  () => props.shipment,
  (newShipment) => {
    if (newShipment) {
      editableStatus.value = newShipment.statusCode || newShipment.status_code;
    }
  },
  { immediate: true },
);

const updateShipmentStatus = async (newStatusCode) => {
  if (!props.shipment || newStatusCode === props.shipment.statusCode) return;

  try {
    const loading = ElLoading.service({
      lock: true,
      text: "Đang cập nhật trạng thái...",
    });

    await shipmentService.updateShipmentStatus(props.shipment.id, {
      status: newStatusCode,
      description: `Cập nhật trạng thái thành ${mapShipmentStatus(
        newStatusCode,
      )}`,
    });

    const updatedShipment = {
      ...props.shipment,
      statusCode: newStatusCode,
      status: mapShipmentStatus(newStatusCode),
    };

    emit("update:shipment", updatedShipment);
    ElMessage.success("Cập nhật trạng thái thành công");

    loading.close();
  } catch (error) {
    ElMessage.error("Lỗi khi cập nhật trạng thái: " + error.message);
    // Revert status change
    editableStatus.value = props.shipment.statusCode;
  }
};

watch(editableStatus, (newStatusCode) => {
  if (props.shipment && newStatusCode !== props.shipment.statusCode) {
    updateShipmentStatus(newStatusCode);
  }
});

// Tracking history with proper mapping
const trackingHistory = computed(() => {
  if (!props.shipment?.trackingHistory) {
    return [
      {
        content: "Vận đơn được tạo",
        timestamp: props.shipment?.createdAt || new Date().toISOString(),
        type: "info",
      },
    ];
  }

  return props.shipment.trackingHistory.map((item) => ({
    content: item.description || mapShipmentStatus(item.status_code),
    timestamp: item.tracked_at || item.created_at,
    type: getTimelineType(item.status_code),
  }));
});

const getTimelineType = (statusCode) => {
  const typeMap = {
    delivered: "success",
    failed: "danger",
    returned: "warning",
    cancelled: "info",
  };
  return typeMap[statusCode] || "primary";
};

// Helper functions
const formatCurrency = (value) => (value || 0).toLocaleString("vi-VN") + "đ";
</script>

<style scoped>
.shipment-details h4 {
  margin-top: 20px;
  margin-bottom: 15px;
}
</style>
