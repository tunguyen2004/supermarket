<template>
  <div class="h-full bg-slate-50">
    <PageHeader title="Tra cứu đơn hàng" />

    <div class="p-4">
      <div class="grid grid-cols-[380px_1fr] gap-4 h-[calc(100vh-64px-32px)]">
        <!-- LEFT: Order list -->
        <aside
          class="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col"
        >
          <!-- Search & filters -->
          <div class="p-3 border-b border-slate-200 space-y-3">
            <div
              class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2"
            >
              <span class="opacity-70">
                <i class="fa-solid fa-magnifying-glass text-xl"></i>
              </span>
              <input
                v-model="searchText"
                class="bg-transparent outline-none w-full text-sm"
                placeholder="Tìm mã đơn, tên khách hàng..."
                @input="onSearchInput"
              />
              <button
                v-if="searchText"
                class="text-slate-400 hover:text-slate-600"
                @click="
                  searchText = '';
                  fetchOrders();
                "
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div class="flex gap-2">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="→"
                start-placeholder="Từ ngày"
                end-placeholder="Đến ngày"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                size="default"
                class="flex-1 !w-auto"
                @change="fetchOrders()"
              />
            </div>

            <div class="flex gap-2">
              <select
                v-model="statusFilter"
                class="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white outline-none"
                @change="fetchOrders()"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="cancelled">Đã hủy</option>
              </select>
              <select
                v-model="paymentFilter"
                class="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white outline-none"
                @change="fetchOrders()"
              >
                <option value="">Thanh toán</option>
                <option value="paid">Đã thanh toán</option>
                <option value="unpaid">Chưa thanh toán</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>
            </div>
          </div>

          <!-- Loading -->
          <div
            v-if="loadingList"
            class="flex-1 flex items-center justify-center"
          >
            <i class="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i>
          </div>

          <!-- Empty -->
          <div
            v-else-if="orders.length === 0"
            class="flex-1 flex flex-col items-center justify-center text-slate-400 p-6"
          >
            <i class="fa-solid fa-receipt text-4xl mb-3"></i>
            <p class="text-sm">Không tìm thấy đơn hàng nào</p>
          </div>

          <!-- Order items -->
          <div v-else class="flex-1 min-h-0 overflow-auto">
            <button
              v-for="o in orders"
              :key="o.id"
              class="w-full text-left p-4 border-b border-slate-200 hover:bg-slate-50 transition relative"
              :class="selectedId === o.id ? 'bg-blue-50' : 'bg-white'"
              @click="selectOrder(o.id)"
            >
              <div
                v-if="selectedId === o.id"
                class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"
              ></div>

              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="font-semibold text-slate-900">
                    #{{ o.order_code }}
                  </div>
                  <div class="text-sm text-slate-600 mt-1 truncate">
                    {{ o.customer?.name || "Khách lẻ" }}
                  </div>
                  <div class="text-sm text-slate-500">
                    {{ formatDate(o.created_at) }}
                  </div>
                </div>

                <div class="text-right flex-shrink-0">
                  <div class="font-semibold text-slate-900">
                    {{ formatCurrency(o.amount?.total) }}
                  </div>
                  <span
                    class="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="statusClass(o.status)"
                  >
                    {{ statusLabel(o.status) }}
                  </span>
                </div>
              </div>
            </button>
          </div>

          <!-- Pagination footer -->
          <div
            class="p-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600"
          >
            <span>Tổng {{ pagination.total }} đơn</span>
            <div class="flex items-center gap-1">
              <button
                class="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                :disabled="pagination.current_page <= 1"
                @click="goPage(pagination.current_page - 1)"
              >
                ‹
              </button>
              <template v-for="p in visiblePages" :key="p">
                <button
                  v-if="p === '...'"
                  class="w-8 h-8 text-xs text-slate-400"
                  disabled
                >
                  ...
                </button>
                <button
                  v-else
                  class="w-8 h-8 rounded-full text-xs font-semibold"
                  :class="
                    p === pagination.current_page
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-100 text-slate-700'
                  "
                  @click="goPage(p)"
                >
                  {{ p }}
                </button>
              </template>
              <button
                class="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                :disabled="pagination.current_page >= pagination.pages"
                @click="goPage(pagination.current_page + 1)"
              >
                ›
              </button>
            </div>
          </div>
        </aside>

        <!-- RIGHT: Order detail -->
        <section
          class="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col"
        >
          <!-- No selection -->
          <div
            v-if="!selectedId"
            class="flex-1 flex flex-col items-center justify-center text-slate-400"
          >
            <i class="fa-solid fa-file-invoice text-5xl mb-4"></i>
            <p>Chọn đơn hàng để xem chi tiết</p>
          </div>

          <!-- Loading detail -->
          <div
            v-else-if="loadingDetail"
            class="flex-1 flex items-center justify-center"
          >
            <i class="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i>
          </div>

          <!-- Detail content -->
          <template v-else-if="detail">
            <!-- Header -->
            <div
              class="p-4 border-b border-slate-200 flex items-start justify-between gap-4"
            >
              <div>
                <div class="flex items-center gap-3">
                  <div class="text-xl font-bold text-slate-900">
                    #{{ detail.order_code }}
                  </div>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="statusClass(detail.status)"
                  >
                    {{ statusLabel(detail.status) }}
                  </span>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="paymentClass(detail.payment_status)"
                  >
                    {{ paymentLabel(detail.payment_status) }}
                  </span>
                </div>

                <div class="mt-3 space-y-2 text-sm text-slate-700">
                  <div class="flex items-center gap-2">
                    <i
                      class="fa-solid fa-pencil w-5 text-center opacity-60"
                    ></i>
                    Tạo bởi <b>{{ detail.created_by }}</b> lúc
                    {{ formatDate(detail.created_at) }}
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-store w-5 text-center opacity-60"></i>
                    Chi nhánh: <b>{{ detail.store || "—" }}</b>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-user w-5 text-center opacity-60"></i>
                    Khách hàng:
                    <b>{{ detail.customer?.name || "Khách lẻ" }}</b>
                    <span
                      v-if="detail.customer?.phone !== 'N/A'"
                      class="text-slate-500"
                    >
                      - {{ detail.customer?.phone }}
                    </span>
                  </div>
                  <div
                    v-if="detail.payment_method"
                    class="flex items-center gap-2"
                  >
                    <i
                      class="fa-solid fa-credit-card w-5 text-center opacity-60"
                    ></i>
                    Thanh toán:
                    <b>{{ paymentMethodLabel(detail.payment_method) }}</b>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 flex-shrink-0">
                <button
                  v-if="detail.status === 'completed'"
                  class="h-10 px-5 rounded-xl border border-orange-300 text-orange-700 bg-white hover:bg-orange-50 transition font-semibold text-sm"
                  @click="showReturnDialog = true"
                >
                  <i class="fa-solid fa-rotate-left mr-1"></i> Hoàn trả
                </button>
                <button
                  class="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-semibold text-sm"
                  @click="printInvoice"
                >
                  <i class="fa-solid fa-print mr-1"></i> In hóa đơn
                </button>
              </div>
            </div>

            <!-- Product table -->
            <div class="flex-1 min-h-0 overflow-auto">
              <div class="p-4">
                <div
                  class="border border-slate-200 rounded-2xl overflow-hidden"
                >
                  <div
                    class="px-4 py-3 bg-slate-50 font-semibold text-slate-900 border-b border-slate-200 flex items-center justify-between"
                  >
                    <span>Sản phẩm</span>
                    <span class="text-sm font-normal text-slate-500">
                      {{ detail.items?.length || 0 }} sản phẩm
                    </span>
                  </div>

                  <div class="divide-y divide-slate-100">
                    <!-- Header row -->
                    <div
                      class="px-4 py-2 flex items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-wide"
                    >
                      <div class="flex-1">Sản phẩm</div>
                      <div class="w-[80px] text-right">Đơn giá</div>
                      <div class="w-[60px] text-center">SL</div>
                      <div class="w-[80px] text-right">Giảm giá</div>
                      <div class="w-[110px] text-right">Thành tiền</div>
                    </div>

                    <!-- Item rows -->
                    <div
                      v-for="item in detail.items"
                      :key="item.id"
                      class="px-4 py-3 flex items-center gap-4"
                    >
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-slate-900 truncate">
                          {{ item.product }}
                        </div>
                      </div>
                      <div class="w-[80px] text-right text-sm text-slate-700">
                        {{ formatCurrency(item.unit_price) }}
                      </div>
                      <div class="w-[60px] text-center text-sm text-slate-700">
                        {{ item.quantity }}
                      </div>
                      <div class="w-[80px] text-right text-sm text-slate-700">
                        {{
                          item.discount_per_item > 0
                            ? "-" +
                              formatCurrency(
                                item.discount_per_item * item.quantity,
                              )
                            : "0 ₫"
                        }}
                      </div>
                      <div
                        class="w-[110px] text-right font-semibold text-slate-900"
                      >
                        {{ formatCurrency(item.line_total) }}
                      </div>
                    </div>
                  </div>

                  <!-- Summary area -->
                  <div
                    class="border-t border-slate-200 p-4 grid grid-cols-2 gap-6"
                  >
                    <!-- Left summary -->
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between text-slate-700">
                        <span
                          >Tổng tiền hàng ({{
                            detail.items?.length || 0
                          }}
                          SP)</span
                        >
                        <span>{{
                          formatCurrency(detail.amount?.subtotal)
                        }}</span>
                      </div>
                      <div class="flex justify-between text-slate-700">
                        <span>Giảm giá</span>
                        <span class="text-orange-600">
                          -{{ formatCurrency(detail.amount?.discount) }}
                        </span>
                      </div>
                      <div class="flex justify-between text-slate-700">
                        <span>VAT</span>
                        <span>{{ formatCurrency(detail.amount?.tax) }}</span>
                      </div>
                      <div
                        v-if="detail.amount?.shipping > 0"
                        class="flex justify-between text-slate-700"
                      >
                        <span>Phí vận chuyển</span>
                        <span>{{
                          formatCurrency(detail.amount?.shipping)
                        }}</span>
                      </div>

                      <div
                        class="mt-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex justify-between items-center"
                      >
                        <span class="font-semibold text-slate-900"
                          >Khách phải trả</span
                        >
                        <span class="font-bold text-blue-700 text-lg">
                          {{ formatCurrency(detail.amount?.total) }}
                        </span>
                      </div>
                    </div>

                    <!-- Right summary -->
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between text-slate-700">
                        <span>Phương thức</span>
                        <span class="font-medium">
                          {{ paymentMethodLabel(detail.payment_method) }}
                        </span>
                      </div>
                      <div class="flex justify-between text-slate-700">
                        <span>Trạng thái</span>
                        <span
                          class="font-medium"
                          :class="{
                            'text-green-600': detail.payment_status === 'paid',
                            'text-red-600': detail.payment_status === 'unpaid',
                            'text-orange-600':
                              detail.payment_status === 'refunded',
                          }"
                        >
                          {{ paymentLabel(detail.payment_status) }}
                        </span>
                      </div>

                      <div
                        class="mt-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex justify-between items-center"
                      >
                        <span class="font-semibold text-slate-900">
                          {{
                            detail.payment_status === "paid"
                              ? "Đã thanh toán"
                              : "Còn nợ"
                          }}
                        </span>
                        <span
                          class="font-bold text-lg"
                          :class="
                            detail.payment_status === 'paid'
                              ? 'text-green-600'
                              : 'text-red-600'
                          "
                        >
                          {{ formatCurrency(detail.amount?.total) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Notes -->
                  <div
                    v-if="detail.notes?.customer || detail.notes?.internal"
                    class="border-t border-slate-200 p-4 space-y-2"
                  >
                    <div v-if="detail.notes?.customer" class="text-sm">
                      <span class="text-slate-500">Ghi chú KH:</span>
                      <span class="text-slate-700 ml-1">{{
                        detail.notes.customer
                      }}</span>
                    </div>
                    <div v-if="detail.notes?.internal" class="text-sm">
                      <span class="text-slate-500">Ghi chú nội bộ:</span>
                      <span class="text-slate-700 ml-1">{{
                        detail.notes.internal
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </section>
      </div>
    </div>

    <!-- Return Dialog -->
    <el-dialog
      v-model="showReturnDialog"
      title="Hoàn trả đơn hàng"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <p class="text-sm text-slate-600">
          Chọn sản phẩm và số lượng muốn hoàn trả cho đơn
          <b>#{{ detail?.order_code }}</b>
        </p>

        <div
          v-for="(item, idx) in returnItems"
          :key="idx"
          class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
        >
          <el-checkbox v-model="item.selected" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ item.product }}</div>
            <div class="text-xs text-slate-500">
              Đã mua: {{ item.maxQty }} | Đơn giá:
              {{ formatCurrency(item.unit_price) }}
            </div>
          </div>
          <el-input-number
            v-model="item.quantity"
            :min="1"
            :max="item.maxQty"
            size="small"
            :disabled="!item.selected"
            class="!w-[100px]"
          />
        </div>

        <el-input
          v-model="returnReason"
          type="textarea"
          placeholder="Lý do hoàn trả..."
          :rows="2"
        />
      </div>

      <template #footer>
        <el-button @click="showReturnDialog = false">Hủy</el-button>
        <el-button type="warning" :loading="returning" @click="submitReturn">
          Xác nhận hoàn trả
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import PageHeader from "@/staff/components/PageHeader.vue";
import orderService from "@/services/orderService";
import formatCurrency from "@/utils/formatCurrency";

// ── State ──────────────────────────────────────────
const searchText = ref("");
const dateRange = ref(null);
const statusFilter = ref("");
const paymentFilter = ref("");
const orders = ref([]);
const selectedId = ref(null);
const detail = ref(null);
const loadingList = ref(false);
const loadingDetail = ref(false);

const pagination = ref({
  total: 0,
  limit: 20,
  pages: 1,
  current_page: 1,
});

// Return dialog
const showReturnDialog = ref(false);
const returnItems = ref([]);
const returnReason = ref("");
const returning = ref(false);

// ── Debounce ───────────────────────────────────────
let searchTimer = null;
function onSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => fetchOrders(), 400);
}

