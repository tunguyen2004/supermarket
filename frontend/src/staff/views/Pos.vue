<template>
  <div class="pos-grid">
    <!-- LEFT: Scan + Quick add -->
    <section class="card scan-card">
      <div class="card-head">
        <div class="title">
          <span class="dot"></span>
          Quét mã / Tìm sản phẩm
        </div>
        <div class="hint">F2 để focus · Enter để thêm</div>
      </div>

      <el-input
        ref="barcodeRef"
        v-model="barcode"
        size="large"
        placeholder="Quét mã vạch hoặc nhập mã SKU…"
        clearable
        @keyup.enter="handleScanEnter"
      >
        <template #prepend>Mã</template>
        <template #append>
          <el-button type="success" @click="handleScanEnter">Thêm</el-button>
        </template>
      </el-input>

      <div style="height: 10px" />

      <el-input
        v-model="keyword"
        placeholder="Tìm theo tên (vd: mì tôm, sữa…) — Enter để tìm"
        clearable
        @keyup.enter="searchProducts"
      >
        <template #prepend>Tìm</template>
        <template #append>
          <el-button @click="searchProducts">Tìm</el-button>
        </template>
      </el-input>

      <div class="search-list">
        <div class="search-head">
          <span>Kết quả</span>
          <span class="muted">{{ searchResults.length }} sản phẩm</span>
        </div>

        <div v-if="loadingSearch" class="loading">
          <el-skeleton :rows="4" animated />
        </div>

        <div v-else class="items">
          <div
            v-for="p in searchResults"
            :key="p.id"
            class="item"
            @click="addToCart(p)"
          >
            <div class="item-main">
              <div class="item-name">{{ p.name }}</div>
              <div class="item-sub">
                <span class="badge">SKU: {{ p.sku || p.barcode || "—" }}</span>
                <span class="badge soft">Tồn: {{ p.stock ?? "—" }}</span>
              </div>
            </div>
            <div class="item-price">{{ format(p.price) }}</div>
          </div>

          <div v-if="!searchResults.length" class="empty">
            Không có kết quả. Hãy quét mã hoặc tìm theo tên.
          </div>
        </div>
      </div>
    </section>

    <!-- CENTER: Cart -->
    <section class="card cart-card">
      <div class="card-head cart-head">
        <div class="title">
          <span class="dot"></span>
          Giỏ hàng
        </div>

        <div class="cart-tools">
          <el-button
            round
            type="danger"
            plain
            @click="clearCartConfirm"
            :disabled="!cart.length"
          >
            Xóa giỏ
          </el-button>
        </div>
      </div>

      <el-table
        :data="cart"
        height="520"
        stripe
        border
        highlight-current-row
        @current-change="onRowSelect"
        class="pos-table"
      >
        <el-table-column type="index" width="55" label="#" />
        <el-table-column prop="name" label="Sản phẩm" min-width="220">
          <template #default="{ row }">
            <div class="pname">{{ row.name }}</div>
            <div class="psub">SKU: {{ row.sku || row.barcode || "—" }}</div>
          </template>
        </el-table-column>

        <el-table-column label="SL" width="160" align="center">
          <template #default="{ row }">
            <div class="qty">
              <el-button circle @click="decQty(row)" :disabled="row.qty <= 1"
                >-</el-button
              >
              <el-input-number
                v-model="row.qty"
                :min="1"
                :max="999"
                controls-position="right"
                size="small"
                @change="recalc"
              />
              <el-button circle @click="incQty(row)">+</el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Đơn giá" width="140" align="right">
          <template #default="{ row }">
            <span class="money">{{ format(row.price) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Thành tiền" width="160" align="right">
          <template #default="{ row }">
            <span class="money strong">{{ format(row.price * row.qty) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="" width="70" align="center">
          <template #default="{ row }">
            <el-button type="danger" circle plain @click="removeItem(row)"
              >✕</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="cart-foot">
        <div class="shortcut">
          <b>Phím tắt:</b> F2 focus quét · Del xóa dòng · Ctrl+Del xóa giỏ · F4
          thanh toán
        </div>
      </div>
    </section>

    <!-- RIGHT: Payment -->
    <section class="card pay-card">
      <div class="card-head">
        <div class="title">
          <span class="dot"></span>
          Thanh toán
        </div>
        <div class="hint">F4 để thanh toán</div>
      </div>

      <div class="sum-box">
        <div class="sum-row">
          <span>Tạm tính</span>
          <b>{{ format(subtotal) }}</b>
        </div>

        <div class="sum-row">
          <span>Giảm giá</span>
          <div class="disc-row">
            <el-select v-model="discountType" size="small" style="width: 92px">
              <el-option label="%" value="percent" />
              <el-option label="VND" value="amount" />
            </el-select>
            <el-input-number
              v-model="discountValue"
              :min="0"
              :max="discountType === 'percent' ? 100 : 999999999"
              size="small"
              controls-position="right"
              style="width: 150px"
              @change="recalc"
            />
          </div>
        </div>

        <div class="sum-row grand">
          <span>Tổng cần thu</span>
          <b>{{ format(grandTotal) }}</b>
        </div>
      </div>

      <div class="pay-box">
        <div class="field">
          <div class="label">Phương thức</div>
          <el-radio-group v-model="paymentMethod">
            <el-radio-button label="cash">Tiền mặt</el-radio-button>
            <el-radio-button label="card">Thẻ</el-radio-button>
            <el-radio-button label="qr">QR</el-radio-button>
          </el-radio-group>
        </div>

        <div class="field">
          <div class="label">Khách đưa</div>
          <el-input-number
            v-model="cashReceived"
            :min="0"
            :max="999999999"
            controls-position="right"
            style="width: 100%"
            @change="recalc"
          />
        </div>

        <div class="change">
          <span>Tiền thối</span>
          <b :class="{ negative: change < 0 }">{{ format(change) }}</b>
        </div>

        <div class="pay-actions">
          <el-button
            type="success"
            size="large"
            class="btn-pay"
            :disabled="
              !cart.length ||
              grandTotal <= 0 ||
              (paymentMethod === 'cash' && cashReceived < grandTotal)
            "
            @click="openCheckoutConfirm"
          >
            Thanh toán (F4)
          </el-button>

          <el-button
            type="info"
            size="large"
            plain
            :disabled="!cart.length"
            @click="holdBill"
          >
            Lưu tạm
          </el-button>
        </div>
      </div>

      <div class="note">
        <div class="note-title">Gợi ý thao tác nhanh</div>
        <ul>
          <li>Máy quét thường tự Enter sau khi quét → tự thêm vào giỏ.</li>
          <li>Nếu quét trùng, hệ thống tự tăng số lượng.</li>
          <li>Chọn dòng rồi bấm <b>Del</b> để xóa.</li>
        </ul>
      </div>
    </section>

    <!-- Confirm checkout -->
    <el-dialog
      v-model="checkoutDialog"
      width="460px"
      class="nice-dialog"
      title="Xác nhận thanh toán"
    >
      <div class="confirm-box">
        <div class="confirm-row">
          <span>Số món</span>
          <b>{{ cart.length }}</b>
        </div>
        <div class="confirm-row">
          <span>Tổng cần thu</span>
          <b>{{ format(grandTotal) }}</b>
        </div>
        <div class="confirm-row" v-if="paymentMethod === 'cash'">
          <span>Khách đưa</span>
          <b>{{ format(cashReceived) }}</b>
        </div>
        <div class="confirm-row" v-if="paymentMethod === 'cash'">
          <span>Tiền thối</span>
          <b>{{ format(change) }}</b>
        </div>

        <div
          class="confirm-warn"
          v-if="paymentMethod === 'cash' && cashReceived < grandTotal"
        >
          Tiền khách đưa chưa đủ.
        </div>
      </div>

      <template #footer>
        <el-button @click="checkoutDialog = false">Hủy</el-button>
        <el-button type="success" :disabled="paying" @click="checkout">
          {{ paying ? "Đang xử lý..." : "Xác nhận" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import formatCurrency from "@/utils/formatCurrency";

// 🔌 Plug services của bạn ở đây (tùy API bạn đang có)
import productService from "@/services/productService";
import orderService from "@/services/orderService";

const barcodeRef = ref(null);

const barcode = ref("");
const keyword = ref("");
const loadingSearch = ref(false);
const searchResults = ref([]);

const cart = ref([]);
const selectedRow = ref(null);

const discountType = ref("percent"); // percent | amount
const discountValue = ref(0);

const paymentMethod = ref("cash"); // cash | card | qr
const cashReceived = ref(0);

const checkoutDialog = ref(false);
const paying = ref(false);

const subtotal = computed(() =>
  cart.value.reduce((sum, it) => sum + it.price * it.qty, 0),
);

const discountAmount = computed(() => {
  if (discountType.value === "percent") {
    return Math.round((subtotal.value * discountValue.value) / 100);
  }
  return Math.min(discountValue.value || 0, subtotal.value);
});

const grandTotal = computed(() =>
  Math.max(subtotal.value - discountAmount.value, 0),
);

const change = computed(() => {
  if (paymentMethod.value !== "cash") return 0;
  return (cashReceived.value || 0) - grandTotal.value;
});

function format(v) {
  return formatCurrency(v || 0);
}

function focusBarcode() {
  // Element Plus input focus: ref.value?.focus()
  barcodeRef.value?.focus?.();
}

function recalc() {
  // computed tự tính, hàm này chỉ để trigger update nếu cần
}

function onRowSelect(row) {
  selectedRow.value = row || null;
}

function addToCart(p) {
  if (!p) return;
  const existing = cart.value.find((x) => x.id === p.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.value.push({
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      price: Number(p.price || 0),
      qty: 1,
    });
  }
  barcode.value = "";
  focusBarcode();
}

function incQty(row) {
  row.qty += 1;
}
function decQty(row) {
  if (row.qty > 1) row.qty -= 1;
}
function removeItem(row) {
  cart.value = cart.value.filter((x) => x.id !== row.id);
}

async function clearCartConfirm() {
  try {
    await ElMessageBox.confirm("Xóa toàn bộ giỏ hàng hiện tại?", "Xác nhận", {
      type: "warning",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      autofocus: false,
    });
    cart.value = [];
    selectedRow.value = null;
    ElMessage.success("Đã xóa giỏ hàng");
    focusBarcode();
  } catch (e) {
    // cancel
  }
}

/** ========== Search / Scan ========== */
async function searchProducts() {
  const q = keyword.value?.trim();
  if (!q) return;

  loadingSearch.value = true;
  try {
    // 🔧 Bạn map lại theo API thật của bạn:
    // Ví dụ: productService.search({ keyword: q })
    const res = await productService.searchProducts?.(q);

    // Giả định trả về { data: { data: [...] } } hoặc [...]
    const data = res?.data?.data ?? res?.data ?? res ?? [];
    searchResults.value = (data || []).map(normalizeProduct);
  } catch (err) {
    console.error(err);
    ElMessage.error("Không thể tìm sản phẩm");
  } finally {
    loadingSearch.value = false;
  }
}

async function handleScanEnter() {
  const code = barcode.value?.trim();
  if (!code) return;

  try {
    // 🔧 Bạn map lại theo API thật của bạn:
    // Ví dụ: productService.getByBarcode(code)
    const res = await productService.getByBarcode?.(code);

    const pRaw = res?.data?.data ?? res?.data ?? res;
    const p = normalizeProduct(pRaw);

    if (!p?.id) {
      ElMessage.warning("Không tìm thấy sản phẩm theo mã này");
      return;
    }

    addToCart(p);
  } catch (err) {
    console.error(err);
    ElMessage.warning("Không tìm thấy sản phẩm theo mã này");
  }
}

function normalizeProduct(p) {
  if (!p) return {};
  return {
    id: p.id ?? p.product_id,
    name: p.name ?? p.product_name ?? "Sản phẩm",
    sku: p.sku ?? p.sku_code,
    barcode: p.barcode ?? p.bar_code,
    price: Number(p.price ?? p.selling_price ?? 0),
    stock: p.stock ?? p.quantity_in_stock,
  };
}

/** ========== Checkout ========== */
function openCheckoutConfirm() {
  checkoutDialog.value = true;
}

async function checkout() {
  if (!cart.value.length) return;
  if (paymentMethod.value === "cash" && cashReceived.value < grandTotal.value) {
    ElMessage.error("Tiền khách đưa chưa đủ!");
    return;
  }

  paying.value = true;
  try {
    const payload = {
      items: cart.value.map((x) => ({
        product_id: x.id,
        quantity: x.qty,
        price: x.price,
      })),
      discount_type: discountType.value,
      discount_value: discountValue.value,
      discount_amount: discountAmount.value,
      subtotal: subtotal.value,
      total: grandTotal.value,
      payment_method: paymentMethod.value,
      cash_received: paymentMethod.value === "cash" ? cashReceived.value : 0,
      change: paymentMethod.value === "cash" ? change.value : 0,
    };

    // 🔧 Bạn map lại theo API thật của bạn:
    // ví dụ: orderService.createPosOrder(payload)
    await orderService.createPosOrder?.(payload);

    checkoutDialog.value = false;
    ElMessage.success("Thanh toán thành công!");

    // reset
    cart.value = [];
    selectedRow.value = null;
    barcode.value = "";
    keyword.value = "";
    discountType.value = "percent";
    discountValue.value = 0;
    paymentMethod.value = "cash";
    cashReceived.value = 0;

    focusBarcode();
  } catch (err) {
    console.error(err);
    ElMessage.error("Thanh toán thất bại (kiểm tra lại API)");
  } finally {
    paying.value = false;
  }
}

function holdBill() {
  ElMessage.info("Chức năng lưu tạm: bạn có thể nối API để lưu draft bill.");
}

/** ========== Keyboard shortcuts ========== */
function onKeydown(e) {
  // F2 focus scan
  if (e.key === "F2") {
    e.preventDefault();
    focusBarcode();
  }

  // F4 checkout
  if (e.key === "F4") {
    e.preventDefault();
    if (cart.value.length) openCheckoutConfirm();
  }

  // Del remove selected row
  if (e.key === "Delete" && !e.ctrlKey) {
    if (selectedRow.value) removeItem(selectedRow.value);
  }

  // Ctrl+Del clear cart
  if (e.key === "Delete" && e.ctrlKey) {
    clearCartConfirm();
  }
}

onMounted(() => {
  focusBarcode();
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
.pos-grid {
  display: grid;
  grid-template-columns: 340px 1fr 360px;
  gap: 14px;
  align-items: start;
}

/* Card base */
.card {
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfffd 100%);
  border: 1px solid rgba(16, 185, 129, 0.14);
  box-shadow: 0 12px 26px rgba(16, 24, 40, 0.06);
  overflow: hidden;
}

.card-head {
  padding: 12px 12px 10px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  border-bottom: 1px solid rgba(16, 185, 129, 0.12);
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.1) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}
.title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  color: #064e3b;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.14);
}
.hint {
  font-size: 0.85rem;
  color: #0f766e;
  font-weight: 700;
  opacity: 0.9;
}

.scan-card {
  padding: 12px;
}
.search-list {
  margin-top: 12px;
  border-radius: 14px;
  border: 1px solid rgba(16, 185, 129, 0.14);
  overflow: hidden;
}
.search-head {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  background: #f0fdf4;
  color: #065f46;
  font-weight: 900;
}
.muted {
  font-weight: 700;
  color: #0f766e;
  opacity: 0.85;
}
.items {
  max-height: 420px;
  overflow: auto;
}
.item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 10px;
  cursor: pointer;
  border-top: 1px solid rgba(16, 185, 129, 0.1);
}
.item:hover {
  background: rgba(34, 197, 94, 0.07);
}
.item-name {
  font-weight: 900;
  color: #0f172a;
}
.item-sub {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.badge {
  font-size: 0.78rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #065f46;
  font-weight: 800;
}
.badge.soft {
  background: rgba(16, 185, 129, 0.1);
  color: #0f766e;
}
.item-price {
  font-weight: 900;
  color: #064e3b;
  white-space: nowrap;
}
.empty {
  padding: 14px;
  color: #64748b;
  font-weight: 700;
}

.cart-card {
  padding: 0;
}
.cart-head {
  padding-right: 12px;
}
.cart-tools {
  display: flex;
  gap: 10px;
}
.pos-table :deep(.el-table__header-wrapper th) {
  background: #f0fdf4;
  color: #065f46;
  font-weight: 900;
}
.pname {
  font-weight: 900;
  color: #0f172a;
}
.psub {
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 700;
  margin-top: 2px;
}
.qty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.money {
  font-weight: 800;
  color: #0f172a;
}
.money.strong {
  color: #064e3b;
  font-weight: 900;
}
.cart-foot {
  padding: 10px 12px 12px;
  border-top: 1px solid rgba(16, 185, 129, 0.12);
}
.shortcut {
  color: #0f766e;
  font-weight: 700;
  font-size: 0.9rem;
}

.pay-card {
  padding: 0;
}
.sum-box {
  padding: 12px;
  border-bottom: 1px solid rgba(16, 185, 129, 0.12);
}
.sum-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  color: #0f172a;
  font-weight: 800;
}
.disc-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.sum-row.grand {
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px dashed rgba(16, 185, 129, 0.35);
  font-size: 1.05rem;
  color: #064e3b;
}
.pay-box {
  padding: 12px;
}
.field {
  margin-bottom: 12px;
}
.label {
  font-weight: 900;
  color: #065f46;
  margin-bottom: 6px;
}
.change {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px;
  border-radius: 14px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.16);
  font-weight: 900;
  color: #064e3b;
  margin-bottom: 12px;
}
.negative {
  color: #ef4444;
}
.pay-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.btn-pay {
  font-weight: 900;
  letter-spacing: 0.02em;
}
.note {
  padding: 12px;
  border-top: 1px solid rgba(16, 185, 129, 0.12);
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.07) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}
.note-title {
  font-weight: 900;
  color: #064e3b;
  margin-bottom: 6px;
}
.note ul {
  margin: 0;
  padding-left: 18px;
  color: #0f766e;
  font-weight: 700;
}

/* dialog */
.nice-dialog :deep(.el-dialog) {
  border-radius: 16px;
}
.confirm-box {
  padding: 6px 2px 0;
}
.confirm-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-weight: 900;
}
.confirm-warn {
  margin-top: 10px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.16);
  color: #b91c1c;
  font-weight: 900;
}

/* responsive */
@media (max-width: 1100px) {
  .pos-grid {
    grid-template-columns: 1fr;
  }
}
</style>
