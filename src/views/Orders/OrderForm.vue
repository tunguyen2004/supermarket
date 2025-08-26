<template>
  <div class="order-page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        {{ isEditMode ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng" }}
      </h1>
    </div>

    <!-- Grid 2 cột -->
    <div class="order-grid">
      <!-- Cột trái -->
      <div class="grid-left">
        <!-- SẢN PHẨM -->
        <el-card class="card">
          <template #header>
            <div class="card-header">
              <span class="card-title">Sản phẩm</span>
              <div class="product-tools">
                <el-checkbox v-model="splitLines">Tách dòng</el-checkbox>
                <el-button size="small" @click="openProductPicker"
                  >Chọn nhiều</el-button
                >
              </div>
            </div>
          </template>

          <div class="product-search">
            <el-input
              v-model="productQuery"
              placeholder="Tìm theo tên, mã SKU... (F3)"
              clearable
              @keyup.enter="addProductFromSearch"
            />
          </div>

          <div v-if="!order.items.length" class="product-empty">
            <el-empty description="Bạn chưa thêm sản phẩm nào">
              <el-button type="primary" @click="addProduct"
                >Thêm sản phẩm</el-button
              >
            </el-empty>
          </div>

          <el-table v-else :data="order.items" class="product-table" border>
            <el-table-column prop="name" label="Tên sản phẩm" min-width="240">
              <template #default="scope">
                <el-input
                  v-model="scope.row.name"
                  placeholder="Nhập tên sản phẩm"
                  clearable
                />
              </template>
            </el-table-column>

            <el-table-column label="Số lượng" width="140" align="center">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  :min="1"
                  :step="1"
                  size="small"
                />
              </template>
            </el-table-column>

            <el-table-column label="Đơn giá" width="180" align="right">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.price"
                  :min="0"
                  :step="500"
                  size="small"
                  class="price-input"
                  :formatter="(n) => formatCurrency(n, false)"
                  :parser="parseNumber"
                />
                <span class="currency-suffix">đ</span>
              </template>
            </el-table-column>

            <el-table-column label="Thành tiền" width="180" align="right">
              <template #default="scope">
                <span>{{
                  formatCurrency(scope.row.quantity * scope.row.price)
                }}</span>
              </template>
            </el-table-column>

            <el-table-column width="72" align="center">
              <template #default="scope">
                <el-button
                  type="danger"
                  :icon="Delete"
                  text
                  @click="removeProduct(scope.$index)"
                />
              </template>
            </el-table-column>
          </el-table>

          <div class="product-actions">
            <el-button type="primary" plain @click="addProduct"
              >Thêm sản phẩm</el-button
            >
            <el-link
              type="primary"
              :icon="Plus"
              @click="addCustomItem"
              class="add-custom-link"
            >
              Thêm sản phẩm hoặc dịch vụ tuỳ chỉnh
            </el-link>
          </div>
        </el-card>

        <!-- THANH TOÁN -->
        <el-card class="card">
          <template #header>
            <span class="card-title">Thanh toán</span>
          </template>

          <div class="summary-row">
            <span>Tổng tiền hàng</span>
            <span class="amount">{{ formatCurrency(subtotal) }}</span>
          </div>

          <div class="summary-row">
            <span>Thêm giảm giá</span>
            <div class="amount-edit">
              <el-input-number
                v-model="discount"
                :min="0"
                :step="500"
                size="small"
                :formatter="(n) => formatCurrency(n, false)"
                :parser="parseNumber"
                class="compact-number"
              />
              <span class="currency-suffix">đ</span>
            </div>
          </div>

          <div class="summary-row">
            <span>Thêm phí giao hàng</span>
            <div class="amount-edit">
              <el-input-number
                v-model="shippingFee"
                :min="0"
                :step="1000"
                size="small"
                :formatter="(n) => formatCurrency(n, false)"
                :parser="parseNumber"
                class="compact-number"
              />
              <span class="currency-suffix">đ</span>
            </div>
          </div>

          <div class="summary-row total">
            <span>Thành tiền</span>
            <span class="amount">{{ formatCurrency(grandTotal) }}</span>
          </div>
        </el-card>
      </div>

      <!-- Cột phải -->
      <div class="grid-right">
        <!-- Nguồn đơn -->
        <el-card class="card">
          <template #header>
            <span class="card-title">Nguồn đơn</span>
          </template>
          <el-form :model="order" label-position="top" class="tight-form">
            <el-form-item label="Chọn nguồn đơn">
              <el-select
                v-model="order.source"
                placeholder="Chọn nguồn đơn"
                filterable
                clearable
              >
                <el-option label="Cửa hàng" value="store" />
                <el-option label="Facebook" value="facebook" />
                <el-option label="Shopee" value="shopee" />
                <el-option label="Lazada" value="lazada" />
                <el-option label="Website" value="website" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Khách hàng -->
        <el-card class="card">
          <template #header>
            <span class="card-title">Khách hàng</span>
          </template>
          <el-form :model="order" label-position="top" class="tight-form">
            <el-form-item label="Tìm theo tên, SDT...(F4)">
              <el-input
                v-model="order.customerName"
                placeholder="Nhập tên/SDT khách hàng"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Ghi chú -->
        <el-card class="card">
          <template #header>
            <span class="card-title">Ghi chú</span>
          </template>
          <el-input
            v-model="order.note"
            type="textarea"
            :rows="3"
            placeholder="VD: Nhận hàng ghi công nợ"
          />
        </el-card>

        <!-- Thông tin bổ sung -->
        <el-card class="card">
          <template #header>
            <span class="card-title">Thông tin bổ sung</span>
          </template>
          <el-form :model="order" label-position="top" class="tight-form">
            <el-form-item label="Bán tại chi nhánh">
              <el-select v-model="order.branch" placeholder="Chọn chi nhánh">
                <el-option label="Cửa hàng chính" value="main" />
                <el-option label="Chi nhánh 2" value="branch2" />
              </el-select>
            </el-form-item>

            <el-form-item label="Nhân viên phụ trách">
              <el-select
                v-model="order.staff"
                placeholder="Chọn nhân viên"
                filterable
              >
                <el-option label="NGUYỄN ANH TÚ" value="tunguyen" />
                <el-option label="TRẦN MINH HÀ" value="haminh" />
              </el-select>
            </el-form-item>

            <el-form-item label="Ngày đặt hàng">
              <el-date-picker
                v-model="order.orderDate"
                type="date"
                placeholder="Chọn ngày đặt hàng"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item label="Ngày hẹn giao">
              <el-date-picker
                v-model="order.deliveryDate"
                type="date"
                placeholder="Chọn ngày hẹn giao"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item label="Tag">
              <el-select
                v-model="order.tags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="Tìm kiếm hoặc thêm mới tag"
                class="full-width"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>

    <!-- Action bar dưới cùng -->
    <div class="page-actions">
      <el-button @click="saveDraft">Lưu nháp</el-button>

      <el-dropdown @command="onCreateCommand">
        <el-button
          type="primary"
          class="confirm-btn"
          split-button
          @click="createAndConfirm"
        >
          Tạo đơn và xác nhận
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="create_print"
              >Tạo đơn &amp; in hoá đơn</el-dropdown-item
            >
            <el-dropdown-item command="create_ship"
              >Tạo đơn &amp; tạo vận đơn</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Plus } from "@element-plus/icons-vue";
