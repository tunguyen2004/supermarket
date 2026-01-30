<template>
  <div class="h-full bg-slate-50">
    <PageHeader title="Báo cáo cuối ngày" />

    <!-- content -->
    <div class="p-4 space-y-4">
      <!-- Filters row -->
      <div class="flex items-center gap-3">
        <!-- Tabs -->
        <div
          class="bg-white border border-slate-200 rounded-xl p-1 flex items-center"
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
            @click="activeTab = t.key"
          >
            {{ t.label }}
          </button>

          <button
            class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-2"
            @click="activeTab = 'custom'"
          >
            Tùy chọn <span>📅</span>
          </button>
        </div>

        <!-- Staff select -->
        <div
          class="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 w-[260px]"
        >
          <span class="text-slate-600 text-sm">Chọn nhân viên</span>
          <span class="ml-auto text-slate-500">▾</span>
        </div>

        <div class="ml-auto">
          <button
            class="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-semibold"
          >
            In báo cáo
          </button>
        </div>
      </div>

      <!-- Cards row -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Doanh thu -->
        <div class="bg-white border border-slate-200 rounded-2xl p-4">
          <div class="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <div class="text-lg font-semibold">Doanh thu:</div>
            <div class="text-xl font-bold text-blue-600">0đ</div>
          </div>

          <div
            class="h-[280px] mt-4 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400"
          >
            (Chart doanh thu)
          </div>
        </div>

        <!-- Thực thu -->
        <div class="bg-white border border-slate-200 rounded-2xl p-4">
          <div class="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <div class="text-lg font-semibold">Thực thu:</div>
            <div class="text-xl font-bold text-blue-600">0đ</div>
          </div>

          <div
            class="h-[280px] mt-4 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center gap-3"
          >
            <div class="text-5xl opacity-40">📊</div>
            <div class="text-slate-600 font-medium">
              Chưa có dữ liệu báo cáo
            </div>
          </div>
        </div>
      </div>

      <!-- Table section -->
      <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div class="p-4 flex items-center gap-3">
          <div class="text-lg font-semibold">Danh sách</div>

          <div
            class="ml-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 w-[220px]"
          >
            <span class="text-sm text-slate-700">Sản phẩm</span>
            <span class="ml-auto text-slate-500">▾</span>
          </div>
        </div>

        <div class="border-t border-slate-200 overflow-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th class="text-left font-medium px-4 py-3 w-[60px]">STT</th>
                <th class="text-left font-medium px-4 py-3">Tên sản phẩm</th>
                <th class="text-left font-medium px-4 py-3 w-[140px]">SKU</th>
                <th class="text-right font-medium px-4 py-3 w-[110px]">
                  SL bán
                </th>
                <th class="text-right font-medium px-4 py-3 w-[140px]">
                  SL đơn hàng
                </th>
                <th class="text-right font-medium px-4 py-3 w-[160px]">
                  Tổng tiền hàng
                </th>
                <th class="text-right font-medium px-4 py-3 w-[120px]">
                  Giảm giá
                </th>
                <th class="text-right font-medium px-4 py-3 w-[160px]">
                  Doanh thu thuần
                </th>
                <th class="text-right font-medium px-4 py-3 w-[100px]">Thuế</th>
                <th class="text-right font-medium px-4 py-3 w-[160px]">
                  Tổng doanh thu
                </th>
              </tr>
            </thead>

            <tbody>
              <tr class="border-t border-slate-200">
                <td class="px-4 py-4 text-slate-500" colspan="10">
                  Chưa có dữ liệu.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PageHeader from "@/staff/components/PageHeader.vue";

const tabs = [
  { key: "today", label: "Hôm nay" },
  { key: "week", label: "Tuần này" },
  { key: "month", label: "Tháng này" },
  { key: "quarter", label: "Quý này" },
  { key: "year", label: "Năm nay" },
];

const activeTab = ref("today");
</script>
