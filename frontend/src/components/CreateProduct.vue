<template>
  <div class="create-product-page">
    <h1 class="page-title">{{ formTitle }}</h1>

    <div class="form-layout">
      <!-- Thông tin sản phẩm -->
      <div class="form-main">
        <div class="form-card">
          <h3 class="form-section-title">Thông tin sản phẩm</h3>
          <el-form
            :model="form"
            label-width="140px"
            :rules="rules"
            ref="formRef"
            class="el-form-clean"
          >
            <el-form-item label="Tên sản phẩm" prop="name" required>
              <el-input
                v-model="form.name"
                maxlength="320"
                show-word-limit
                placeholder="Nhập tên sản phẩm (tối đa 320 ký tự)"
              />
            </el-form-item>
            <el-form-item label="Mã sản phẩm (Code)" prop="code">
              <el-input
                v-model="form.code"
                maxlength="50"
                placeholder="Nhập mã sản phẩm (ví dụ: MILK002)"
              />
            </el-form-item>
            <el-form-item label="Mã SKU" prop="sku">
              <el-input
                v-model="form.sku"
                maxlength="50"
                placeholder="Nhập mã SKU (tối đa 50 ký tự)"
              />
            </el-form-item>
            <el-form-item label="Mã vạch/Barcode" prop="barcode">
              <el-input
                v-model="form.barcode"
                maxlength="50"
                placeholder="Nhập mã vạch/Barcode (tối đa 50 ký tự)"
              />
            </el-form-item>
            <el-form-item label="Đơn vị tính" prop="unit_id">
              <el-select
                v-model="form.unit_id"
                placeholder="Chọn đơn vị tính"
                filterable
                clearable
              >
                <el-option
                  v-for="u in units"
                  :key="u.id"
                  :label="u.name"
                  :value="u.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Mô tả">
              <el-input
                type="textarea"
                v-model="form.description"
                :rows="4"
                maxlength="100000"
                show-word-limit
                placeholder="Nhập mô tả sản phẩm"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- Thông tin giá -->
        <div class="form-card">
          <h3 class="form-section-title">Thông tin giá</h3>
          <el-form
            :model="form"
            label-width="140px"
            ref="priceFormRef"
            class="el-form-clean"
          >
            <el-form-item label="Giá bán" prop="selling_price">
              <el-input
                v-model="form.selling_price"
                placeholder="Nhập giá bán sản phẩm"
                :formatter="currencyFormatter"
                :parser="currencyParser"
                clearable
              />
            </el-form-item>
            <el-form-item label="Giá vốn" prop="cost_price">
              <el-input
                v-model="form.cost_price"
                placeholder="Nhập giá vốn sản phẩm"
                :formatter="currencyFormatter"
                :parser="currencyParser"
                clearable
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- Ảnh, phân loại -->
      <div class="form-side">
        <div class="form-card">
          <h3 class="form-section-title">Ảnh sản phẩm</h3>
          <el-upload
            class="avatar-uploader"
            action=""
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :on-change="handleImageChange"
          >
            <img
              v-if="form.imageUrl"
              :src="form.imageUrl"
              class="product-image-preview"
              alt="Ảnh sản phẩm"
            />
            <div v-else class="image-upload-placeholder">
              <div class="image-add-icon">+</div>
              <div class="image-upload-text">
                Kéo thả hoặc
                <el-link
                  type="primary"
                  :underline="false"
                  @click.stop.prevent="addImageFromUrl"
                  >thêm ảnh từ URL</el-link
                >
              </div>
              <div class="image-upload-note">
                Tải ảnh lên từ thiết bị<br />(Dung lượng tối đa 2MB)
              </div>
            </div>
          </el-upload>
        </div>

        <div class="form-card">
          <h3 class="form-section-title">Phân loại</h3>
          <el-form label-width="120px" class="el-form-clean">
            <el-form-item label="Danh mục" prop="category_id">
              <el-select
                v-model="form.category_id"
                placeholder="Chọn danh mục"
                filterable
                clearable
              >
                <el-option
                  v-for="c in categories"
                  :key="c.id"
                  :label="c.name"
                  :value="c.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Nhãn hiệu" prop="brand_id">
              <el-select
                v-model="form.brand_id"
                placeholder="Chọn nhãn hiệu"
                filterable
                clearable
              >
                <el-option
                  v-for="b in brands"
                  :key="b.id"
                  :label="b.name"
                  :value="b.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Loại sản phẩm">
              <el-select
                v-model="form.type"
                placeholder="Chọn loại sản phẩm"
                clearable
              >
                <el-option v-for="t in types" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
            <el-form-item label="Trạng thái">
              <el-switch v-model="form.is_active" active-text="Hoạt động" />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <div class="form-footer">
      <el-button @click="goBack">Quay lại</el-button>
      <el-button type="primary" @click="submit">Thêm sản phẩm</el-button>
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from "element-plus";
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  createProduct,
  getBrands,
  getCategories,
  getUnits,
} from "@/services/productService";