// ── Pagination ─────────────────────────────────────
const visiblePages = computed(() => {
  const total = pagination.value.pages;
  const cur = pagination.value.current_page;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (cur > 3) pages.push("...");
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) {
    pages.push(i);
  }
  if (cur < total - 2) pages.push("...");
  pages.push(total);
  return pages;
});

function goPage(page) {
  if (page < 1 || page > pagination.value.pages) return;
  pagination.value.current_page = page;
  fetchOrders(false);
}

// ── Fetch orders ───────────────────────────────────
async function fetchOrders(resetPage = true) {
  if (resetPage) pagination.value.current_page = 1;
  loadingList.value = true;
  try {
    const params = {
      limit: pagination.value.limit,
      offset: (pagination.value.current_page - 1) * pagination.value.limit,
      sort: "created_at",
      order: "DESC",
    };
    if (searchText.value.trim()) params.search = searchText.value.trim();
    if (statusFilter.value) params.status = statusFilter.value;
    if (paymentFilter.value) params.payment_status = paymentFilter.value;

    const res = await orderService.getOrders(params);
    orders.value = res.data || [];
    if (res.pagination) {
      pagination.value = { ...pagination.value, ...res.pagination };
    }

    // Auto-select first if nothing selected
    if (orders.value.length > 0 && !selectedId.value) {
      selectOrder(orders.value[0].id);
    }
  } catch (err) {
    console.error("Fetch orders error:", err);
    ElMessage.error("Không thể tải danh sách đơn hàng");
  } finally {
    loadingList.value = false;
  }
}

