<template>
  <div class="page-container">
    <div class="page-header">
      <el-page-header @back="goBack" content="Tạo vận đơn mới"></el-page-header>
    </div>
    <div class="form-container">
      <el-card
        v-loading="isLoadingOrders || isLoadingCarriers"
        element-loading-text="Đang tải dữ liệu..."
      >
        <el-form
          :model="form"
          :rules="rules"
          label-position="top"
          ref="shipmentForm"
        >
          <!-- Thông tin đơn hàng -->
          <el-divider content-position="left">Thông tin đơn hàng</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Đơn hàng liên quan" prop="orderId">
                <el-select
                  v-model="form.orderId"
                  placeholder="Chọn đơn hàng"
                  filterable
                  :loading="isLoadingOrders"
                  style="width: 100%"
                >
                  <el-option
                    v-for="order in orders"
                    :key="order.id"
                    :label="order.label"
                    :value="order.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Đơn vị vận chuyển" prop="carrierId">
                <el-select
                  v-model="form.carrierId"
                  placeholder="Chọn đơn vị vận chuyển"
                  :loading="isLoadingCarriers"
                  style="width: 100%"
                >
                  <el-option
                    v-for="carrier in carriers"
                    :key="carrier.id"
                    :label="carrier.name"
                    :value="carrier.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- Thông tin khách hàng (auto-fill) -->
          <el-divider content-position="left" v-if="selectedOrder"
            >Thông tin người nhận</el-divider
          >

          <el-row :gutter="20" v-if="selectedOrder">
            <el-col :span="8">
              <el-form-item label="Tên người nhận">
                <el-input :value="selectedOrder.customerName" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Số điện thoại">
                <el-input :value="selectedOrder.customerPhone" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Địa chỉ">
                <el-input :value="selectedOrder.customerAddress" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- Thông tin vận đơn -->
          <el-divider content-position="left">Thông tin vận chuyển</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item
                label="Mã vận đơn (Tracking Code)"
                prop="trackingCode"
              >
                <el-input
                  v-model="form.trackingCode"
                  placeholder="Nhập mã tracking từ đối tác (tùy chọn)"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Ngày giao dự kiến">
                <el-date-picker
                  v-model="form.estimatedDeliveryDate"
                  type="date"
                  placeholder="Chọn ngày"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- Chi phí -->
          <el-divider content-position="left">Chi phí</el-divider>

          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="Phí vận chuyển" prop="shippingFee">
                <el-input-number
                  v-model="form.shippingFee"
                  :min="0"
                  :step="1000"
                  style="width: 100%"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Thu hộ (COD)">
                <el-input-number
                  v-model="form.codAmount"
                  :min="0"
                  :step="1000"
                  style="width: 100%"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Phí bảo hiểm">
                <el-input-number
                  v-model="form.insuranceFee"
                  :min="0"
                  :step="1000"
                  style="width: 100%"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Tổng phí">
                <el-input
                  :value="totalFee.toLocaleString('vi-VN') + 'đ'"
                  disabled
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- Thông tin kiện hàng -->
          <el-divider content-position="left">Thông tin kiện hàng</el-divider>

          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="Khối lượng (kg)">
                <el-input-number
                  v-model="form.packageWeight"
                  :min="0"
                  :step="0.1"
                  :precision="2"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Chiều dài (cm)">
                <el-input-number
                  v-model="form.packageLength"
                  :min="0"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Chiều rộng (cm)">
                <el-input-number
                  v-model="form.packageWidth"
                  :min="0"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Chiều cao (cm)">
                <el-input-number
                  v-model="form.packageHeight"
                  :min="0"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Mô tả hàng hóa">
            <el-input
              v-model="form.itemsDescription"
              placeholder="Mô tả nội dung kiện hàng..."
            />
          </el-form-item>

          <el-form-item label="Ghi chú">
            <el-input
              type="textarea"
              v-model="form.notes"
              :rows="3"
              placeholder="Ghi chú thêm..."
            />
          </el-form-item>

          <el-form-item label="Hướng dẫn đặc biệt">
            <el-input
              type="textarea"
              v-model="form.specialInstructions"
              :rows="2"
              placeholder="Hướng dẫn đặc biệt cho shipper..."
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleSubmit"
              :loading="isLoading"
              :disabled="!selectedOrder"
            >
              {{ isLoading ? "Đang tạo..." : "Tạo vận đơn" }}
            </el-button>
            <el-button @click="goBack" :disabled="isLoading">Hủy</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElLoading } from "element-plus";
import shipmentService from "@/services/shipmentService";
import orderService from "@/services/orderService";

const router = useRouter();

// Form data
const form = ref({
  orderId: "",
  carrierId: "",
  trackingCode: "",
  shippingFee: 0,
  codAmount: 0,
  insuranceFee: 0,
  packageWeight: 0,
  packageLength: 0,
  packageWidth: 0,
  packageHeight: 0,
  itemsDescription: "",
  estimatedDeliveryDate: "",
  notes: "",
  specialInstructions: "",
});

// Data lists
const orders = ref([]);
const carriers = ref([]);
const selectedOrder = ref(null);

