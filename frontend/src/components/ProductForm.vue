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

      <!-- Ảnh sản phẩm - Upload file thay vì nhập URL -->
      <el-form-item label="Ảnh sản phẩm">
        <div class="image-upload-area">
          <el-upload
            class="product-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImageChange"
          >
            <div v-if="imagePreview" class="image-preview-wrapper">
              <el-image
                :src="imagePreview"
                fit="contain"
                class="product-image-preview"
              >
                <template #error>
                  <div class="image-error-slot">Ảnh lỗi</div>
                </template>
              </el-image>
              <div class="image-overlay">
                <el-icon size="20"><Upload /></el-icon>
                <span>Thay ảnh</span>
              </div>
            </div>
            <div v-else class="image-placeholder">
              <el-icon size="28"><Picture /></el-icon>
              <span>Chọn ảnh</span>
              <small>JPG, PNG, WEBP · Tối đa 10MB</small>
            </div>
          </el-upload>
          <el-button
            v-if="imagePreview"
            type="danger"
            size="small"
            text
            @click.stop="removeImage"
          >
            Xóa ảnh
          </el-button>
        </div>
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Tồn kho hiện tại">
            <div class="stock-display">
              <span class="stock-number">{{ formData.stock }}</span>
              <span class="stock-unit">sản phẩm</span>
            </div>
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

      <!-- Stock Adjustment (only in edit mode) -->
      <div v-if="isEdit" class="stock-adjust-section">
        <div class="section-title">
          <el-icon><Box /></el-icon>
          <span>Nhập thêm tồn kho</span>
        </div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Chi nhánh">
              <el-select v-model="stockAdjust.storeId" placeholder="Chọn chi nhánh" style="width: 100%">
                <el-option v-for="s in stores" :key="s.id" :label="s.name" :value="s.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số lượng nhập thêm">
              <el-input-number
                v-model="stockAdjust.quantity"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
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
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { Upload, Picture, Box } from "@element-plus/icons-vue";
import {
  uploadProductImage,
  deleteProductImage,
} from "@/services/productService";
import inventoryService from "@/services/inventoryService";

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
  stock: 0,
  isActive: true,
});
const isSubmitting = ref(false);

// === Stock adjustment state ===
const stores = ref([]);
const stockAdjust = ref({ storeId: null, quantity: 0 });

const fetchStores = async () => {
  try {
    const res = await inventoryService.getStores();
    stores.value = res.data?.data || res.data || [];
  } catch (e) {
    console.error("Failed to fetch stores:", e);
  }
};

// Fetch stores on component init
fetchStores();

// === Image state ===
const imageFile = ref(null); // File mới chọn để upload
const imagePreview = ref(""); // URL preview (local blob hoặc server URL)
const hadExistingImage = ref(false); // Sản phẩm ban đầu có ảnh?
const imageRemoved = ref(false); // User click xóa ảnh?

const isEdit = computed(() => !!props.product);

// === Responsive ===
const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// === Validation rules ===
const formRules = {
  name: [
    { required: true, message: "Tên sản phẩm không được để trống", trigger: "blur" },
  ],
  brand: [
    { required: true, message: "Nhãn hiệu không được để trống", trigger: "blur" },
  ],
  type: [
    { required: true, message: "Loại sản phẩm không được để trống", trigger: "blur" },
  ],
};

// === Image handlers ===
function handleImageChange(uploadFile) {
  if (!uploadFile?.raw) return;
  const file = uploadFile.raw;
  if (!file.type.startsWith("image/")) {
    ElMessage.error("Chỉ được upload file ảnh!");
    return;
  }
  if (file.size / 1024 / 1024 > 10) {
    ElMessage.error("Dung lượng ảnh tối đa 10MB!");
    return;
  }
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
  imageRemoved.value = false;
}

function removeImage() {
  imageFile.value = null;
  imagePreview.value = "";
  imageRemoved.value = true;
}

// === Watch dialog open/close ===
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      imageFile.value = null;
      imageRemoved.value = false;
      stockAdjust.value = { storeId: null, quantity: 0 };

      if (props.product) {
        formData.value = {
          name: props.product.name || "",
          brand: props.product.brand || "",
          type: props.product.type || "",
          stock: props.product.stock || 0,
          isActive: props.product.isActive ?? true,
        };
        if (props.product.imageUrl) {
          imagePreview.value = props.product.imageUrl; // Already full URL from ProductList
          hadExistingImage.value = true;
        } else {
          imagePreview.value = "";
          hadExistingImage.value = false;
        }
      } else {
        formData.value = { name: "", brand: "", type: "", stock: 0, isActive: true };
        imagePreview.value = "";
        hadExistingImage.value = false;
      }
      isSubmitting.value = false;
      formRef.value?.clearValidate();
    }
  },
);

// === Actions ===
const onClose = () => {
  emit("close");
};

const onSubmit = async () => {
  if (!formRef.value) return;
  try {
    isSubmitting.value = true;
    await formRef.value.validate();

    const productId = props.product?.id;

    // Emit form data to parent (ProductList handles create/update API)
    emit("submit", { ...formData.value });

    // Handle image upload/delete for existing products (edit mode)
    if (isEdit.value && productId) {
      try {
        if (imageRemoved.value && hadExistingImage.value && !imageFile.value) {
          await deleteProductImage(productId);
        }
        if (imageFile.value) {
          await uploadProductImage(productId, imageFile.value);
        }
      } catch (imgErr) {
        console.error("Image operation error:", imgErr);
        ElMessage.warning("Lưu sản phẩm OK nhưng xử lý ảnh thất bại.");
      }

      // Handle stock adjustment
      if (stockAdjust.value.storeId && stockAdjust.value.quantity > 0) {
        try {
          // Get variant_id for this product
          const { getProductById } = await import("@/services/productService");
          const productRes = await getProductById(productId);
          const productData = productRes.data?.data || productRes.data;
          const variant = productData?.variants?.[0];
          if (variant) {
            await inventoryService.receiveInventory({
              store_id: stockAdjust.value.storeId,
              items: [{
                variant_id: variant.id,
                quantity: stockAdjust.value.quantity,
                unit_cost: variant.cost_price || 0
              }],
              notes: `Nhập thêm tồn kho từ chỉnh sửa sản phẩm`
            });
            ElMessage.success(`Đã nhập thêm ${stockAdjust.value.quantity} sản phẩm vào kho`);
          }
        } catch (stockErr) {
          console.error("Stock adjustment error:", stockErr);
          ElMessage.warning("Lưu sản phẩm OK nhưng nhập kho thất bại.");
        }
      }
    }
  } catch (error) {
    console.log("Validation failed:", error);
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

.image-upload-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.product-uploader {
  cursor: pointer;
}
.product-uploader :deep(.el-upload) {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.product-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.image-preview-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
}
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 6px;
}
.image-preview-wrapper:hover .image-overlay {
  opacity: 1;
}

.product-image-preview {
  width: 150px;
  height: 150px;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.image-placeholder {
  width: 150px;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #999;
  font-size: 13px;
}
.image-placeholder small {
  font-size: 11px;
  color: #bbb;
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
  height: 32px;
}

.stock-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  min-height: 32px;
}
.stock-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0369a1;
}
.stock-unit {
  font-size: 0.8rem;
  color: #64748b;
}

.stock-adjust-section {
  margin-top: 8px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 12px;
  font-size: 0.9rem;
}
</style>
