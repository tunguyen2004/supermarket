<template>
  <header
    class="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50"
  >
    <div class="h-full flex items-center">
      <!-- logo (w-16 giống POS) -->
      <div class="w-16 flex items-center justify-center">
        <img src="/logo-icon.png" alt="Logo" class="w-10 h-10 object-contain" />
      </div>

      <!-- title -->
      <div class="flex-1 flex items-center justify-between pr-4">
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-semibold text-slate-900">{{ title }}</h1>
        </div>

        <!-- right: branch + user -->
        <div class="ml-auto flex items-center gap-3">
          <!-- Branch Info -->
          <div
            class="flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            <span class="text-xl"
              ><i class="fa-solid fa-location-dot"></i
            ></span>
            <span class="text-xs font-medium">Cửa hàng chính</span>
          </div>

          <!-- Status Icons -->
          <div class="flex items-center gap-1">
            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition"
              title="Kết nối WiFi"
            >
              <span class="text-lg"><i class="fa-solid fa-wifi"></i></span>
            </button>

            <button
              class="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition"
              title="Thông báo"
            >
              <span class="text-xl"><i class="fa-solid fa-bell"></i></span>
              <span
                class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
              >
                2
              </span>
            </button>
          </div>

          <!-- User Avatar -->
          <el-dropdown trigger="click" placement="bottom-end">
            <div class="user-avatar" :title="userDisplayName">
              {{ userInitials }}
            </div>

            <template #dropdown>
              <div
                class="w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2 text-slate-800 text-lg"
              >
                <div
                  class="px-3 py-2 font-semibold border-b border-slate-200 mb-2"
                >
                  <span class="user-name">{{ userDisplayName }}</span>
                </div>
                <button class="menu-item">
                  <span class="mr-2"><i class="fa-solid fa-heart"></i></span>
                  Góp ý
                </button>
                <button class="menu-item" @click="logout">
                  <span class="mr-2"
                    ><i class="fa-solid fa-arrow-right-from-bracket"></i
                  ></span>
                  Đăng xuất
                </button>
              </div>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useAuth } from "@/composables/useAuth";

defineProps({
  title: { type: String, required: true },
});

const { logout, user } = useAuth();

const userDisplayName = computed(
  () => user.value?.full_name || user.value?.username || "Admin dohuyy",
);
const userInitials = computed(() => {
  const name = userDisplayName.value;
  return name.charAt(0).toUpperCase();
});
</script>

<style scoped>
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.3);
}

.user-avatar:hover {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.4);
}

.user-name {
  font-weight: 600;
}

.menu-item {
  width: 100%;
  text-align: left;
  padding: 10px 10px;
  border-radius: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.menu-item:hover {
  background: rgb(241 245 249); /* slate-100 */
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}
</style>