// ── Select order ───────────────────────────────────
async function selectOrder(id) {
  selectedId.value = id;
  loadingDetail.value = true;
  try {
    const res = await orderService.getOrderById(id);
    detail.value = res.data;
  } catch (err) {
    console.error("Fetch order detail error:", err);
    ElMessage.error("Không thể tải chi tiết đơn hàng");
  } finally {
    loadingDetail.value = false;
  }
}

// ── Print invoice ──────────────────────────────────
async function printInvoice() {
  if (!detail.value) return;
  try {
    const res = await orderService.getOrderInvoice(detail.value.id);
    const inv = res.data;

    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) {
      ElMessage.error("Trình duyệt chặn popup, hãy cho phép popup");
      return;
    }

    const itemsHtml = inv.items
      .map(
        (it) => `
        <tr>
          <td style="padding:2px 4px;border-bottom:1px dashed #ddd">${
            it.name
          }</td>
          <td style="padding:2px 4px;text-align:center;border-bottom:1px dashed #ddd">${
            it.quantity
          }</td>
          <td style="padding:2px 4px;text-align:right;border-bottom:1px dashed #ddd">${Number(
            it.unit_price,
          ).toLocaleString("vi-VN")}</td>
          <td style="padding:2px 4px;text-align:right;border-bottom:1px dashed #ddd">${Number(
            it.total,
          ).toLocaleString("vi-VN")}</td>
        </tr>`,
      )
      .join("");

    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Hóa đơn ${inv.invoice_number}</title>
      <style>
        body{font-family:monospace;font-size:12px;width:300px;margin:auto;padding:10px}
        h2{text-align:center;margin:0}
        .center{text-align:center}
        .right{text-align:right}
        table{width:100%;border-collapse:collapse;margin:8px 0}
        th{border-bottom:1px solid #333;padding:2px 4px;text-align:left;font-size:11px}
        .sep{border-top:1px dashed #333;margin:6px 0}
        .bold{font-weight:bold}
      </style></head><body>
      <h2>${inv.store?.name || "Minimart"}</h2>
      <p class="center" style="margin:2px 0">${inv.store?.address || ""}</p>
      <p class="center" style="margin:2px 0">${inv.store?.phone || ""}</p>
      <div class="sep"></div>
      <p class="center bold">HÓA ĐƠN BÁN HÀNG</p>
      <p>Số: ${inv.invoice_number}</p>
      <p>Ngày: ${new Date(inv.created_at).toLocaleString("vi-VN")}</p>
      <p>Thu ngân: ${inv.staff || ""}</p>
      <p>KH: ${inv.customer?.name || "Khách lẻ"}${
      inv.customer?.phone ? " - " + inv.customer.phone : ""
    }</p>
      <div class="sep"></div>
      <table>
        <thead><tr><th>Sản phẩm</th><th style="text-align:center">SL</th><th style="text-align:right">Giá</th><th style="text-align:right">T.Tiền</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div class="sep"></div>
      <table>
        <tr><td>Tổng tiền hàng</td><td class="right">${Number(
          inv.summary.subtotal,
        ).toLocaleString("vi-VN")}</td></tr>
        ${
          inv.summary.discount > 0
            ? `<tr><td>Giảm giá</td><td class="right">-${Number(
                inv.summary.discount,
              ).toLocaleString("vi-VN")}</td></tr>`
            : ""
        }
        ${
          inv.summary.tax > 0
            ? `<tr><td>VAT</td><td class="right">${Number(
                inv.summary.tax,
              ).toLocaleString("vi-VN")}</td></tr>`
            : ""
        }
        <tr class="bold"><td>TỔNG THANH TOÁN</td><td class="right">${Number(
          inv.summary.total,
        ).toLocaleString("vi-VN")} ₫</td></tr>
      </table>
      <div class="sep"></div>
      <p>Thanh toán: ${inv.payment?.method || "—"}</p>
      <p class="center" style="margin-top:10px">Cảm ơn quý khách!</p>
      </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 300);
  } catch (err) {
    console.error("Print invoice error:", err);
    ElMessage.error("Không thể in hóa đơn");
  }
}

