<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? 'Chỉnh sửa bảng giá' : 'Thêm bảng giá mới'"
    width="40%"
    max-width="500px"
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
      <el-form-item label="Mã sản phẩm" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="Nhập mã sản phẩm (ví dụ: SP006)"
        />
      </el-form-item>
      <el-form-item label="Tên sản phẩm" prop="name">
        <el-input v-model="formData.name" placeholder="Nhập tên sản phẩm" />
      </el-form-item>
      <el-form-item label="Giá bán" prop="price">
        <el-input-number
          v-model="formData.price"
          :min="0"
          :step="1000"
          controls-position="right"
          style="width: 100%"
          :formatter="formatThousand"
          :parser="parseThousand"
        />
      </el-form-item>
      <el-form-item label="Đơn vị" prop="unit">
        <el-input
          v-model="formData.unit"
          placeholder="ví dụ: Hộp, Gói, Chai..."
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onClose">Hủy</el-button>
        <el-button type="primary" @click="onSubmit" :loading="isSubmitting">
          {{ isEdit ? "Lưu thay đổi" : "Tạo" }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  catalog: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "submit"]);

const formRef = ref(null);
const formData = ref({
  code: "",
  name: "",
  price: 0,
  unit: "",
});
const isSubmitting = ref(false);

const isEdit = computed(() => !!props.catalog);
const isMobile = ref(window.innerWidth < 768);

const formRules = {
  code: [
    {
      required: true,
      message: "Mã sản phẩm không được để trống",
      trigger: "blur",
    },
  ],
  name: [
    {
      required: true,
      message: "Tên sản phẩm không được để trống",
      trigger: "blur",
    },
  ],
  price: [
    { required: true, message: "Giá bán không được để trống", trigger: "blur" },
    { type: "number", message: "Giá bán phải là một con số" },
  ],
  unit: [
    { required: true, message: "Đơn vị không được để trống", trigger: "blur" },
  ],
};

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      if (props.catalog) {
        formData.value = { ...props.catalog };
      } else {
        formData.value = { code: "", name: "", price: 0, unit: "" };
      }
      isSubmitting.value = false;
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
    console.log("Validation failed:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  window.addEventListener("resize", checkScreenSize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

function formatThousand(value) {
  if (!value && value !== 0) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function parseThousand(value) {
  return value.replace(/[^\d]/g, "");
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