// Loading states
const isLoading = ref(false);
const isLoadingOrders = ref(true);
const isLoadingCarriers = ref(true);

// Form reference
const shipmentForm = ref(null);

// Helper function to check if response is successful
const isResponseSuccess = (response) => {
  return response.success === true || response.status === "OK";
};

// Helper function to get response data
const getResponseData = (response) => {
  return response.data || [];
};

// Validation rules
const rules = {
  orderId: [
    { required: true, message: "Vui lòng chọn đơn hàng", trigger: "change" },
  ],
  carrierId: [
    {
      required: true,
      message: "Vui lòng chọn đơn vị vận chuyển",
      trigger: "change",
    },
  ],
  shippingFee: [
    {
      required: true,
      message: "Vui lòng nhập phí vận chuyển",
      trigger: "blur",
    },
  ],
};

// Load orders for selection
const loadOrders = async () => {
  try {
    isLoadingOrders.value = true;
    const response = await orderService.getOrders({
      status: "completed", // Only completed orders can create shipments
      limit: 100,
    });

    if (isResponseSuccess(response)) {
      console.log("Orders response:", response); // Debug log
      const data = getResponseData(response);
      // Filter orders that don't have shipments yet
      orders.value = data.map((order) => ({
        id: order.id,
        orderCode: order.order_code,
        customerName: order.customer?.name || order.customer_name,
        customerPhone: order.customer?.phone || order.customer_phone,
        customerAddress:
          order.shipping_address || order.customer_address || "Chưa có địa chỉ",
        finalAmount: order.amount?.total || order.final_amount || 0,
        label: `${order.order_code} - ${
          order.customer?.name || order.customer_name || "Khách hàng"
        }`,
        value: order.id,
      }));
      console.log("Mapped orders:", orders.value); // Debug log
    }
  } catch (error) {
    ElMessage.error("Lỗi khi tải danh sách đơn hàng: " + error.message);
  } finally {
    isLoadingOrders.value = false;
  }
};

// Load carriers
const loadCarriers = async () => {
  try {
    isLoadingCarriers.value = true;
    const response = await shipmentService.getCarriers();

    if (isResponseSuccess(response)) {
      console.log("Carriers response:", response); // Debug log
      carriers.value = getResponseData(response);
      console.log("Carriers loaded:", carriers.value); // Debug log
    }
  } catch (error) {
    ElMessage.error(
      "Lỗi khi tải danh sách đơn vị vận chuyển: " + error.message,
    );
  } finally {
    isLoadingCarriers.value = false;
  }
};

// Watch order selection to auto-fill data
watch(
  () => form.value.orderId,
  (newOrderId) => {
    const order = orders.value.find((o) => o.id === newOrderId);
    if (order) {
      selectedOrder.value = order;
      // Auto estimate COD amount from order
      form.value.codAmount = order.finalAmount || 0;
    }
  },
);

// Computed total fee
const totalFee = computed(() => {
  return (form.value.shippingFee || 0) + (form.value.insuranceFee || 0);
});

const goBack = () => {
  router.back();
};

// Submit form
const handleSubmit = async () => {
  if (!shipmentForm.value) return;

  try {
    // Validate form
    const isValid = await shipmentForm.value.validate();
    if (!isValid) return;

    if (!selectedOrder.value) {
      ElMessage.error("Vui lòng chọn đơn hàng");
      return;
    }

    isLoading.value = true;

    // Prepare shipment data for API
    const shipmentData = {
      order_id: form.value.orderId,
      carrier_id: form.value.carrierId,
      tracking_code: form.value.trackingCode || null,
      sender_store_id: 1, // TODO: Get from user context/store selection
      recipient_name: selectedOrder.value.customerName,
      recipient_phone: selectedOrder.value.customerPhone,
      recipient_address: selectedOrder.value.customerAddress,
      recipient_city_id: null, // TODO: Add city selection if needed
      recipient_district: "",
      recipient_ward: "",
      package_weight: form.value.packageWeight || 0,
      package_length: form.value.packageLength || 0,
      package_width: form.value.packageWidth || 0,
      package_height: form.value.packageHeight || 0,
      items_description: form.value.itemsDescription || "Hàng hóa",
      shipping_fee: form.value.shippingFee || 0,
      cod_amount: form.value.codAmount || 0,
      insurance_fee: form.value.insuranceFee || 0,
      estimated_delivery_date: form.value.estimatedDeliveryDate || null,
      notes: form.value.notes || "",
      special_instructions: form.value.specialInstructions || "",
    };

    const response = await shipmentService.createShipment(shipmentData);

    if (isResponseSuccess(response)) {
      ElMessage.success("Tạo vận đơn thành công!");
      router.push({ name: "Shipments" });
    }
  } catch (error) {
    ElMessage.error("Lỗi khi tạo vận đơn: " + error.message);
  } finally {
    isLoading.value = false;
  }
};

// Load initial data
onMounted(async () => {
  await Promise.all([loadOrders(), loadCarriers()]);
});
</script>

<style scoped>
.page-container {
  padding: 24px 32px;
}
.page-header {
  margin-bottom: 24px;
}
.form-container {
  max-width: 800px;
}
.el-select {
  width: 100%;
}
</style>
