<template>
  <div class="page-container">
    <div class="page-header">
      <el-page-header
        @back="goBack"
        :content="isEditMode ? 'Sửa khuyến mại' : 'Tạo khuyến mại mới'"
      ></el-page-header>
    </div>
    <div class="form-container">
      <el-card>
        <el-form :model="form" label-position="top" ref="discountForm">
          <el-form-item label="Tên chương trình khuyến mại" prop="name">
            <el-input
              v-model="form.name"
              placeholder="VD: Giảm giá mùa hè"
            ></el-input>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Mã khuyến mại" prop="code">
                <el-input
                  v-model="form.code"
                  placeholder="VD: SUMMER2025"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Loại khuyến mại (Mô phỏng)">
                <el-select v-model="form.type" placeholder="Chọn loại">
                  <el-option label="Giảm giá %" value="percentage"></el-option>
                  <el-option
                    label="Giảm giá cố định"
                    value="fixed_amount"
                  ></el-option>
                  <el-option
                    label="Miễn phí vận chuyển"
                    value="free_shipping"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Thời gian hiệu lực" prop="dateRange">
            <el-date-picker
              v-model="form.dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="Ngày bắt đầu"
              end-placeholder="Ngày kết thúc"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSubmit">{{
              isEditMode ? "Lưu thay đổi" : "Tạo khuyến mại"
            }}</el-button>
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

const router = useRouter();
const route = useRoute();
const isEditMode = ref(false);
const form = reactive({
  id: null,
  name: "",
  code: "",
  type: "percentage",
  dateRange: [],
});

// Mock data fetching for edit mode
const sampleDiscounts = [
  {
    id: 1,
    name: "Giảm 20% tổng đơn hàng",
    code: "SALE20",
    startDate: "2025-08-01",
    endDate: "2025-08-31",
  },
  {
    id: 2,
    name: "Freeship cho đơn từ 500k",
    code: "FREESHIP500",
    startDate: "2025-08-01",
    endDate: "2025-08-31",
  },
  {
    id: 3,
    name: "Lễ Quốc Khánh - Giảm 50k",
    code: "MUNG2THANG9",
    startDate: "2025-09-01",
    endDate: "2025-09-02",
  },
  {
    id: 4,
    name: "Chào hè - Giảm 15%",
    code: "SUMMER15",
    startDate: "2025-06-01",
    endDate: "2025-07-31",
  },
  {
    id: 5,
    name: "Giảm 100k cho khách hàng VIP",
    code: "VIP100K",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
  },
];

onMounted(() => {
  const discountId = route.params.id;
  if (discountId) {
    isEditMode.value = true;
    // In a real app, you'd fetch this from an API
    const discountToEdit = sampleDiscounts.find((d) => d.id == discountId);
    if (discountToEdit) {
      form.id = discountToEdit.id;
      form.name = discountToEdit.name;
      form.code = discountToEdit.code;
      form.dateRange = [
        new Date(discountToEdit.startDate),
        new Date(discountToEdit.endDate),
      ];
    }
  }
});

const goBack = () => {
  router.push({ name: "Discounts" });
};

const handleSubmit = () => {
  // Basic validation
  if (!form.name || !form.code || form.dateRange.length === 0) {
    ElMessage.error("Vui lòng điền đầy đủ các trường bắt buộc.");
    return;
  }

  if (isEditMode.value) {
    console.log("Updating discount:", form);
    ElMessage.success("Cập nhật khuyến mại thành công!");
  } else {
    console.log("Creating discount:", form);
    ElMessage.success("Tạo khuyến mại thành công!");
  }
  // In a real app, you would send data to a server here.
  goBack();
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
  max-width: 800px;
}
.el-select {
  width: 100%;
}
</style>
