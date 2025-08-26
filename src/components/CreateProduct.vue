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
            <el-form-item label="Mã SKU">
              <el-input
                v-model="form.sku"
                maxlength="50"
                placeholder="Nhập mã SKU (tối đa 50 ký tự)"
              />
            </el-form-item>
            <el-form-item label="Mã vạch/Barcode">
              <el-input
                v-model="form.barcode"
                maxlength="50"
                placeholder="Nhập mã vạch/Barcode (tối đa 50 ký tự)"
              />
            </el-form-item>
            <el-form-item label="Đơn vị tính">
              <el-input v-model="form.unit" placeholder="Nhập đơn vị tính" />
            </el-form-item>
            <el-form-item label="Mô tả">
              <!-- Đơn giản hoá: dùng textarea (ảnh có rich-text) -->
              <el-input
                type="textarea"
                v-model="form.description"
                :rows="4"
                maxlength="100000"
                show-word-limit
                placeholder="Nhập mô tả sản phẩm"
              />
            </el-form-item>
            <div class="inline-addon">
              <el-link
                type="primary"
                @click="showShortDesc = !showShortDesc"
                :underline="false"
              >
                {{ showShortDesc ? "Ẩn mô tả ngắn" : "Thêm mô tả ngắn" }}
              </el-link>
            </div>
            <el-form-item v-if="showShortDesc" label="Mô tả ngắn">
              <el-input
                v-model="form.shortDesc"
                maxlength="320"
                show-word-limit
                placeholder="Nhập mô tả ngắn"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- Ảnh, kênh bán, phân loại, khung giao diện -->
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
          <div class="form-card-header">
            <h3 class="form-section-title">Kênh bán hàng</h3>
            <el-link
              type="primary"
              :underline="false"
              @click="uncheckAllChannels"
              >Bỏ chọn tất cả</el-link
            >
          </div>
          <div class="inline-row">
            <el-checkbox v-model="form.channelPOS">POS</el-checkbox>
            <span class="form-note">
              Áp dụng bảng giá
              <el-link type="primary" :underline="false" @click="goToPOS"
                >POS</el-link
              >
            </span>
          </div>
        </div>

        <div class="form-card">
          <h3 class="form-section-title">Phân loại</h3>
          <el-form label-width="120px" class="el-form-clean">
            <el-form-item label="Danh mục">
              <el-select
                v-model="form.category"
                placeholder="Chọn danh mục"
                filterable
                clearable
              >
                <el-option
                  v-for="c in categories"
                  :key="c"
                  :label="c"
                  :value="c"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Nhãn hiệu">
              <el-select
                v-model="form.brand"
                placeholder="Chọn nhãn hiệu"
                filterable
                clearable
              >
                <el-option v-for="b in brands" :key="b" :label="b" :value="b" />
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
            <el-form-item label="Tag">
              <div class="tag-row">
                <el-input
                  v-model="form.tags"
                  placeholder="Tìm kiếm hoặc thêm mới"
                  clearable
                />
                <el-link type="primary" :underline="false" class="ml-8"
                  >Danh sách tag</el-link
                >
              </div>
            </el-form-item>
          </el-form>
        </div>

        <div class="form-card">
          <h3 class="form-section-title">Khung giao diện</h3>
          <el-select v-model="form.templateKey" style="width: 100%">
            <el-option label="product" value="product" />
            <el-option label="service" value="service" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- Thông tin giá -->
    <div class="form-card">
      <h3 class="form-section-title">Thông tin giá</h3>
      <el-form label-width="120px" class="el-form-clean">
        <el-form-item label="Giá bán">
          <el-input
            v-model="form.price"
            placeholder="Nhập giá bán sản phẩm"
            :formatter="currencyFormatter"
            :parser="currencyParser"
            clearable
          />
        </el-form-item>
        <el-form-item label="Giá so sánh">
          <el-input
            v-model="form.comparePrice"
            placeholder="Nhập giá so sánh sản phẩm"
            :formatter="currencyFormatter"
            :parser="currencyParser"
            clearable
          />
        </el-form-item>
        <el-form-item label="Giá vốn">
          <el-input
            v-model="form.cost"
            placeholder="Nhập giá vốn sản phẩm"
            :formatter="currencyFormatter"
            :parser="currencyParser"
            clearable
          />
        </el-form-item>
        <el-checkbox v-model="form.tax">Áp dụng thuế</el-checkbox>
      </el-form>
    </div>

    <!-- Thông tin kho -->
    <div class="form-card">
      <h3 class="form-section-title">Thông tin kho</h3>
      <el-form label-width="120px" class="el-form-clean">
        <el-form-item label="Lưu kho tại">
          <el-select v-model="form.warehouse" placeholder="Chọn kho">
            <el-option label="Cửa hàng chính" value="main" />
            <el-option label="Kho phụ" value="sub" />
          </el-select>
        </el-form-item>
        <div class="inline-list">
          <el-checkbox v-model="form.manageStock"
            >Quản lý số lượng tồn kho</el-checkbox
          >
          <el-checkbox v-model="form.allowNegativeStock"
            >Cho phép bán âm</el-checkbox
          >
          <el-checkbox v-model="form.batchProduct"
            >Quản lý sản phẩm theo lô - HSD</el-checkbox
          >
        </div>
        <div class="stock-title">Bảng phân bổ tồn kho</div>
        <div class="stock-table">
          <div class="stock-row stock-row--head">
            <span>Kho lưu trữ</span>
            <span>Tồn kho</span>
          </div>
          <div class="stock-row">
            <span>Cửa hàng chính</span>
            <el-input
              v-model="form.stock"
              style="width: 120px"
              placeholder="0"
              :disabled="!form.manageStock"
            />
          </div>
        </div>
      </el-form>
    </div>

    <!-- Vận chuyển -->
    <div class="form-card">
      <h3 class="form-section-title">Vận chuyển</h3>
      <div class="inline-row">
        <el-checkbox v-model="form.needShipping"
          >Sản phẩm yêu cầu vận chuyển</el-checkbox
        >
      </div>
      <el-form label-width="120px" class="el-form-clean">
        <el-form-item label="Khối lượng">
          <div class="weight-row">
            <el-input
              v-model="form.weight"
              style="width: 140px"
              placeholder="0"
            />
            <el-select v-model="form.weightUnit" style="width: 96px">
              <el-option label="g" value="g" />
              <el-option label="kg" value="kg" />
            </el-select>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- Thuộc tính -->
    <div class="form-card">
      <h3 class="form-section-title">Thuộc tính</h3>
      <div class="form-hint">
        Sản phẩm có nhiều thuộc tính khác nhau. Ví dụ: kích thước, màu sắc.
      </div>
      <el-link type="primary" style="margin-top: 8px" :underline="false"
        >Thêm thuộc tính</el-link
      >
    </div>

    <!-- SEO -->
    <div class="form-card">
      <h3 class="form-section-title">Tối ưu SEO</h3>
      <div class="form-hint">
        Xin hãy nhập Tiêu đề và Mô tả để xem trước kết quả tìm kiếm của sản phẩm
        này.
      </div>
      <el-link type="primary" style="margin-top: 8px" :underline="false"
        >Tùy chỉnh SEO</el-link
      >
    </div>

    <div class="form-footer">
      <el-button @click="goBack">Quay lại</el-button>
      <el-button type="primary" @click="submit">Thêm sản phẩm</el-button>
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from "element-plus";
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const formRef = ref();
const showShortDesc = ref(false);

