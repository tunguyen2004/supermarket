<template>
  <div class="page-container">
    <div class="page-header">
      <el-page-header
        @back="goBack"
        :content="isEditMode ? 'Sửa khuyến mại' : 'Tạo khuyến mại mới'"
      ></el-page-header>
    </div>
    <div class="form-container" v-loading="loading">
      <el-card>
        <el-form
          :model="form"
          :rules="rules"
          label-position="top"
          ref="discountFormRef"
        >
          <!-- Thông tin cơ bản -->
          <el-divider content-position="left">Thông tin cơ bản</el-divider>

          <el-form-item label="Tên chương trình khuyến mại" prop="name">
            <el-input
              v-model="form.name"
              placeholder="VD: Giảm giá mùa hè"
              maxlength="100"
              show-word-limit
            ></el-input>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Mã khuyến mại" prop="code">
                <el-input
                  v-model="form.code"
                  placeholder="VD: SUMMER2025"
                  maxlength="20"
                  :disabled="isEditMode"
                  @input="form.code = form.code.toUpperCase()"
                >
                  <template #append>A-Z, 0-9</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Loại khuyến mại" prop="discount_type">
                <el-select
                  v-model="form.discount_type"
                  placeholder="Chọn loại khuyến mại"
                  style="width: 100%"
                >
                  <el-option
                    v-for="type in discountTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Mô tả" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="Mô tả chi tiết về chương trình khuyến mại"
              maxlength="500"
              show-word-limit
            ></el-input>
          </el-form-item>

          <!-- Giá trị khuyến mại -->
          <el-divider content-position="left">Giá trị khuyến mại</el-divider>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="Giá trị giảm" prop="discount_value">
                <el-input-number
                  v-model="form.discount_value"
                  :min="0.01"
                  :precision="2"
                  style="width: 100%"
                  :controls="false"
                >
                  <template #append>
                    {{ form.discount_type === "PERCENTAGE" ? "%" : "đ" }}
                  </template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="Giảm tối đa"
                prop="max_discount_amount"
                v-if="form.discount_type === 'PERCENTAGE'"
              >
                <el-input-number
                  v-model="form.max_discount_amount"
                  :min="0"
                  :precision="0"
                  style="width: 100%"
                  placeholder="Không giới hạn"
                  :controls="false"
                >
                  <template #append>đ</template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="Giá trị đơn tối thiểu"
                prop="min_order_amount"
              >
                <el-input-number
                  v-model="form.min_order_amount"
                  :min="0"
                  :precision="0"
                  style="width: 100%"
                  :controls="false"
                >
                  <template #append>đ</template>
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- Giới hạn sử dụng -->
          <el-divider content-position="left">Giới hạn sử dụng</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Tổng lượt sử dụng" prop="max_uses_total">
                <el-input-number
                  v-model="form.max_uses_total"
                  :min="1"
                  :precision="0"
                  style="width: 100%"
                  placeholder="Không giới hạn"
                  :controls="false"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="Lượt sử dụng/khách"
                prop="max_uses_per_customer"
              >
                <el-input-number
                  v-model="form.max_uses_per_customer"
                  :min="1"
                  :precision="0"
                  style="width: 100%"
                  :controls="false"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- Áp dụng cho -->
          <el-divider content-position="left">Phạm vi áp dụng</el-divider>

          <el-form-item label="Áp dụng cho" prop="applies_to">
            <el-radio-group v-model="form.applies_to">
              <el-radio label="all">Toàn bộ sản phẩm</el-radio>
              <el-radio label="categories">Danh mục cụ thể</el-radio>
              <el-radio label="products">Sản phẩm cụ thể</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- Thời gian hiệu lực -->
          <el-divider content-position="left">Thời gian hiệu lực</el-divider>

          <el-form-item label="Thời gian" prop="dateRange">
            <el-date-picker
              v-model="form.dateRange"
              type="datetimerange"
              range-separator="-"
              start-placeholder="Ngày bắt đầu"
              end-placeholder="Ngày kết thúc"
              style="width: 100%"
              format="DD/MM/YYYY HH:mm"
              value-format="YYYY-MM-DDTHH:mm:ss"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleSubmit"
              :loading="submitting"
              >{{ isEditMode ? "Lưu thay đổi" : "Tạo khuyến mại" }}</el-button
            >
            <el-button @click="goBack">Hủy</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useDiscountStore } from "@/store/discount";
import { storeToRefs } from "pinia";

const router = useRouter();
const route = useRoute();
const discountStore = useDiscountStore();
const { loading } = storeToRefs(discountStore);

const isEditMode = ref(false);
const submitting = ref(false);
const discountFormRef = ref(null);

const form = reactive({
  id: null,
  name: "",
  code: "",
  description: "",
  discount_type: "PERCENTAGE",
  discount_value: null,
  max_discount_amount: null,
  min_order_amount: 0,
  max_uses_total: null,
  max_uses_per_customer: 1,
  applies_to: "all",
  applicable_product_ids: null,
  applicable_category_ids: null,
  customer_group_ids: null,
  dateRange: [],
});

const discountTypes = ref([
  { value: "PERCENTAGE", label: "Giảm theo % (Phần trăm)" },
  { value: "FIXED_AMOUNT", label: "Giảm số tiền cố định" },
  { value: "BUY_X_GET_Y", label: "Mua X tặng Y" },
  { value: "FREE_SHIPPING", label: "Miễn phí vận chuyển" },
]);