const router = useRouter();

const formRef = ref();

const form = reactive({
  code: "", // Mã sản phẩm
  name: "",
  sku: "",
  barcode: "",
  unit_id: "", // Đơn vị tính (ID)
  description: "",
  imageUrl: "",
  category_id: "", // Danh mục (ID)
  brand_id: "", // Nhãn hiệu (ID)
  type: "", // Loại sản phẩm (bỏ hoặc giữ lại nếu API ko cần)
  selling_price: "", // Giá bán
  cost_price: "", // Giá vốn
  is_active: true,
});

const categories = ref([]);
const brands = ref([]);
const units = ref([]);
const types = ref(["Gói", "Chai", "Hộp"]); // Giữ lại nếu cần cho UI khác

const rules = {
  name: [
    {
      required: true,
      message: "Tên sản phẩm không được để trống",
      trigger: "blur",
    },
  ],
  category_id: [
    { required: true, message: "Vui lòng chọn danh mục", trigger: "change" },
  ],
  brand_id: [
    { required: true, message: "Vui lòng chọn nhãn hiệu", trigger: "change" },
  ],
  unit_id: [
    { required: true, message: "Vui lòng chọn đơn vị tính", trigger: "change" },
  ],
  selling_price: [
    { required: true, message: "Vui lòng nhập giá bán", trigger: "blur" },
  ],
};

const formTitle = computed(() => "Thêm sản phẩm");

onMounted(async () => {
  try {
    const [brandsRes, catsRes, unitsRes] = await Promise.all([
      getBrands(),
      getCategories(),
      getUnits(),
    ]);

    if (brandsRes.data && brandsRes.data.success) {
      brands.value = brandsRes.data.data || [];
    }

    if (catsRes.data && catsRes.data.success) {
      // Api collections trả về { collections: [...], pagination: {...} }
      categories.value = catsRes.data.data.collections || [];
    }

    if (unitsRes.data && unitsRes.data.success) {
      units.value = unitsRes.data.data || [];
    }
  } catch (error) {
    console.error("Lỗi tải dữ liệu danh mục/thương hiệu:", error);
    ElMessage.error("Không thể tải danh sách danh mục/thương hiệu.");
  }
});