const form = reactive({
  name: "",
  sku: "",
  barcode: "",
  unit: "",
  description: "",
  shortDesc: "",
  imageUrl: "",
  channelPOS: true,
  category: "",
  brand: "",
  type: "",
  tags: "",
  price: "",
  comparePrice: "",
  cost: "",
  tax: false,
  warehouse: "main",
  manageStock: true,
  allowNegativeStock: false,
  batchProduct: false,
  stock: 0,
  needShipping: true,
  weight: 0,
  weightUnit: "g",
  templateKey: "product",
});

const categories = ref(["Thực phẩm", "Đồ uống", "Gia dụng"]);
const brands = ref(["Hảo Hảo", "Ajinomoto", "Vinamilk"]);
const types = ref(["Gói", "Chai", "Hộp"]);

const rules = {
  name: [
    {
      required: true,
      message: "Tên sản phẩm không được để trống",
      trigger: "blur",
    },
  ],
};

const formTitle = computed(() => "Thêm sản phẩm");

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
  const okType = ["image/png", "image/jpeg", "image/webp"].includes(file.type);
  if (!okType) {
    ElMessage.error("Ảnh phải là PNG/JPG/WebP!");
    return false;
  }
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error("Dung lượng ảnh tối đa 2MB!");
    return false;
  }
  return true;
}
function handleImageChange(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    form.imageUrl = e.target.result;
  };
  reader.readAsDataURL(file.raw);
}
async function addImageFromUrl() {
  try {
    const { value } = await ElMessageBox.prompt(
      "Nhập URL ảnh (PNG/JPG/WebP):",
      "Thêm ảnh từ URL",
      {
        confirmButtonText: "Thêm",
        cancelButtonText: "Hủy",
        inputPattern: /^(https?:\/\/).+\.(png|jpg|jpeg|webp)(\?.*)?$/i,
        inputErrorMessage: "URL không hợp lệ",
      }
    );
    form.imageUrl = value;
  } catch (e) {
    /* user canceled */
  }
}

function uncheckAllChannels() {
  form.channelPOS = false;
}
function goToPOS() {
  try {
    router.push({ path: "/pos" });
  } catch (_) {
    ElMessage.info("Đi tới trang POS");
  }
}

function goBack() {
  router.back();
}
function submit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      // TODO: Gửi dữ liệu lên server
      ElMessage.success("Đã thêm sản phẩm!");
      goBack();
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
