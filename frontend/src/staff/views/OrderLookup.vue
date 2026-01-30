<template>
  <div class="h-full bg-slate-50">
    <PageHeader title="Tra cứu đơn hàng" />

    <div class="p-4">
      <div
        class="grid grid-cols-[360px_1fr] gap-4 min-h-[calc(100vh-64px-32px)]"
      >
        <!-- LEFT: list -->
        <aside
          class="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col"
        >
          <!-- search -->
          <div class="p-3 border-b border-slate-200">
            <div
              class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2"
            >
              <span class="opacity-70">🔎</span>
              <input
                class="bg-transparent outline-none w-full text-sm"
                placeholder="Tìm kiếm đơn hàng (tên, khách hàng, mã ...)"
              />
            </div>

            <div class="mt-3 flex gap-2">
              <div
                class="flex-1 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2"
              >
                <span class="text-sm text-slate-700"
                  >28/12/20.. → 27/01/20..</span
                >
                <span class="ml-auto text-xl"
                  ><i class="fa-regular fa-calendar-days"></i
                ></span>
              </div>

              <div
                class="w-[140px] border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between"
              >
                <span class="text-sm text-slate-700">Chọn kênh</span>
                <span class="text-slate-500">▾</span>
              </div>
            </div>
          </div>

          <!-- order items -->
          <div class="flex-1 min-h-0 overflow-auto">
            <button
              class="w-full text-left p-4 border-b border-slate-200 hover:bg-slate-50 transition relative"
              :class="selected ? 'bg-blue-50' : 'bg-white'"
              @click="selected = true"
            >
              <!-- active left bar -->
              <div
                v-if="selected"
                class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"
              ></div>

              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="font-semibold text-slate-900">#1001</div>
                  <div class="text-sm text-slate-600 mt-1">huy do</div>
                  <div class="text-sm text-slate-500">25/01/2026 20:53</div>
                </div>

                <div class="text-right">
                  <div class="font-semibold text-slate-900">200,000đ</div>
                  <div
                    class="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs border border-slate-200 text-slate-600 bg-white"
                  >
                    Đã thanh toán
                  </div>
                </div>
              </div>
            </button>
          </div>

          <!-- footer left -->
          <div
            class="p-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600"
          >
            <span>Tổng 1 đơn</span>
            <div class="flex items-center gap-2">
              <button
                class="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                ‹
              </button>
              <div
                class="w-8 h-8 rounded-full bg-blue-600 text-white grid place-items-center text-xs font-semibold"
              >
                1
              </div>
              <button
                class="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                ›
              </button>
            </div>
          </div>
        </aside>

        <!-- RIGHT: detail -->
        <section
          class="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col"
        >
          <!-- top detail header -->
          <div
            class="p-4 border-b border-slate-200 flex items-start justify-between gap-4"
          >
            <div>
              <div class="text-xl font-bold text-slate-900">#1001</div>

              <div class="mt-3 space-y-2 text-sm text-slate-700">
                <div class="flex items-center gap-2">
                  <span class="opacity-70">✏️</span> Tạo bởi
                  <b>Admin dohuyy</b> lúc 25/01/2026 20:53
                </div>
                <div class="flex items-center gap-2">
                  <span class="opacity-70">🧰</span> Phụ trách bởi
                  <b>Admin dohuyy</b>
                </div>
                <div class="flex items-center gap-2">
                  <span class="opacity-70">👤</span> Khách hàng: <b>huy do</b> -
                  0562456488
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button
                class="h-11 px-6 rounded-xl border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition font-semibold"
              >
                Hoàn trả
              </button>
              <button
                class="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-semibold"
              >
                In hóa đơn
              </button>
            </div>
          </div>

          <!-- product table -->
          <div class="flex-1 min-h-0 overflow-auto">
            <div class="p-4">
              <div class="border border-slate-200 rounded-2xl overflow-hidden">
                <div
                  class="px-4 py-3 bg-slate-50 font-semibold text-slate-900 border-b border-slate-200"
                >
                  Sản phẩm
                </div>

                <div class="p-4">
                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 grid place-items-center text-slate-400"
                    >
                      🖼️
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="font-semibold text-slate-900">A</div>
                      <div class="text-sm text-slate-500">AAAAAA</div>
                    </div>

                    <div class="w-[60px] text-right text-slate-900">1x</div>
                    <div class="w-[140px] text-right text-slate-900">
                      200,000đ
                    </div>
                    <div
                      class="w-[140px] text-right font-semibold text-slate-900"
                    >
                      200,000đ
                    </div>
                  </div>

                  <div class="mt-4 border-t border-slate-200"></div>

                  <!-- summary area -->
                  <div class="mt-4 grid grid-cols-2 gap-4">
                    <!-- left summary -->
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between text-slate-700">
                        <span>Tổng tiền hàng (1 sản phẩm)</span
                        ><span>200,000đ</span>
                      </div>
                      <div class="flex justify-between text-slate-700">
                        <span>Giảm giá</span><span>0đ</span>
                      </div>
                      <div class="flex justify-between text-slate-700">
                        <span>VAT</span><span>0đ</span>
                      </div>

                      <div
                        class="mt-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex justify-between items-center"
                      >
                        <span class="font-semibold text-slate-900"
                          >Khách phải trả</span
                        >
                        <span class="font-bold text-blue-700 text-lg"
                          >200,000đ</span
                        >
                      </div>
                    </div>

                    <!-- right summary -->
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between text-slate-700">
                        <span>Đã trả</span><span>200,000đ</span>
                      </div>
                      <div class="flex justify-between text-slate-700">
                        <span>Chuyển khoản</span><span>200,000đ</span>
                      </div>

                      <div
                        class="mt-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex justify-between items-center"
                      >
                        <span class="font-semibold text-slate-900">Còn nợ</span>
                        <span class="font-bold text-blue-700 text-lg">0đ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PageHeader from "@/staff/components/PageHeader.vue";

const selected = ref(true);
</script>