// ── Return order ───────────────────────────────────
watch(showReturnDialog, (v) => {
  if (v && detail.value?.items) {
    returnItems.value = detail.value.items.map((it) => ({
      variant_id: it.id,
      product: it.product,
      unit_price: it.unit_price,
      maxQty: it.quantity,
      quantity: it.quantity,
      selected: true,
    }));
    returnReason.value = "";
  }
});

async function submitReturn() {
  const selected = returnItems.value.filter((i) => i.selected);
  if (selected.length === 0) {
    ElMessage.warning("Chọn ít nhất 1 sản phẩm để hoàn trả");
    return;
  }
  returning.value = true;
  try {
    await orderService.createReturnOrder(detail.value.id, {
      items: selected.map((i) => ({
        variant_id: i.variant_id,
        quantity: i.quantity,
        reason: returnReason.value,
      })),
      reason: returnReason.value,
      refund_method:
        detail.value.payment_method === "cash" ? "cash" : "bank_transfer",
    });
    ElMessage.success("Hoàn trả thành công");
    showReturnDialog.value = false;
    // Refresh
    await selectOrder(detail.value.id);
    fetchOrders(false);
  } catch (err) {
    console.error("Return error:", err);
    ElMessage.error(err.response?.data?.message || "Hoàn trả thất bại");
  } finally {
    returning.value = false;
  }
}

