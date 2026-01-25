<template>
  <div class="eod-page">
    <div class="eod-head">
      <div>
        <div class="eod-title">
          <span class="dot"></span>
          Chốt ca · Tổng kết cuối ngày
        </div>
        <div class="eod-sub">
          Kiểm tra doanh thu – tiền mặt – chênh lệch trước khi chốt.
        </div>
      </div>

      <div class="eod-actions">
        <el-date-picker
          v-model="date"
          type="date"
          value-format="YYYY-MM-DD"
          format="DD/MM/YYYY"
          :clearable="false"
          @change="loadReport"
        />
        <el-button round type="info" plain @click="printReport">
          In báo cáo
        </el-button>
        <el-button round type="success" plain @click="exportCsv">
          Xuất CSV
        </el-button>
      </div>
    </div>

    <!-- KPI -->
    <div class="kpi-grid">
      <div class="kpi card">
        <div class="kpi-label">Doanh thu</div>
        <div class="kpi-value">{{ format(totalSales) }}</div>
        <div class="kpi-foot">Tổng tiền khách trả</div>
      </div>

      <div class="kpi card">
        <div class="kpi-label">Số hóa đơn</div>
        <div class="kpi-value">{{ ordersCount }}</div>
        <div class="kpi-foot">Đã thanh toán</div>
      </div>

      <div class="kpi card">
        <div class="kpi-label">Giảm giá</div>
        <div class="kpi-value">{{ format(totalDiscount) }}</div>
        <div class="kpi-foot">Khuyến mãi/chiết khấu</div>
      </div>

      <div class="kpi card">
        <div class="kpi-label">Hoàn/Trả</div>
        <div class="kpi-value">{{ format(totalRefund) }}</div>
        <div class="kpi-foot">Nếu có trả hàng</div>
      </div>
    </div>

    <div class="content-grid">
      <!-- LEFT: Payment summary -->
      <section class="card">
        <div class="card-head">
          <div class="title">
            <span class="dot small"></span>
            Tổng hợp thanh toán
          </div>
          <div class="hint">Theo phương thức</div>
        </div>

        <div class="pay-sum">
          <div class="pay-row">
            <span>Tiền mặt</span>
            <b>{{ format(payments.cash) }}</b>
          </div>
          <div class="pay-row">
            <span>QR</span>
            <b>{{ format(payments.qr) }}</b>
          </div>
          <div class="pay-row">
            <span>Thẻ</span>
            <b>{{ format(payments.card) }}</b>
          </div>
          <div class="pay-row grand">
            <span>Tổng</span>
            <b>{{ format(totalSales) }}</b>
          </div>
        </div>

        <div class="table-wrap">
          <el-table :data="orders" height="360" stripe border>
            <el-table-column type="index" width="55" label="#" />
            <el-table-column prop="code" label="Mã HĐ" min-width="140" />
            <el-table-column prop="time" label="Giờ" width="110" />
            <el-table-column prop="method" label="PTTT" width="95">
              <template #default="{ row }">
                <el-tag :type="methodTagType(row.method)" effect="light">
                  {{ methodLabel(row.method) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="total"
              label="Tổng"
              width="140"
              align="right"
            >
              <template #default="{ row }">
                <b class="money">{{ format(row.total) }}</b>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </section>

      <!-- RIGHT: Cash count + Close shift -->
      <section class="card">
        <div class="card-head">
          <div class="title">
            <span class="dot small"></span>
            Kiểm kê tiền mặt
          </div>
          <div class="hint">Nhập tiền thực tế</div>
        </div>

        <div class="form-box">
          <div class="field">
            <div class="label">Tiền đầu ca</div>
            <el-input-number
              v-model="openingCash"
              :min="0"
              :max="999999999"
              controls-position="right"
              style="width: 100%"
            />
          </div>

          <div class="field">
            <div class="label">Tiền mặt theo hệ thống</div>
            <div class="readonly">
              {{ format(expectedCash) }}
              <span class="sub">= tiền mặt bán hàng (không gồm QR/thẻ)</span>
            </div>
          </div>

          <div class="field">
            <div class="label">Tiền mặt cần có trong két</div>
            <div class="readonly strong">
              {{ format(expectedDrawerCash) }}
              <span class="sub">= đầu ca + tiền mặt bán hàng</span>
            </div>
          </div>

          <div class="field">
            <div class="label">Tiền mặt đếm thực tế</div>
            <el-input-number
              v-model="countedCash"
              :min="0"
              :max="999999999"
              controls-position="right"
              style="width: 100%"
            />
          </div>

          <div class="diff-box" :class="{ bad: diff !== 0 }">
            <span>Chênh lệch</span>
            <b>{{ format(diff) }}</b>
          </div>

          <div class="field">
            <div class="label">Ghi chú</div>
            <el-input
              v-model="note"
              type="textarea"
              :rows="3"
              placeholder="Ví dụ: thiếu 20k do trả lại tiền lẻ, nhầm lẫn…"
            />
          </div>

          <div class="close-actions">
            <el-button round plain @click="loadReport">Làm mới</el-button>
            <el-button
              round
              type="success"
              class="btn-close"
              :disabled="closing || ordersCount === 0"
              @click="confirmCloseShift"
            >
              {{ closing ? "Đang chốt..." : "Chốt ca" }}
            </el-button>
          </div>

          <div class="tips">
            <div class="tips-title">Checklist trước khi chốt</div>
            <ul>
              <li>So khớp tổng tiền mặt trên hệ thống với tiền đếm.</li>
              <li>Kiểm tra hóa đơn hoàn/huỷ (nếu có).</li>
              <li>Ghi chú chênh lệch (nếu khác 0).</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 🔌 Nếu bạn có utils formatCurrency thì dùng, còn không dùng hàm format nội bộ
// import formatCurrency from "@/utils/formatCurrency";

import reportService from "@/services/reportService"; // nếu bạn chưa có hàm, cứ để rồi map sau
import cashbookService from "@/services/cashbookService"; // map chốt ca nếu muốn

const date = ref(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD

// Report data (mock cấu trúc để UI chạy ngay)
const totalSales = ref(0);
const ordersCount = ref(0);
const totalDiscount = ref(0);
const totalRefund = ref(0);

const payments = ref({
  cash: 0,
  qr: 0,
  card: 0,
});

const orders = ref([]);

// Cash count
const openingCash = ref(0);
const countedCash = ref(0);
const note = ref("");

const closing = ref(false);

function format(v) {
  const n = Number(v || 0);
  return n.toLocaleString("vi-VN") + " ₫";
}

const expectedCash = computed(() => payments.value.cash || 0);
const expectedDrawerCash = computed(
  () => (openingCash.value || 0) + (expectedCash.value || 0),
);
const diff = computed(
  () => (countedCash.value || 0) - (expectedDrawerCash.value || 0),
);

function methodLabel(m) {
  if (m === "cash") return "Cash";
  if (m === "qr") return "QR";
  if (m === "card") return "Card";
  return m || "—";
}
function methodTagType(m) {
  if (m === "cash") return "success";
  if (m === "qr") return "info";
  if (m === "card") return "warning";
  return "";
}

/** Load report from API (bạn map lại theo API thật) */
async function loadReport() {
  try {
    // ✅ Gợi ý API: reportService.getEndOfDay({ date })
    // const res = await reportService.getEndOfDay?.({ date: date.value });
    // const data = res?.data?.data ?? res?.data ?? res;

    // --- DEMO DATA: để UI chạy ngay ---
    const data = mockData(date.value);

    totalSales.value = data.totalSales;
    ordersCount.value = data.ordersCount;
    totalDiscount.value = data.totalDiscount;
    totalRefund.value = data.totalRefund;
    payments.value = data.payments;
    orders.value = data.orders;

    // Nếu lần đầu vào trang, set countedCash = expectedDrawerCash để dễ chốt
    if (!countedCash.value) countedCash.value = expectedDrawerCash.value;
  } catch (err) {
    console.error(err);
    ElMessage.error("Không thể tải báo cáo cuối ngày");
  }
}

function printReport() {
  window.print();
}

function exportCsv() {
  const rows = [
    ["Date", date.value],
    ["TotalSales", totalSales.value],
    ["OrdersCount", ordersCount.value],
    ["TotalDiscount", totalDiscount.value],
    ["TotalRefund", totalRefund.value],
    ["Cash", payments.value.cash],
    ["QR", payments.value.qr],
    ["Card", payments.value.card],
    [],
    ["Orders"],
    ["Code", "Time", "Method", "Total"],
    ...orders.value.map((o) => [o.code, o.time, o.method, o.total]),
  ];

  const csv = rows
    .map((r) =>
      r.map((c) => `"${String(c ?? "").replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `end_of_day_${date.value}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function confirmCloseShift() {
  try {
    await ElMessageBox.confirm(
      `Chốt ca ngày ${date.value}?\nTổng thu: ${format(
        totalSales.value,
      )}\nChênh lệch: ${format(diff.value)}`,
      "Xác nhận chốt ca",
      {
        type: diff.value === 0 ? "success" : "warning",
        confirmButtonText: "Chốt ca",
        cancelButtonText: "Hủy",
        autofocus: false,
      },
    );

    await closeShift();
  } catch (e) {
    // cancel
  }
}

async function closeShift() {
  closing.value = true;
  try {
    const payload = {
      date: date.value,
      opening_cash: openingCash.value,
      expected_cash: expectedCash.value,
      expected_drawer_cash: expectedDrawerCash.value,
      counted_cash: countedCash.value,
      difference: diff.value,
      total_sales: totalSales.value,
      orders_count: ordersCount.value,
      payments: payments.value,
      note: note.value,
    };

    // 🔌 Gợi ý API: cashbookService.closeShift(payload) hoặc reportService.closeShift(payload)
    // await cashbookService.closeShift?.(payload);

    ElMessage.success("Chốt ca thành công!");
  } catch (err) {
    console.error(err);
    ElMessage.error("Chốt ca thất bại (kiểm tra API)");
  } finally {
    closing.value = false;
  }
}

/** demo data */
function mockData(d) {
  return {
    totalSales: 3250000,
    ordersCount: 42,
    totalDiscount: 120000,
    totalRefund: 0,
    payments: { cash: 1350000, qr: 980000, card: 920000 },
    orders: Array.from({ length: 18 }).map((_, i) => ({
      code: `HD${d.replaceAll("-", "")}-${String(i + 1).padStart(3, "0")}`,
      time: `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${
        i % 2 ? "30" : "05"
      }`,
      method: i % 3 === 0 ? "cash" : i % 3 === 1 ? "qr" : "card",
      total: 50000 + i * 15000,
    })),
  };
}

onMounted(() => {
  loadReport();
});
</script>

<style scoped>
.eod-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 6px;
}

.eod-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.eod-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  color: #064e3b;
  font-size: 1.25rem;
}
.eod-sub {
  margin-top: 6px;
  color: #0f766e;
  font-weight: 700;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.14);
}
.dot.small {
  width: 9px;
  height: 9px;
  box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.14);
}

.eod-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 12px;
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
.hint {
  font-size: 0.85rem;
  color: #0f766e;
  font-weight: 700;
  opacity: 0.9;
}

/* KPI */
.kpi {
  padding: 14px 14px 12px;
}
.kpi-label {
  font-weight: 900;
  color: #065f46;
}
.kpi-value {
  margin-top: 8px;
  font-size: 1.35rem;
  font-weight: 1000;
  color: #0f172a;
}
.kpi-foot {
  margin-top: 6px;
  font-weight: 700;
  color: #0f766e;
}

/* Pay summary */
.pay-sum {
  padding: 12px;
}
.pay-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-weight: 900;
  color: #0f172a;
}
.pay-row.grand {
  border-top: 1px dashed rgba(16, 185, 129, 0.35);
  margin-top: 6px;
  padding-top: 12px;
  color: #064e3b;
}

.table-wrap {
  padding: 0 12px 12px;
}
.money {
  color: #064e3b;
}

/* Form box */
.form-box {
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
.readonly {
  padding: 10px 10px;
  border-radius: 14px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.14);
  font-weight: 900;
  color: #0f172a;
}
.readonly.strong {
  background: rgba(34, 197, 94, 0.12);
  color: #064e3b;
}
.sub {
  display: block;
  margin-top: 4px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f766e;
}

.diff-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px;
  border-radius: 14px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.16);
  font-weight: 1000;
  color: #064e3b;
  margin-bottom: 12px;
}
.diff-box.bad {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.22);
  color: #92400e;
}

.close-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.btn-close {
  font-weight: 900;
}

.tips {
  margin-top: 12px;
  padding: 12px;
  border-radius: 16px;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.08) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  border: 1px solid rgba(16, 185, 129, 0.14);
}
.tips-title {
  font-weight: 900;
  color: #064e3b;
  margin-bottom: 6px;
}
.tips ul {
  margin: 0;
  padding-left: 18px;
  color: #0f766e;
  font-weight: 700;
}

/* responsive */
@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .content-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 560px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  .eod-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
