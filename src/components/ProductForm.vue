<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'"
    width="90%"
    max-width="800px"
    @close="onClose"
    :fullscreen="isMobile"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-position="top"
      @submit.prevent="onSubmit"
    >
      <el-row :gutter="20">
        <el-col :span="24" :md="12">
          <el-form-item label="Tên sản phẩm" prop="name">
            <el-input v-model="formData.name" placeholder="Nhập tên sản phẩm" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :md="12">
          <el-form-item label="Nhãn hiệu" prop="brand">
            <el-input v-model="formData.brand" placeholder="Nhập nhãn hiệu" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Loại sản phẩm" prop="type">
        <el-input v-model="formData.type" placeholder="Nhập loại sản phẩm" />
      </el-form-item>

      <el-form-item label="URL hình ảnh" prop="imageUrl">
        <el-input
          v-model="formData.imageUrl"
          placeholder="https://example.com/image.png"
          clearable
        />
      </el-form-item>

      <el-image
        v-if="formData.imageUrl"
        :src="formData.imageUrl"
        fit="contain"
        class="product-image-preview"
      >
        <template #error>
          <div class="image-error-slot">Ảnh lỗi</div>
        </template>
      </el-image>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Tồn kho" prop="stock">
            <el-input-number
              v-model="formData.stock"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Trạng thái">
            <div class="switch-container">
              <el-switch
                v-model="formData.isActive"
                active-text="Đang hoạt động"
                inactive-text="Ngừng hoạt động"
              />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onClose">Hủy</el-button>
        <el-button type="primary" @click="onSubmit" :loading="isSubmitting">
          {{ isEdit ? "Lưu thay đổi" : "Tạo sản phẩm" }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { useBreakpoints } from "@vueuse/core"; // ✨ Cải tiến: Dùng VueUse

const props = defineProps({
  visible: { type: Boolean, required: true },
  product: { type: Object, default: null },
});

const emit = defineEmits(["close", "submit"]);

const formRef = ref(null);
const formData = ref({
  name: "",
  brand: "",
  type: "",
  imageUrl: "",
  stock: 0,
  isActive: true,
});
const isSubmitting = ref(false);

const isEdit = computed(() => !!props.product);

// ✨ Cải tiến: Dùng useBreakpoints để xử lý responsive một cách hiện đại
const breakpoints = useBreakpoints({ mobile: 768 });
const isMobile = breakpoints.smaller("mobile");

// ✨ Cải tiến: Thêm rule xác thực cho imageUrl
const formRules = {
  name: [
    {
      required: true,
      message: "Tên sản phẩm không được để trống",
      trigger: "blur",
    },
  ],
  brand: [
    {
      required: true,
      message: "Nhãn hiệu không được để trống",
      trigger: "blur",
    },
  ],
  type: [
    {
      required: true,
      message: "Loại sản phẩm không được để trống",
      trigger: "blur",
    },
  ],
  stock: [
    {
      required: true,
      message: "Số lượng tồn kho là bắt buộc",
      trigger: "blur",
    },
  ],
  imageUrl: [
    {
      type: "url",
      message: "Vui lòng nhập một URL hợp lệ",
      trigger: ["blur", "change"],
    },
  ],
};

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      if (props.product) {
        formData.value = { ...props.product };
      } else {
        // Reset form
        formData.value = {
          name: "",
          brand: "",
          type: "",
          imageUrl: "",
          stock: 0,
          isActive: true,
        };
      }
      isSubmitting.value = false;
      // Xóa validation cũ khi mở lại dialog
      formRef.value?.clearValidate();
    }
  }
);

const onClose = () => {
  emit("close");
};

const onSubmit = async () => {
  if (!formRef.value) return;
  try {
    isSubmitting.value = true;
    await formRef.value.validate();
    emit("submit", formData.value);
  } catch (error) {
    // Validation error is handled by el-form, which highlights fields.
    // We can log the error for debugging but avoid showing a generic message.
    console.log('Validation failed:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.product-image-preview {
  width: 150px;
  height: 150px;
  margin-top: -10px; /* Bù lại khoảng trống của form-item */
  margin-bottom: 22px; /* Tạo khoảng cách với hàng tiếp theo */
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background-color: #f9f9f9;
}

.image-error-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.switch-container {
  display: flex;
  align-items: center;
  /* Chiều cao của el-input mặc định để căn chỉnh */
  height: 32px;
}
</style>
