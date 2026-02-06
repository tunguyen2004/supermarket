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
            :loading="isLoading"
          >
            <el-option
              v-for="s in availableStatuses"
              :key="s.value"
              :label="s.label"
              :value="s.value"
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
import { defineProps, defineEmits, computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import shipmentService from "@/services/shipmentService";

const props = defineProps({
  modelValue: Boolean,
  shipment: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "update:shipment"]);

const isLoading = ref(false);
const trackingHistory = ref([]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const handleClose = () => {
  dialogVisible.value = false;
};

const editableStatus = ref("");
const availableStatuses = [
  { label: "Chờ lấy hàng", value: "pending" },
  { label: "Đã lấy hàng", value: "picked" },
  { label: "Đang vận chuyển", value: "shipping" },
  { label: "Giao thành công", value: "delivered" },
  { label: "Chuyển hoàn", value: "returning" },
  { label: "Đã hoàn", value: "returned" },
  { label: "Hủy", value: "cancelled" },
];

watch(
  () => props.shipment,
  async (newShipment) => {
    if (newShipment) {
      editableStatus.value = newShipment.status_code || newShipment.status;

      // Load tracking history from API
      if (newShipment.tracking_history) {
        trackingHistory.value = newShipment.tracking_history.map((item) => ({
          content: item.description || item.status_name,
          timestamp: new Date(item.tracked_at).toLocaleString("vi-VN"),
          type: item.status_code === "delivered" ? "success" : undefined,
        }));
      }
    }
  },
  { immediate: true },
);

watch(editableStatus, async (newStatus) => {
  if (
    props.shipment &&
    newStatus !== (props.shipment.status_code || props.shipment.status)
  ) {
    try {
      isLoading.value = true;
      const response = await shipmentService.updateShipmentStatus(
        props.shipment.id,
        {
          status: newStatus,
          description: `Cập nhật trạng thái thành ${newStatus}`,
        },
      );

      if (response.data.success) {
        ElMessage.success("Cập nhật trạng thái thành công!");
        emit("update:shipment", { ...props.shipment, status_code: newStatus });
      }
    } catch (error) {
      console.error("Update status error:", error);
      ElMessage.error("Không thể cập nhật trạng thái");
      editableStatus.value =
        props.shipment.status_code || props.shipment.status;
    } finally {
      isLoading.value = false;
    }
  }
});

// Helper functions
const formatCurrency = (value) => (value || 0).toLocaleString("vi-VN") + "đ";
</script>

<style scoped>
.shipment-details h4 {
  margin-top: 20px;
  margin-bottom: 15px;
}
</style>
