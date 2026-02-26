<template>
  <div class="customer-picker-wrapper">
    <div class="customer-picker-header">
      <i class="fa-solid fa-user search-icon"></i>
      <input
        ref="inputRef"
        type="text"
        placeholder="Tìm kiếm khách hàng"
        class="customer-search-input"
        v-model="searchQuery"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        :disabled="disabled"
      />
      <kbd class="kbd-badge">F4</kbd>
      <button
        class="btn-add-customer"
        @click="openCreateModal"
        :disabled="disabled"
        title="Thêm khách hàng mới"
      >
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>

    <!-- Dropdown Menu -->
    <div v-if="showDropdown" class="customer-dropdown">
      <!-- Quick Action: Add New -->
      <div class="dropdown-action" @mousedown.prevent="openCreateModal">
        <i class="fa-solid fa-plus action-icon"></i>
        <span>Thêm khách hàng mới</span>
      </div>

      <!-- Results List -->
      <div v-if="isSearching" class="dropdown-loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Đang tìm kiếm...</span>
      </div>

      <div v-else-if="searchResults.length > 0" class="dropdown-results">
        <div
          v-for="customer in searchResults"
          :key="customer.id"
          class="customer-item"
          @mousedown.prevent="selectCustomer(customer)"
        >
          <div class="customer-item-name">{{ customer.name }}</div>
          <div class="customer-item-phone">{{ customer.phone }}</div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="searchQuery" class="dropdown-empty">
        Không tìm thấy khách hàng
      </div>

      <!-- Recent/Suggestions when no search -->
      <div v-else class="dropdown-results">
        <div class="dropdown-section-title">Khách hàng gần đây</div>
        <div
          v-for="customer in recentCustomers"
          :key="customer.id"
          class="customer-item"
          @mousedown.prevent="selectCustomer(customer)"
        >
          <div class="customer-item-name">{{ customer.name }}</div>
          <div class="customer-item-phone">{{ customer.phone }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import customerService from "@/services/customerService";

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  branchId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "openCreateCustomer"]);

const inputRef = ref(null);
const searchQuery = ref("");
const showDropdown = ref(false);
const isSearching = ref(false);
const searchResults = ref([]);
const searchTimeout = ref(null);

// Recent customers (load from API on mount)
const recentCustomers = ref([]);

// Load recent customers
const loadRecentCustomers = async () => {
  try {
    const response = await customerService.searchCustomers("", 5);
    if (response.success && response.data) {
      recentCustomers.value = response.data.map((c) => ({
        id: c.id,
        name: c.full_name,
        phone: c.phone || "",
        email: c.email,
        address: c.address,
        group_name: c.group_name,
        discount_percentage: c.discount_percentage,
      }));
    }
  } catch (error) {
    console.error("Error loading recent customers:", error);
  }
};

const handleFocus = () => {
  showDropdown.value = true;
};

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

const handleInput = () => {
  // Debounce search
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  if (!searchQuery.value) {
    isSearching.value = false;
    searchResults.value = [];
    return;
  }

  isSearching.value = true;

  searchTimeout.value = setTimeout(async () => {
    await searchCustomers(searchQuery.value);
    isSearching.value = false;
  }, 300);
};

const searchCustomers = async (query) => {
  try {
    const response = await customerService.searchCustomers(query, 10);
    if (response.success && response.data) {
      // Map response để khớp với format UI: id, name, phone
      searchResults.value = response.data.map((c) => ({
        id: c.id,
        name: c.full_name,
        phone: c.phone || "",
        email: c.email,
        address: c.address,
        group_name: c.group_name,
        discount_percentage: c.discount_percentage,
      }));
    } else {
      searchResults.value = [];
    }
  } catch (error) {
    console.error("Error searching customers:", error);
    searchResults.value = [];
  }
};

const selectCustomer = (customer) => {
  emit("update:modelValue", customer);
  searchQuery.value = "";
  showDropdown.value = false;
};

const openCreateModal = () => {
  emit("openCreateCustomer");
  showDropdown.value = false;
};

const focusInput = () => {
  inputRef.value?.focus();
};

// Keyboard shortcut F4
const handleKeyPress = (e) => {
  if (e.key === "F4") {
    e.preventDefault();
    focusInput();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyPress);
  loadRecentCustomers();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyPress);
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
});

defineExpose({
  focusInput,
  selectCustomer,
});
</script>

<style scoped>
.customer-picker-wrapper {
  position: relative;
}

.customer-picker-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 1rem;
  z-index: 1;
  pointer-events: none;
}

.customer-search-input {
  flex: 1;
  padding: 10px 14px 10px 42px;
  padding-right: 80px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
}

.customer-search-input:focus {
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.customer-search-input:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

.kbd-badge {
  position: absolute;
  right: 56px;
  padding: 3px 7px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  pointer-events: none;
}

.btn-add-customer {
  position: absolute;
  right: 8px;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: #1e40af;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.btn-add-customer:hover:not(:disabled) {
  background: #1e3a8a;
  transform: scale(1.05);
}

.btn-add-customer:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dropdown Menu */
.customer-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 320px;
  overflow-y: auto;
  z-index: 50;
}

.dropdown-action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f1f5f9;
  font-weight: 500;
  color: #1e40af;
}

.dropdown-action:hover {
  background: #f8fafc;
}

.action-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1e40af;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.dropdown-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: #64748b;
  font-size: 0.875rem;
}

.dropdown-section-title {
  padding: 8px 14px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dropdown-results {
  /* Container for customer items */
}

.customer-item {
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f8fafc;
}

.customer-item:last-child {
  border-bottom: none;
}

.customer-item:hover {
  background: #f8fafc;
}

.customer-item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.customer-item-phone {
  font-size: 0.8rem;
  color: #64748b;
}

.dropdown-empty {
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
}

/* Scrollbar */
.customer-dropdown::-webkit-scrollbar {
  width: 6px;
}

.customer-dropdown::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.customer-dropdown::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.customer-dropdown::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