import { addOrder } from "@/services/orderService";

const router = useRouter();
const isEditMode = computed(() => !!router.currentRoute.value.params.id);

const splitLines = ref(false);
const productQuery = ref("");

const order = ref({
  source: null,
  customerName: "",
  customerPhone: "",
  note: "",
  branch: "main",
  staff: "tunguyen",
  orderDate: "",
  deliveryDate: "",
  tags: [],
  items: [
    { name: "Mì Hảo Hảo", quantity: 2, price: 3500 },
    { name: "Trứng gà", quantity: 10, price: 2500 },
  ],
});

const discount = ref(0);
const shippingFee = ref(0);

const subtotal = computed(() =>
  order.value.items.reduce(
    (t, i) => t + (Number(i.quantity) || 0) * (Number(i.price) || 0),
    0
  )
);

const grandTotal = computed(() => {
  const total =
    subtotal.value -
    (Number(discount.value) || 0) +
    (Number(shippingFee.value) || 0);
  return Math.max(0, total);
});

const addProduct = () => {
  order.value.items.push({ name: "", quantity: 1, price: 0 });
};

const addProductFromSearch = () => {
  if (!productQuery.value?.trim()) return;
  order.value.items.push({
    name: productQuery.value.trim(),
    quantity: 1,
    price: 0,
  });
  productQuery.value = "";
};

const addCustomItem = () => addProduct();

const openProductPicker = () => {
  ElMessage.info("Màn chọn nhiều sản phẩm: bạn có thể gắn dialog ở đây.");
};

const removeProduct = (idx) => {
  order.value.items.splice(idx, 1);
};

const parseNumber = (v) => String(v).replace(/[^\d]/g, "");

const formatCurrency = (val, withSuffix = true) => {
  const n = Number(val) || 0;
  const s = n.toLocaleString("vi-VN");
  return withSuffix ? `${s}đ` : s;
};

const saveDraft = async () => {
  try {
    await addOrder({
      ...order.value,
      status: "draft",
      discount: discount.value,
      shippingFee: shippingFee.value,
      total: grandTotal.value,
    });
    ElMessage.success("Đã lưu nháp đơn hàng!");
    router.push("/orders");
  } catch (e) {
    ElMessage.error("Không thể lưu nháp. Vui lòng thử lại.");
    console.error(e);
  }
};

const createAndConfirm = async () => {
  try {
    await addOrder({
      ...order.value,
      status: "confirmed",
      discount: discount.value,
      shippingFee: shippingFee.value,
      total: grandTotal.value,
    });
    ElMessage.success("Đã tạo đơn và xác nhận!");
    router.push("/orders");
  } catch (e) {
    ElMessage.error("Có lỗi khi tạo đơn.");
    console.error(e);
  }
};

const onCreateCommand = (cmd) => {
  if (cmd === "create_print") {
    ElMessageBox.alert(
      "Thao tác in hoá đơn sẽ được thực hiện sau khi tạo đơn.",
      "Thông báo"
    );
    createAndConfirm();
  }
  if (cmd === "create_ship") {
    ElMessage.info("Tạo vận đơn: bạn có thể tích hợp hãng vận chuyển tại đây.");
    createAndConfirm();
  }
};
</script>

<style scoped>
/* Layout */
.order-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.order-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.grid-left,
.grid-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-weight: 600;
}

.product-tools {
  display: flex;
  gap: 12px;
  align-items: center;
}

.product-search {
  margin-bottom: 12px;
}

.product-empty {
  padding: 8px 0 4px;
}

.product-table :deep(.el-input__wrapper) {
  width: 100%;
}

.price-input {
  width: 140px;
}

.currency-suffix {
  margin-left: 6px;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.add-custom-link {
  font-weight: 500;
}

/* Thanh toán */
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}

.summary-row .amount {
  font-variant-numeric: tabular-nums;
}

.summary-row.total {
  font-weight: 700;
}

.amount-edit {
  display: flex;
  align-items: center;
}

.compact-number {
  width: 160px;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.confirm-btn {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 1100px) {
  .order-grid {
    grid-template-columns: 1fr;
  }
}
</style>