// Validation rules
const rules = {
  name: [
    {
      required: true,
      message: "Vui lòng nhập tên khuyến mại",
      trigger: "blur",
    },
    {
      min: 3,
      max: 100,
      message: "Tên phải có từ 3-100 ký tự",
      trigger: "blur",
    },
  ],
  code: [
    { required: true, message: "Vui lòng nhập mã khuyến mại", trigger: "blur" },
    {
      pattern: /^[A-Z0-9]+$/,
      message: "Mã chỉ chứa chữ in hoa và số",
      trigger: "blur",
    },
    {
      min: 3,
      max: 20,
      message: "Mã phải có từ 3-20 ký tự",
      trigger: "blur",
    },
  ],
  discount_type: [
    {
      required: true,
      message: "Vui lòng chọn loại khuyến mại",
      trigger: "change",
    },
  ],
  discount_value: [
    { required: true, message: "Vui lòng nhập giá trị giảm", trigger: "blur" },
    {
      type: "number",
      min: 0.01,
      message: "Giá trị phải lớn hơn 0",
      trigger: "blur",
    },
  ],
  dateRange: [
    {
      required: true,
      message: "Vui lòng chọn thời gian hiệu lực",
      trigger: "change",
    },
  ],
};

// Load discount types
const loadDiscountTypes = async () => {
  const result = await discountStore.fetchDiscountTypes();
  if (result.success && result.data) {
    discountTypes.value = result.data.map((type) => ({
      value: type.code,
      label: type.name,
    }));
  }
};

// Load discount for edit
const loadDiscount = async (id) => {
  const result = await discountStore.fetchDiscountById(id);
  if (result.success && result.data) {
    const discount = result.data;
    form.id = discount.id;
    form.name = discount.name;
    form.code = discount.code;
    form.description = discount.description || "";
    form.discount_type = discount.discount_type;
    form.discount_value = discount.discount_value;
    form.max_discount_amount = discount.max_discount_amount;
    form.min_order_amount = discount.min_order_amount || 0;
    form.max_uses_total = discount.max_uses_total;
    form.max_uses_per_customer = discount.max_uses_per_customer || 1;
    form.applies_to = discount.applies_to || "all";
    form.applicable_product_ids = discount.applicable_product_ids;
    form.applicable_category_ids = discount.applicable_category_ids;
    form.customer_group_ids = discount.customer_group_ids;
    form.dateRange = [discount.start_date, discount.end_date];
  } else {
    ElMessage.error(result.error || "Không tải được thông tin khuyến mại");
    goBack();
  }
};

onMounted(async () => {
  // Load discount types
  await loadDiscountTypes();

  // Check if edit mode
  const discountId = route.params.id;
  if (discountId) {
    isEditMode.value = true;
    await loadDiscount(discountId);
  }
});

const goBack = () => {
  router.push({ name: "Discounts" });
};

const handleSubmit = async () => {
  // Validate form
  if (!discountFormRef.value) return;

  try {
    await discountFormRef.value.validate();
  } catch (error) {
    ElMessage.error("Vui lòng kiểm tra lại thông tin nhập");
    return;
  }

  // Validate date range
  if (!form.dateRange || form.dateRange.length !== 2) {
    ElMessage.error("Vui lòng chọn thời gian hiệu lực");
    return;
  }

  // Validate discount value based on type
  if (form.discount_type === "PERCENTAGE" && form.discount_value > 100) {
    ElMessage.error("Giá trị giảm % không được vượt quá 100");
    return;
  }

  submitting.value = true;

  // Prepare payload
  const payload = {
    code: form.code,
    name: form.name,
    description: form.description || null,
    discount_type: form.discount_type,
    discount_value: form.discount_value,
    max_discount_amount: form.max_discount_amount || null,
    min_order_amount: form.min_order_amount || 0,
    max_uses_total: form.max_uses_total || null,
    max_uses_per_customer: form.max_uses_per_customer || 1,
    applies_to: form.applies_to,
    applicable_product_ids: form.applicable_product_ids || null,
    applicable_category_ids: form.applicable_category_ids || null,
    customer_group_ids: form.customer_group_ids || null,
    start_date: form.dateRange[0],
    end_date: form.dateRange[1],
  };

  try {
    let result;
    if (isEditMode.value) {
      result = await discountStore.updateDiscount(form.id, payload);
      if (result.success) {
        ElMessage.success("Cập nhật khuyến mại thành công!");
        goBack();
      } else {
        ElMessage.error(result.error || "Cập nhật khuyến mại thất bại");
      }
    } else {
      result = await discountStore.createDiscount(payload);
      if (result.success) {
        ElMessage.success("Tạo khuyến mại thành công!");
        goBack();
      } else {
        ElMessage.error(result.error || "Tạo khuyến mại thất bại");
      }
    }
  } catch (error) {
    console.error("Submit error:", error);
    ElMessage.error("Có lỗi xảy ra, vui lòng thử lại");
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.page-container {
  padding: 24px 32px;
}
.page-header {
  margin-bottom: 24px;
}
.form-container {
  max-width: 900px;
}
.el-select {
  width: 100%;
}
:deep(.el-divider__text) {
  font-weight: 600;
  color: #409eff;
}
</style>