// ── Helpers ────────────────────────────────────────
function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(s) {
  const map = {
    completed: "Hoàn thành",
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    cancelled: "Đã hủy",
    delivered: "Đã giao",
    returned: "Đã trả",
  };
  return map[s] || s;
}

function statusClass(s) {
  const map = {
    completed: "bg-green-100 text-green-700 border border-green-200",
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    processing: "bg-blue-100 text-blue-700 border border-blue-200",
    cancelled: "bg-red-100 text-red-700 border border-red-200",
    delivered: "bg-teal-100 text-teal-700 border border-teal-200",
    returned: "bg-orange-100 text-orange-700 border border-orange-200",
  };
  return map[s] || "bg-slate-100 text-slate-600 border border-slate-200";
}

function paymentLabel(s) {
  const map = {
    paid: "Đã thanh toán",
    unpaid: "Chưa thanh toán",
    refunded: "Đã hoàn tiền",
  };
  return map[s] || s;
}

function paymentClass(s) {
  const map = {
    paid: "bg-green-100 text-green-700 border border-green-200",
    unpaid: "bg-red-100 text-red-700 border border-red-200",
    refunded: "bg-orange-100 text-orange-700 border border-orange-200",
  };
  return map[s] || "bg-slate-100 text-slate-600 border border-slate-200";
}

function paymentMethodLabel(m) {
  const map = {
    cash: "Tiền mặt",
    card: "Thẻ",
    "bank transfer": "Chuyển khoản",
    bank_transfer: "Chuyển khoản",
    qr: "QR Code",
  };
  return map[m] || m || "—";
}

// ── Init ───────────────────────────────────────────
onMounted(() => {
  fetchOrders();
});
</script>