function currencyFormatter(value) {
  if (value === undefined || value === null || value === "") return "";
  const onlyNum = String(value).replace(/[^\d.-]/g, "");
  const parts = onlyNum.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${parts.join(".")} ₫`;
}
function currencyParser(value) {
  if (!value) return "";
  return String(value).replace(/[^\d.-]/g, "");
}

function beforeImageUpload(file) {
  // ... (giữ nguyên logic upload nếu cần)
  return true;
}
function handleImageChange(file) {
  // ... (giữ nguyên logic nếu cần)
}
async function addImageFromUrl() {
  // ... (giữ nguyên logic)
}

function goBack() {
  router.back();
}
async function submit() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const payload = {
          code: form.code,
          name: form.name,
          category_id: form.category_id,
          brand_id: form.brand_id,
          unit_id: form.unit_id,
          description: form.description,
          is_active: form.is_active,
          sku: form.sku,
          barcode: form.barcode,
          cost_price: Number(form.cost_price) || 0,
          selling_price: Number(form.selling_price) || 0,
        };

        await createProduct(payload);
        ElMessage.success("Thêm sản phẩm thành công!");
        goBack();
      } catch (error) {
        ElMessage.error(
          "Lỗi khi thêm sản phẩm: " +
            (error.response?.data?.message || error.message),
        );
      }
    }
  });
}
</script>

<style scoped>
/* ====== Theme tokens (dễ chỉnh) ====== */
:root {
  --card-bg: #fff;
  --card-border: #e5e7eb;
  --card-shadow: 0 6px 24px rgba(17, 24, 39, 0.06);
  --text-strong: #111827;
  --text-muted: #6b7280;
  --brand: #3b82f6; /* primary */
  --brand-weak: #e8f0fe;
}

.create-product-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 28px 16px 40px;
}
.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: var(--text-strong);
  letter-spacing: -0.02em;
}

.form-layout {
  display: flex;
  gap: 28px;
}
.form-main {
  flex: 2;
  min-width: 380px;
}
.form-side {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-strong);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.form-section-title::before {
  content: "";
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: linear-gradient(135deg, var(--brand), #60a5fa);
}

.form-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 18px;
  box-shadow: var(--card-shadow);
  transition: box-shadow 0.2s ease, transform 0.06s ease;
}
.form-card:hover {
  box-shadow: 0 10px 32px rgba(17, 24, 39, 0.1);
}

/* Header trong card có action (ví dụ: Bỏ chọn tất cả) */
.form-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Làm form gọn gàng hơn */
.el-form-clean :deep(.el-form-item) {
  margin-bottom: 14px;
}
.el-form-clean :deep(.el-form-item__label) {
  color: var(--text-muted);
}
.el-form-clean :deep(.el-input__wrapper),
.el-form-clean :deep(.el-textarea__inner),
.el-form-clean :deep(.el-select .el-input__wrapper) {
  border-radius: 10px;
}
.el-form-clean :deep(.el-input__wrapper:hover),
.el-form-clean :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 3px var(--brand-weak) inset;
}

.inline-addon {
  display: flex;
  justify-content: flex-end;
  margin: -4px 0 6px;
}

/* Upload ảnh */
.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.avatar-uploader:hover {
  border-color: var(--brand);
  background: #f5f9ff;
}
.product-image-preview {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}
.image-upload-placeholder {
  text-align: center;
  color: var(--text-muted);
  font-size: 1rem;
  padding: 16px 0 10px;
}
.image-add-icon {
  width: 44px;
  height: 44px;
  line-height: 44px;
  border-radius: 50%;
  border: 1px dashed #c7d2fe;
  background: #eef2ff;
  color: #4f46e5;
  margin: 0 auto 10px;
  font-weight: 700;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-upload-text {
  margin-bottom: 6px;
}
.image-upload-note {
  font-size: 12px;
  color: #9ca3af;
}

.form-note {
  font-size: 0.95rem;
  color: #6b7280;
  margin-left: 8px;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ml-8 {
  margin-left: 8px;
}
.inline-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.inline-list {
  display: grid;
  gap: 8px;
  margin: 8px 0 10px;
}
.weight-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Bảng tồn kho */
.stock-title {
  margin-top: 6px;
  font-size: 0.95rem;
  color: var(--text-muted);
}
.stock-table {
  margin-top: 8px;
  background: #f9fafb;
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px dashed #e5e7eb;
}
.stock-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 0.98rem;
}
.stock-row--head {
  color: var(--text-muted);
  border-bottom: 1px dashed #e5e7eb;
}

.form-footer {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 22px;
  padding-top: 12px;
  background: linear-gradient(180deg, transparent, #fff 30%);
}

/* Responsive */
@media (max-width: 1024px) {
  .form-layout {
    flex-direction: column;
    gap: 0;
  }
  .form-main,
  .form-side {
    min-width: 100%;
  }
}
</style>
