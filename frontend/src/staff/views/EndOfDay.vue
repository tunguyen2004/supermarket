<template>
  <div class="h-full bg-slate-50">
    <PageHeader title="Báo cáo cuối ngày" />

    <!-- content -->
    <div class="p-4 space-y-4 mt-16">
      <!-- Filters row -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Tabs -->
        <div
          class="bg-white border border-slate-200 rounded-xl p-1 flex items-center flex-wrap"
        >
          <button
            v-for="t in tabs"
            :key="t.key"
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
            :class="
              t.key === activeTab
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            "
            @click="selectTab(t.key)"
          >
            {{ t.label }}
          </button>
          <button
            class="px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            :class="
              activeTab === 'custom'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            "
            @click="activeTab = 'custom'"
          >
            Tùy chọn <i class="fa-regular fa-calendar-days"></i>
          </button>
        </div>

        <!-- Custom date range -->
        <div v-if="activeTab === 'custom'" class="flex items-center gap-2">
          <input
            type="date"
            v-model="customFrom"
            class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span class="text-slate-400">→</span>
          <input
            type="date"
            v-model="customTo"
            class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
            @click="fetchAll"
          >
            Áp dụng
          </button>
        </div>

        <!-- Staff select -->
        <div class="relative" ref="staffDropdownRef">
          <button
            class="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 w-[260px] text-sm hover:border-blue-400 transition"
            @click="showStaffDropdown = !showStaffDropdown"
          >
            <i class="fa-solid fa-user text-slate-400"></i>
            <span class="text-slate-700 truncate flex-1 text-left">{{
              selectedStaffName
            }}</span>
            <span class="text-slate-400 text-xs">▾</span>
          </button>
          <div
            v-if="showStaffDropdown"
            class="absolute top-full left-0 mt-1 w-[260px] bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-64 overflow-auto"
          >
            <button
              class="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition"
              :class="
                !selectedStaffId
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-700'
              "
              @click="selectStaff(null, 'Tất cả nhân viên')"
            >
              Tất cả nhân viên
            </button>
            <button
              v-for="s in staffList"
              :key="s.id"
              class="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition"
              :class="
                selectedStaffId === s.id
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-700'
              "
              @click="selectStaff(s.id, s.full_name)"
            >
              {{ s.full_name }}
            </button>
          </div>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <button
            class="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-semibold flex items-center gap-2"
            @click="printReport"
            :disabled="printing"
          >
            <i class="fa-solid fa-print"></i>
            {{ printing ? "Đang tải..." : "In báo cáo" }}
          </button>
          <button
            class="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition text-white font-semibold flex items-center gap-2"
            @click="showSubmitDialog = true"
            :disabled="submitting || loading"
          >
            <i class="fa-solid fa-paper-plane"></i>
            {{ submitting ? "Đang nộp..." : "Nộp báo cáo" }}
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="flex items-center gap-3 text-slate-500">
          <i class="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i>
          <span class="font-medium">Đang tải dữ liệu báo cáo...</span>
        </div>
      </div>

      <template v-else>
        <!-- Cards row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Doanh thu card -->
          <div class="bg-white border border-slate-200 rounded-2xl p-4">
            <div
              class="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div class="text-lg font-semibold">Doanh thu:</div>
              <div class="text-xl font-bold text-blue-600">
                {{ formatCurrency(revenueSummary.net_revenue) }}
              </div>
            </div>

            <!-- Revenue details -->
            <div class="mt-4 space-y-3 px-2">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Tổng đơn hàng</span>
                <span class="font-semibold">{{
                  revenueSummary.total_orders
                }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Doanh thu gộp</span>
                <span class="font-medium">{{
                  formatCurrency(revenueSummary.gross_revenue)
                }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Giảm giá</span>
                <span class="font-medium text-red-500"
                  >-{{ formatCurrency(revenueSummary.total_discount) }}</span
                >
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Thuế</span>
                <span class="font-medium">{{
                  formatCurrency(revenueSummary.total_tax)
                }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Phí vận chuyển</span>
                <span class="font-medium">{{
                  formatCurrency(revenueSummary.total_shipping)
                }}</span>
              </div>
              <div
                class="flex justify-between text-sm border-t border-slate-100 pt-2"
              >
                <span class="text-slate-500">Giá trị TB/đơn</span>
                <span class="font-medium">{{
                  formatCurrency(revenueSummary.avg_order_value)
                }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Khách hàng</span>
                <span class="font-semibold">{{
                  revenueSummary.unique_customers
                }}</span>
              </div>
            </div>

            <!-- By payment method -->
            <div
              v-if="revenueByPayment.length"
              class="mt-4 border-t border-slate-100 pt-3"
            >
              <div class="text-sm font-semibold text-slate-700 mb-2 px-2">
                Theo phương thức thanh toán
              </div>
              <div class="space-y-2 px-2">
                <div
                  v-for="pm in revenueByPayment"
                  :key="pm.method"
                  class="flex justify-between text-sm"
                >
                  <span class="text-slate-500 flex items-center gap-2">
                    <i
                      :class="paymentIcon(pm.method)"
                      class="w-4 text-center"
                    ></i>
                    {{ paymentLabel(pm.method) }}
                    <span class="text-xs text-slate-400"
                      >({{ pm.order_count }} đơn)</span
                    >
                  </span>
                  <span class="font-medium">{{
                    formatCurrency(pm.total_amount)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- By staff (when not filtered) -->
            <div
              v-if="revenueByStaff.length > 1"
              class="mt-4 border-t border-slate-100 pt-3"
            >
              <div class="text-sm font-semibold text-slate-700 mb-2 px-2">
                Theo nhân viên
              </div>
              <div class="space-y-2 px-2">
                <div
                  v-for="st in revenueByStaff"
                  :key="st.staff_id"
                  class="flex justify-between text-sm"
                >
                  <span class="text-slate-500">
                    {{ st.staff_name }}
                    <span class="text-xs text-slate-400"
                      >({{ st.order_count }} đơn)</span
                    >
                  </span>
                  <span class="font-medium">{{
                    formatCurrency(st.total_amount)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Returns -->
            <div
              v-if="returns.return_count > 0"
              class="mt-4 border-t border-slate-100 pt-3 px-2"
            >
              <div class="flex justify-between text-sm">
                <span class="text-red-500 font-medium">
                  <i class="fa-solid fa-rotate-left mr-1"></i>
                  Trả hàng ({{ returns.return_count }} đơn)
                </span>
                <span class="font-medium text-red-500"
                  >-{{ formatCurrency(returns.refund_total) }}</span
                >
              </div>
            </div>
          </div>

          <!-- Thực thu card -->
          <div class="bg-white border border-slate-200 rounded-2xl p-4">
            <div
              class="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div class="text-lg font-semibold">Thực thu:</div>
              <div class="text-xl font-bold text-green-600">
                {{ formatCurrency(actualSummary.grand_total) }}
              </div>
            </div>

            <!-- Actual revenue details -->
            <div class="mt-4 space-y-3 px-2">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Tổng thu từ bán hàng</span>
                <span class="font-semibold text-green-600">{{
                  formatCurrency(actualSummary.total_paid)
                }}</span>
              </div>

              <!-- By payment method breakdown -->
              <div
                v-if="actualByMethod.length"
                class="space-y-2 pl-4 border-l-2 border-green-200"
              >
                <div
                  v-for="m in actualByMethod"
                  :key="m.method"
                  class="flex justify-between text-sm"
                >
                  <span class="text-slate-500 flex items-center gap-2">
                    <i
                      :class="paymentIcon(m.method)"
                      class="w-4 text-center"
                    ></i>
                    {{ paymentLabel(m.method) }}
                    <span class="text-xs text-slate-400"
                      >({{ m.order_count }})</span
                    >
                  </span>
                  <span class="font-medium">{{
                    formatCurrency(m.amount)
                  }}</span>
                </div>
              </div>

              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Chờ thanh toán</span>
                <span class="font-medium text-yellow-600">{{
                  formatCurrency(actualSummary.total_pending)
                }}</span>
              </div>

              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Hoàn trả</span>
                <span class="font-medium text-red-500"
                  >-{{ formatCurrency(actualSummary.total_refund) }}</span
                >
              </div>

              <div
                class="flex justify-between text-sm border-t border-slate-100 pt-2"
              >
                <span class="text-slate-500 font-medium"
                  >Thực thu bán hàng</span
                >
                <span class="font-semibold">{{
                  formatCurrency(actualSummary.net_actual)
                }}</span>
              </div>
            </div>

            <!-- Cashbook section -->
            <div class="mt-4 border-t border-slate-100 pt-3 px-2">
              <div class="text-sm font-semibold text-slate-700 mb-2">
                Sổ quỹ
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Thu khác</span>
                  <span class="font-medium text-green-600"
                    >+{{ formatCurrency(actualSummary.cashbook_income) }}</span
                  >
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Chi</span>
                  <span class="font-medium text-red-500"
                    >-{{ formatCurrency(actualSummary.cashbook_expense) }}</span
                  >
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Sổ quỹ ròng</span>
                  <span
                    class="font-semibold"
                    :class="
                      actualSummary.cashbook_net >= 0
                        ? 'text-green-600'
                        : 'text-red-500'
                    "
                  >
                    {{ formatCurrency(actualSummary.cashbook_net) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="mt-4 border-t border-slate-200 pt-3 px-2">
              <div class="flex justify-between">
                <span class="font-semibold text-slate-700">Tổng thực thu</span>
                <span
                  class="text-xl font-bold"
                  :class="
                    actualSummary.grand_total >= 0
                      ? 'text-green-600'
                      : 'text-red-500'
                  "
                >
                  {{ formatCurrency(actualSummary.grand_total) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sold Products Table -->
        <div
          class="bg-white border border-slate-200 rounded-2xl overflow-hidden"
        >
          <div class="p-4 flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-3">
              <div class="text-lg font-semibold">Sản phẩm đã bán</div>
              <span class="text-sm text-slate-400"
                >({{ productsPagination.total }} sản phẩm)</span
              >
            </div>

            <!-- Sort -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-500">Sắp xếp:</span>
              <select
                v-model="sortBy"
                class="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="fetchSoldProducts(1)"
              >
                <option value="quantity">Số lượng bán</option>
                <option value="revenue">Doanh thu</option>
                <option value="orders">Số đơn hàng</option>
                <option value="profit">Lợi nhuận</option>
              </select>
              <button
                class="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition text-sm"
                @click="toggleSortOrder"
                :title="sortOrder === 'DESC' ? 'Giảm dần' : 'Tăng dần'"
              >
                <i
                  :class="
                    sortOrder === 'DESC'
                      ? 'fa-solid fa-arrow-down-wide-short'
                      : 'fa-solid fa-arrow-up-wide-short'
                  "
                ></i>
              </button>
            </div>
          </div>

          <!-- Summary row -->
          <div
            v-if="productsSummary.total_quantity"
            class="px-4 pb-3 flex items-center gap-6 text-sm flex-wrap"
          >
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400">Tổng SL:</span>
              <span class="font-semibold">{{
                productsSummary.total_quantity
              }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400">Doanh thu gộp:</span>
              <span class="font-semibold">{{
                formatCurrency(productsSummary.gross_revenue)
              }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400">Giảm giá:</span>
              <span class="font-semibold text-red-500"
                >-{{ formatCurrency(productsSummary.total_discount) }}</span
              >
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400">Doanh thu thuần:</span>
              <span class="font-bold text-blue-600">{{
                formatCurrency(productsSummary.net_revenue)
              }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400">Lợi nhuận:</span>
              <span class="font-semibold text-green-600">{{
                formatCurrency(productsSummary.total_profit)
              }}</span>
            </div>
          </div>

          <div class="border-t border-slate-200 overflow-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-600">
                <tr>
                  <th class="text-left font-medium px-4 py-3 w-[50px]">STT</th>
                  <th class="text-left font-medium px-4 py-3">Tên sản phẩm</th>
                  <th class="text-left font-medium px-4 py-3 w-[120px]">SKU</th>
                  <th class="text-right font-medium px-4 py-3 w-[90px]">
                    SL bán
                  </th>
                  <th class="text-right font-medium px-4 py-3 w-[100px]">
                    Số đơn
                  </th>
                  <th class="text-right font-medium px-4 py-3 w-[140px]">
                    Tổng tiền hàng
                  </th>
                  <th class="text-right font-medium px-4 py-3 w-[120px]">
                    Giảm giá
                  </th>
                  <th class="text-right font-medium px-4 py-3 w-[140px]">
                    Doanh thu thuần
                  </th>
                  <th class="text-right font-medium px-4 py-3 w-[130px]">
                    Lợi nhuận
                  </th>
                </tr>
              </thead>

              <tbody>
                <template v-if="loadingProducts">
                  <tr>
                    <td
                      class="px-4 py-8 text-center text-slate-500"
                      colspan="9"
                    >
                      <i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang
                      tải...
                    </td>
                  </tr>
                </template>
                <template v-else-if="products.length === 0">
                  <tr>
                    <td
                      class="px-4 py-8 text-center text-slate-500"
                      colspan="9"
                    >
                      <div class="flex flex-col items-center gap-2">
                        <i
                          class="fa-solid fa-box-open text-3xl text-slate-300"
                        ></i>
                        <span>Chưa có sản phẩm nào được bán trong kỳ này</span>
                      </div>
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr
                    v-for="item in products"
                    :key="`${item.product_id}-${item.variant_id}`"
                    class="border-t border-slate-100 hover:bg-blue-50/50 transition"
                  >
                    <td class="px-4 py-3 text-slate-400">{{ item.stt }}</td>
                    <td class="px-4 py-3">
                      <div class="font-medium text-slate-800">
                        {{ item.product_name }}
                      </div>
                      <div
                        v-if="item.variant_name"
                        class="text-xs text-slate-400"
                      >
                        {{ item.variant_name }}
                      </div>
                    </td>
                    <td class="px-4 py-3 text-slate-500 font-mono text-xs">
                      {{ item.sku }}
                    </td>
                    <td class="px-4 py-3 text-right font-semibold">
                      {{ item.quantity_sold }}
                    </td>
                    <td class="px-4 py-3 text-right text-slate-600">
                      {{ item.order_count }}
                    </td>
                    <td class="px-4 py-3 text-right">
                      {{ formatCurrency(item.gross_revenue) }}
                    </td>
                    <td class="px-4 py-3 text-right text-red-500">
                      {{
                        item.discount > 0
                          ? "-" + formatCurrency(item.discount)
                          : "0đ"
                      }}
                    </td>
                    <td
                      class="px-4 py-3 text-right font-semibold text-blue-600"
                    >
                      {{ formatCurrency(item.net_revenue) }}
                    </td>
                    <td class="px-4 py-3 text-right font-medium text-green-600">
                      {{ formatCurrency(item.profit) }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div
            v-if="productsPagination.totalPages > 1"
            class="p-4 flex items-center justify-between border-t border-slate-200"
          >
            <div class="text-sm text-slate-500">
              Trang {{ productsPagination.page }} /
              {{ productsPagination.totalPages }} ({{
                productsPagination.total
              }}
              sản phẩm)
            </div>
            <div class="flex items-center gap-2">
              <button
                class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                :disabled="productsPagination.page <= 1"
                @click="fetchSoldProducts(productsPagination.page - 1)"
              >
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <button
                v-for="p in visiblePages"
                :key="p"
                class="w-8 h-8 rounded-lg text-sm font-medium transition"
                :class="
                  p === productsPagination.page
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 hover:bg-slate-50'
                "
                @click="fetchSoldProducts(p)"
              >
                {{ p }}
              </button>
              <button
                class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                :disabled="
                  productsPagination.page >= productsPagination.totalPages
                "
                @click="fetchSoldProducts(productsPagination.page + 1)"
              >
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Submit Report Dialog -->
    <div v-if="showSubmitDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showSubmitDialog = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-800">Nộp báo cáo cuối ngày</h3>
          <button class="text-slate-400 hover:text-slate-600" @click="showSubmitDialog = false">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <!-- Report info summary -->
          <div class="bg-blue-50 rounded-xl p-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-blue-600 font-medium">Kỳ báo cáo</span>
              <span class="font-semibold">{{ dateRange.from }} → {{ dateRange.to }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-blue-600 font-medium">Nhân viên</span>
              <span class="font-semibold">{{ selectedStaffName }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-blue-600 font-medium">Doanh thu thuần</span>
              <span class="font-semibold text-emerald-600">{{ formatCurrency(revenueSummary.net_revenue) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-blue-600 font-medium">Tổng đơn</span>
              <span class="font-semibold">{{ revenueSummary.total_orders }}</span>
            </div>
          </div>

          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Tiêu đề báo cáo</label>
            <input
              v-model="submitForm.title"
              type="text"
              class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              :placeholder="defaultReportTitle"
            />
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Ghi chú (tuỳ chọn)</label>
            <textarea
              v-model="submitForm.notes"
              rows="3"
              class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              placeholder="Ghi chú thêm..."
            ></textarea>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            class="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            @click="showSubmitDialog = false"
          >Hủy</button>
          <button
            class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition flex items-center gap-2"
            :disabled="submitting"
            @click="handleSubmitReport"
          >
            <i class="fa-solid fa-paper-plane" v-if="!submitting"></i>
            <i class="fa-solid fa-spinner fa-spin" v-else></i>
            {{ submitting ? "Đang nộp..." : "Xác nhận nộp" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success dialog with report code -->
    <div v-if="showSuccessDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showSuccessDialog = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden text-center">
        <div class="p-8 space-y-4">
          <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <i class="fa-solid fa-check text-3xl text-emerald-600"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-800">Nộp báo cáo thành công!</h3>
          <div class="bg-slate-50 rounded-xl p-4">
            <div class="text-sm text-slate-500 mb-1">Mã báo cáo</div>
            <div class="text-2xl font-bold text-blue-600 tracking-wide">{{ submittedCode }}</div>
          </div>
          <p class="text-sm text-slate-500">Admin có thể xem báo cáo này trong mục Danh sách báo cáo</p>
        </div>
        <div class="px-6 py-4 border-t border-slate-200">
          <button
            class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            @click="showSuccessDialog = false"
          >Đóng</button>
        </div>
      </div>
    </div>

    <!-- Print iframe (hidden) -->
    <iframe ref="printFrame" class="hidden"></iframe>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import PageHeader from "@/staff/components/PageHeader.vue";
import {
  getDailyReport,
  getActualRevenue,
  getSoldProducts as fetchSoldProductsApi,
  getDailyPrintReport,
  getStaffList,
  submitReport,
} from "@/services/reportService";

// ========== State ==========
const loading = ref(false);
const loadingProducts = ref(false);
const printing = ref(false);

const tabs = [
  { key: "today", label: "Hôm nay" },
  { key: "week", label: "Tuần này" },
  { key: "month", label: "Tháng này" },
  { key: "quarter", label: "Quý này" },
  { key: "year", label: "Năm nay" },
];

const activeTab = ref("today");
const customFrom = ref("");
const customTo = ref("");

// Staff
const staffList = ref([]);
const selectedStaffId = ref(null);
const selectedStaffName = computed(() => {
  if (!selectedStaffId.value) return "Tất cả nhân viên";
  const s = staffList.value.find((x) => x.id === selectedStaffId.value);
  return s ? s.full_name : "Tất cả nhân viên";
});
const showStaffDropdown = ref(false);
const staffDropdownRef = ref(null);

// Data
const revenueSummary = ref({
  total_orders: 0,
  gross_revenue: 0,
  total_discount: 0,
  total_shipping: 0,
  total_tax: 0,
  net_revenue: 0,
  avg_order_value: 0,
  unique_customers: 0,
});
const revenueByPayment = ref([]);
const revenueByStaff = ref([]);
const returns = ref({ return_count: 0, refund_total: 0 });

const actualSummary = ref({
  total_paid: 0,
  total_pending: 0,
  total_refund: 0,
  net_actual: 0,
  cashbook_income: 0,
  cashbook_expense: 0,
  cashbook_net: 0,
  grand_total: 0,
});
const actualByMethod = ref([]);

const products = ref([]);
const productsSummary = ref({});
const productsPagination = ref({ page: 1, limit: 50, total: 0, totalPages: 0 });
const sortBy = ref("quantity");
const sortOrder = ref("DESC");

const printFrame = ref(null);

// Submit report
const submitting = ref(false);
const showSubmitDialog = ref(false);
const showSuccessDialog = ref(false);
const submittedCode = ref("");
const submitForm = ref({ title: "", notes: "" });

const defaultReportTitle = computed(() => {
  const { from, to } = dateRange.value;
  const tabLabel = tabs.find(t => t.key === activeTab.value)?.label || 'Tùy chọn';
  return `Báo cáo cuối ngày - ${tabLabel} (${from} → ${to})`;
});

// ========== Computed ==========
const dateRange = computed(() => {
  const now = new Date();
  const fmt = (d) => d.toISOString().split("T")[0];

  switch (activeTab.value) {
    case "today":
      return { from: fmt(now), to: fmt(now) };
    case "week": {
      const day = now.getDay() || 7;
      const mon = new Date(now);
      mon.setDate(now.getDate() - day + 1);
      return { from: fmt(mon), to: fmt(now) };
    }
    case "month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: fmt(first), to: fmt(now) };
    }
    case "quarter": {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const first = new Date(now.getFullYear(), qMonth, 1);
      return { from: fmt(first), to: fmt(now) };
    }
    case "year": {
      const first = new Date(now.getFullYear(), 0, 1);
      return { from: fmt(first), to: fmt(now) };
    }
    case "custom":
      return {
        from: customFrom.value || fmt(now),
        to: customTo.value || fmt(now),
      };
    default:
      return { from: fmt(now), to: fmt(now) };
  }
});

const visiblePages = computed(() => {
  const total = productsPagination.value.totalPages;
  const current = productsPagination.value.page;
  const pages = [];
  let start = Math.max(1, current - 2);
  let end = Math.min(total, start + 4);
  start = Math.max(1, end - 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// ========== Methods ==========
function getQueryParams(extra = {}) {
  const { from, to } = dateRange.value;
  const params = { from, to, ...extra };
  if (selectedStaffId.value) params.staff_id = selectedStaffId.value;
  return params;
}

async function fetchDailyReport() {
  try {
    const { data: res } = await getDailyReport(getQueryParams());
    if (res.success) {
      revenueSummary.value = res.data.summary;
      revenueByPayment.value = res.data.by_payment_method || [];
      revenueByStaff.value = res.data.by_staff || [];
      returns.value = res.data.returns || { return_count: 0, refund_total: 0 };
    }
  } catch (e) {
    console.error("fetchDailyReport error:", e);
  }
}

async function fetchActualRevenue() {
  try {
    const { data: res } = await getActualRevenue(getQueryParams());
    if (res.success) {
      actualSummary.value = res.data.summary;
      actualByMethod.value = res.data.by_method || [];
    }
  } catch (e) {
    console.error("fetchActualRevenue error:", e);
  }
}

async function fetchSoldProducts(page = 1) {
  loadingProducts.value = true;
  try {
    const params = getQueryParams({
      page,
      limit: 50,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
    });
    const { data: res } = await fetchSoldProductsApi(params);
    if (res.success) {
      products.value = res.data.products;
      productsSummary.value = res.data.summary;
      productsPagination.value = res.pagination;
    }
  } catch (e) {
    console.error("fetchSoldProducts error:", e);
  } finally {
    loadingProducts.value = false;
  }
}

async function fetchAll() {
  loading.value = true;
  try {
    await Promise.all([
      fetchDailyReport(),
      fetchActualRevenue(),
      fetchSoldProducts(1),
    ]);
  } finally {
    loading.value = false;
  }
}

async function fetchStaff() {
  try {
    const { data: res } = await getStaffList();
    if (res.success) staffList.value = res.data;
  } catch (e) {
    console.error("fetchStaff error:", e);
  }
}

function selectTab(key) {
  activeTab.value = key;
  fetchAll();
}

function selectStaff(id) {
  selectedStaffId.value = id;
  showStaffDropdown.value = false;
  fetchAll();
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === "DESC" ? "ASC" : "DESC";
  fetchSoldProducts(1);
}

async function printReport() {
  printing.value = true;
  try {
    const { from } = dateRange.value;
    const params = { date: from };
    if (selectedStaffId.value) params.staff_id = selectedStaffId.value;

    const { data: res } = await getDailyPrintReport(params);
    if (!res.success) return;

    const d = res.data;
    const html = buildPrintHtml(d);

    const frame = printFrame.value;
    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    frame.contentWindow.onafterprint = () => {};
    setTimeout(() => frame.contentWindow.print(), 400);
  } catch (e) {
    console.error("printReport error:", e);
    alert("Lỗi khi tạo báo cáo in: " + e.message);
  } finally {
    printing.value = false;
  }
}

async function handleSubmitReport() {
  submitting.value = true;
  try {
    const { from, to } = dateRange.value;
    const payload = {
      title: submitForm.value.title || defaultReportTitle.value,
      period_from: from,
      period_to: to,
      staff_filter_id: selectedStaffId.value || null,
      notes: submitForm.value.notes || null,
      revenue_summary: { ...revenueSummary.value },
      actual_summary: { ...actualSummary.value },
      by_payment_method: [...revenueByPayment.value],
      by_staff: [...revenueByStaff.value],
      products_summary: { ...productsSummary.value },
      top_products: products.value.slice(0, 10).map(p => ({
        product_name: p.product_name,
        sku: p.sku,
        quantity_sold: p.quantity_sold,
        net_revenue: p.net_revenue,
      })),
      returns_data: { ...returns.value },
    };

    const { data: res } = await submitReport(payload);
    if (res.success) {
      submittedCode.value = res.data.report_code;
      showSubmitDialog.value = false;
      showSuccessDialog.value = true;
      submitForm.value = { title: "", notes: "" };
    } else {
      alert(res.message || "Lỗi khi nộp báo cáo");
    }
  } catch (e) {
    console.error("Submit report error:", e);
    alert("Lỗi khi nộp báo cáo: " + (e.response?.data?.message || e.message));
  } finally {
    submitting.value = false;
  }
}

function buildPrintHtml(d) {
  const info = d.report_info;
  const rev = d.revenue_summary;
  const act = d.actual_revenue;
  const prods = d.top_products || [];
  const orders = d.orders_list || [];

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Báo cáo cuối ngày - ${info.date}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 20px; font-size: 13px; color: #333; }
  h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
  .sub { text-align: center; color: #666; margin-bottom: 16px; font-size: 12px; }
  .section { margin-bottom: 16px; }
  .section h2 { font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th, td { padding: 5px 8px; border: 1px solid #ddd; text-align: left; font-size: 12px; }
  th { background: #f5f5f5; font-weight: 600; }
  .right { text-align: right; }
  .total-row { font-weight: bold; background: #f0f7ff; }
  @media print { body { margin: 0; } }
</style></head><body>
<h1>BÁO CÁO CUỐI NGÀY</h1>
<div class="sub">Ngày: ${info.date} | NV: ${info.staff_filter} | CH: ${
    info.store_filter
  }<br>In lúc: ${new Date(info.generated_at).toLocaleString("vi-VN")} bởi ${
    info.generated_by
  }</div>

<div class="section">
  <h2>Doanh thu</h2>
  <table>
    <tr><td>Tổng đơn hàng</td><td class="right">${rev.total_orders}</td></tr>
    <tr><td>Doanh thu gộp</td><td class="right">${fmtPrint(
      rev.gross_revenue,
    )}</td></tr>
    <tr><td>Giảm giá</td><td class="right">-${fmtPrint(
      rev.total_discount,
    )}</td></tr>
    <tr><td>Thuế</td><td class="right">${fmtPrint(rev.tax_amount)}</td></tr>
    <tr><td>Phí ship</td><td class="right">${fmtPrint(
      rev.shipping_fee,
    )}</td></tr>
    <tr class="total-row"><td>Doanh thu thuần</td><td class="right">${fmtPrint(
      rev.net_revenue,
    )}</td></tr>
    <tr><td>Giá trị TB/đơn</td><td class="right">${fmtPrint(
      rev.avg_order_value,
    )}</td></tr>
    <tr><td>Khách hàng</td><td class="right">${rev.unique_customers}</td></tr>
  </table>
</div>

<div class="section">
  <h2>Thực thu theo PTTT</h2>
  <table>
    <tr><th>Phương thức</th><th class="right">Số đơn</th><th class="right">Số tiền</th></tr>
    ${act.by_payment
      .map(
        (p) =>
          `<tr><td>${paymentLabelStatic(p.method)}</td><td class="right">${
            p.order_count
          }</td><td class="right">${fmtPrint(p.amount)}</td></tr>`,
      )
      .join("")}
    <tr class="total-row"><td>Tổng</td><td></td><td class="right">${fmtPrint(
      act.total,
    )}</td></tr>
    ${
      act.returns.count > 0
        ? `<tr><td style="color:red">Hoàn trả (${
            act.returns.count
          })</td><td></td><td class="right" style="color:red">-${fmtPrint(
            act.returns.amount,
          )}</td></tr>`
        : ""
    }
    <tr class="total-row"><td>Thực thu ròng</td><td></td><td class="right">${fmtPrint(
      act.net_actual,
    )}</td></tr>
  </table>
</div>

<div class="section">
  <h2>Top sản phẩm bán chạy</h2>
  <table>
    <tr><th>#</th><th>Sản phẩm</th><th>SKU</th><th class="right">SL</th><th class="right">Doanh thu</th></tr>
    ${prods
      .map(
        (p) =>
          `<tr><td>${p.rank}</td><td>${p.product_name}</td><td>${
            p.sku
          }</td><td class="right">${
            p.quantity
          }</td><td class="right">${fmtPrint(p.revenue)}</td></tr>`,
      )
      .join("")}
  </table>
</div>

<div class="section">
  <h2>Danh sách đơn hàng (${orders.length})</h2>
  <table>
    <tr><th>Mã đơn</th><th>Thời gian</th><th>Khách</th><th>PTTT</th><th>Trạng thái</th><th class="right">Số tiền</th></tr>
    ${orders
      .map(
        (o) =>
          `<tr><td>${o.code}</td><td>${new Date(o.time).toLocaleTimeString(
            "vi-VN",
          )}</td><td>${o.customer}</td><td>${paymentLabelStatic(
            o.payment_method,
          )}</td><td>${statusLabel(o.status)}</td><td class="right">${fmtPrint(
            o.amount,
          )}</td></tr>`,
      )
      .join("")}
  </table>
</div>

</body></html>`;
}

function fmtPrint(val) {
  return Number(val || 0).toLocaleString("vi-VN") + "đ";
}

function paymentLabelStatic(method) {
  const map = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    card: "Thẻ",
    momo: "MoMo",
    vnpay: "VNPay",
    qr: "QR Code",
    sepay: "SePay",
  };
  return map[method] || method || "Khác";
}

function statusLabel(s) {
  const map = {
    completed: "Hoàn thành",
    delivered: "Đã giao",
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    cancelled: "Đã hủy",
    returned: "Trả hàng",
  };
  return map[s] || s;
}

function formatCurrency(val) {
  const num = Number(val || 0);
  if (num === 0) return "0đ";
  return num.toLocaleString("vi-VN") + "đ";
}

function paymentIcon(method) {
  const map = {
    cash: "fa-solid fa-money-bill-wave text-green-500",
    bank_transfer: "fa-solid fa-building-columns text-blue-500",
    card: "fa-solid fa-credit-card text-purple-500",
    momo: "fa-solid fa-wallet text-pink-500",
    vnpay: "fa-solid fa-v text-blue-600",
    qr: "fa-solid fa-qrcode text-teal-500",
    sepay: "fa-solid fa-link text-indigo-500",
  };
  return map[method] || "fa-solid fa-circle-dollar-to-slot text-slate-400";
}

function paymentLabel(method) {
  return paymentLabelStatic(method);
}

// Close dropdown on outside click
function handleOutsideClick(e) {
  if (staffDropdownRef.value && !staffDropdownRef.value.contains(e.target)) {
    showStaffDropdown.value = false;
  }
}

// ========== Lifecycle ==========
onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
  fetchStaff();
  fetchAll();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
});

// Watch tab changes (for non-custom tabs)
watch(activeTab, (val) => {
  if (val !== "custom") {
    // already handled by selectTab, but if changed programmatically
  }
});
</script>
