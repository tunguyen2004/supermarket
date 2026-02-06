<template>
  <div class="page-container">
    <div class="page-header">
      <el-page-header @back="goBack" content="Tạo vận đơn mới"></el-page-header>
    </div>
    <div class="form-container">
      <el-card>
        <el-form :model="form" label-position="top" ref="shipmentForm">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item
                label="Mã đơn hàng liên quan"
                prop="order_id"
                required
              >
                <el-select
                  v-model="form.order_id"
                  placeholder="Chọn đơn hàng"
                  filterable
                >
                  <el-option
                    v-for="order in orders"
                    :key="order.id"
                    :label="`${order.order_code} - ${
                      order.customer_name || 'N/A'
                    }`"
                    :value="order.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Đối tác giao hàng" prop="carrier_id">
                <el-select v-model="form.carrier_id" placeholder="Chọn đối tác">
                  <el-option
                    v-for="carrier in carriers"
                    :key="carrier.id"
                    :label="carrier.name"
                    :value="carrier.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item
            label="Mã vận đơn (do đối tác cung cấp)"
            prop="tracking_code"
          >
            <el-input
              v-model="form.tracking_code"
              placeholder="Nhập mã vận đơn..."
            ></el-input>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item
                label="Tên người nhận"
                prop="recipient_name"
                required
              >
                <el-input
                  v-model="form.recipient_name"
                  placeholder="Nhập tên người nhận"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="Số điện thoại"
                prop="recipient_phone"
                required
              >
                <el-input
                  v-model="form.recipient_phone"
                  placeholder="Nhập số điện thoại"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item
            label="Địa chỉ nhận hàng"
            prop="recipient_address"
            required
          >
            <el-input
              v-model="form.recipient_address"
              placeholder="Nhập địa chỉ đầy đủ"
              type="textarea"
              :rows="2"
            ></el-input>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="Phí vận chuyển" prop="shipping_fee">
                <el-input-number
                  v-model="form.shipping_fee"
                  :min="0"
                  :step="1000"
                  style="width: 100%"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Thu hộ COD" prop="cod_amount">
                <el-input-number
                  v-model="form.cod_amount"
                  :min="0"
                  :step="10000"
                  style="width: 100%"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Phí bảo hiểm" prop="insurance_fee">
                <el-input-number
                  v-model="form.insurance_fee"
                  :min="0"
                  :step="1000"
                  style="width: 100%"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Ghi chú">
            <el-input type="textarea" v-model="form.notes" :rows="3"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="isLoading"
              >Tạo vận đơn</el-button
            >
            <el-button @click="goBack">Hủy</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import shipmentService from "@/services/shipmentService";
import orderService from "@/services/orderService";

const router = useRouter();
const isLoading = ref(false);
const carriers = ref([]);
const orders = ref([]);

const form = ref({
  order_id: "",
  carrier_id: "",
  tracking_code: "",
  sender_store_id: 1, // Default store
  recipient_name: "",
  recipient_phone: "",
  recipient_address: "",
  recipient_city_id: null,
  recipient_district: "",
  recipient_ward: "",
  package_weight: null,
  shipping_fee: 0,
  cod_amount: 0,
  insurance_fee: 0,
  estimated_delivery_date: null,
  notes: "",
  special_instructions: "",
});

const goBack = () => {
  router.back();
};

const loadCarriers = async () => {
  try {
    const response = await shipmentService.getCarriers();
    if (response.data.success) {
      carriers.value = response.data.data;
    }
  } catch (error) {
    console.error("Load carriers error:", error);
    ElMessage.error("Không thể tải danh sách đơn vị vận chuyển");
  }
};

const loadOrders = async () => {
  try {
    const response = await orderService.getOrders({
      limit: 50,
      status: "confirmed", // Chỉ load đơn hàng đã xác nhận
    });
    if (response.success) {
      orders.value = response.data;
    }
  } catch (error) {
    console.error("Load orders error:", error);
    ElMessage.error("Không thể tải danh sách đơn hàng");
  }
};

const handleSubmit = async () => {
  if (
    !form.value.order_id ||
    !form.value.recipient_name ||
    !form.value.recipient_phone ||
    !form.value.recipient_address
  ) {
    ElMessage.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
    return;
  }

  isLoading.value = true;
  try {
    const response = await shipmentService.createShipment(form.value);

    if (response.data.success) {
      ElMessage.success("Tạo vận đơn thành công!");
      router.push({ name: "Shipments" });
    } else {
      ElMessage.error(response.data.message || "Tạo vận đơn thất bại!");
    }
  } catch (error) {
    console.error("Create shipment error:", error);
    ElMessage.error(error.response?.data?.message || "Lỗi khi tạo vận đơn");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadCarriers();
  loadOrders();
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
