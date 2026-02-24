<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="isOpen" class="payment-drawer-overlay" @click="handleClose">
        <div class="payment-drawer" @click.stop>
          <!-- Header -->
          <div class="drawer-header">
            <h2 class="drawer-title">Thanh toán</h2>
            <div class="multi-method-toggle">
              <span class="toggle-label">Nhiều phương thức</span>
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="multiMethodEnabled"
                  :disabled="isProcessing"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Payment Method Selector -->
          <div class="payment-methods">
            <button
              v-for="method in paymentMethods"
              :key="method.id"
              class="method-btn"
              :class="{ active: activeMethod === method.id }"
              @click="selectMethod(method.id)"
              :disabled="isProcessing"
            >
              <div class="method-icon">
                <i :class="method.icon"></i>
              </div>
              <div class="method-label">{{ method.label }}</div>
            </button>
          </div>

          <!-- Content Area -->
          <div class="drawer-content">
            <!-- Amount Summary -->
            <div class="amount-section">
              <div class="amount-row">
                <span class="amount-label">Khách phải trả</span>
                <span class="amount-value">{{
                  formatPrice(totalPayable)
                }}</span>
              </div>

              <div class="amount-row primary">
                <span class="amount-label">Tiền khách đưa</span>
                <div class="amount-input-wrapper">
                  <input
                    ref="amountInputRef"
                    type="text"
                    class="amount-input"
                    v-model="amountReceivedDisplay"
                    @focus="handleAmountFocus"
                    @blur="handleAmountBlur"
                    @input="handleAmountInput"
                    :disabled="isProcessing"
                  />
                </div>
              </div>

              <div class="amount-row">
                <span class="amount-label">
                  {{
                    activeMethod === "cash" && amountReceived > totalPayable
                      ? "Tiền thừa trả khách"
                      : "Khách còn phải trả"
                  }}
                </span>
                <span
                  class="amount-value remaining"
                  :class="{
                    paid: remaining === 0,
                    change:
                      activeMethod === 'cash' && amountReceived > totalPayable,
                  }"
                >
                  {{
                    activeMethod === "cash" && amountReceived > totalPayable
                      ? formatPrice(amountReceived - totalPayable)
                      : formatPrice(remaining)
                  }}
                </span>
              </div>
            </div>

            <!-- Cash Method: Quick Amount Chips -->
            <div v-if="activeMethod === 'cash'" class="quick-amounts">
              <button
                v-for="amount in quickAmounts"
                :key="amount"
                class="chip-btn"
                :class="{ active: selectedChip === amount }"
                @click="selectQuickAmount(amount)"
                :disabled="isProcessing"
              >
                {{ formatPrice(amount) }}
              </button>
            </div>

            <!-- Bank Transfer: Beneficiary Row -->
            <div v-if="activeMethod === 'bank'" class="transfer-section">
              <button
                class="beneficiary-row"
                @click="showBeneficiaryModal = true"
                :disabled="isProcessing"
              >
                <span class="beneficiary-label">
                  Thiết lập tài khoản thụ hưởng
                </span>
                <i class="fa-solid fa-chevron-right"></i>
              </button>
              <div v-if="selectedBeneficiary" class="selected-beneficiary">
                <div class="beneficiary-info">
                  <div class="beneficiary-name">
                    {{ selectedBeneficiary.name }}
                  </div>
                  <div class="beneficiary-account">
                    {{ selectedBeneficiary.bank }} -
                    {{ selectedBeneficiary.accountNumber }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Payment: Additional Info (if needed) -->
            <div v-if="activeMethod === 'card'" class="card-section">
              <div class="info-message">
                <i class="fa-solid fa-credit-card"></i>
                <span>Vui lòng quẹt thẻ hoặc nhập thông tin thẻ</span>
              </div>
            </div>

            <!-- QR Code Payment Section -->
            <div v-if="activeMethod === 'bank_qr'" class="qr-section">
              <div v-if="isLoadingQR" class="qr-loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Đang tạo mã QR...</span>
              </div>

              <div v-else-if="qrData" class="qr-content">
                <!-- QR Image -->
                <div class="qr-image-wrapper">
                  <img
                    :src="qrData.qr_url"
                    alt="QR Code thanh toán"
                    class="qr-image"
                  />
                </div>

                <!-- Bank Info -->
                <div class="qr-bank-info">
                  <div class="qr-info-row">
                    <span class="qr-info-label">Ngân hàng</span>
                    <span class="qr-info-value">{{ qrData.bank_name }}</span>
                  </div>
                  <div class="qr-info-row">
                    <span class="qr-info-label">Số tài khoản</span>
                    <span class="qr-info-value account-number">{{
                      qrData.account_number
                    }}</span>
                  </div>
                  <div class="qr-info-row">
                    <span class="qr-info-label">Chủ tài khoản</span>
                    <span class="qr-info-value">{{ qrData.account_name }}</span>
                  </div>
                  <div class="qr-info-row">
                    <span class="qr-info-label">Số tiền</span>
                    <span class="qr-info-value amount">{{
                      formatPrice(qrData.amount)
                    }}</span>
                  </div>
                  <div class="qr-info-row">
                    <span class="qr-info-label">Nội dung CK</span>
                    <span class="qr-info-value transfer-content">{{
                      qrData.transfer_content
                    }}</span>
                  </div>
                </div>

                <!-- Confirm Payment -->
                <div v-if="!qrPaymentConfirmed" class="qr-status">
                  <div class="qr-status-icon">
                    <i class="fa-solid fa-clock"></i>
                  </div>
                  <span>Đang chờ khách hàng quét mã...</span>
                  <div class="qr-polling-dot"></div>
                </div>
                <div v-else class="qr-status qr-status-success">
                  <i class="fa-solid fa-circle-check"></i>
                  <span v-if="qrTransactionInfo">
                    Đã nhận {{ formatPrice(qrTransactionInfo.amount) }} từ
                    {{ qrTransactionInfo.gateway }}
                  </span>
                  <span v-else>Đã xác nhận nhận tiền thành công</span>
                </div>

                <div class="qr-actions">
                  <button
                    v-if="!qrPaymentConfirmed"
                    class="qr-confirm-btn"
                    @click="confirmQRPayment"
                  >
                    <i class="fa-solid fa-check-circle"></i>
                    Xác nhận thủ công
                  </button>

                  <!-- Refresh button -->
                  <button
                    class="qr-refresh-btn"
                    @click="loadQRCode"
                    :disabled="isLoadingQR"
                  >
                    <i class="fa-solid fa-rotate"></i>
                    Tạo lại mã QR
                  </button>
                </div>
              </div>

              <div v-else class="qr-error">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>{{ qrErrorMessage || "Không thể tạo mã QR" }}</span>
                <button class="qr-retry-btn" @click="loadQRCode">
                  Thử lại
                </button>
              </div>
            </div>

            <!-- Hint Bar -->
            <div class="hint-bar">
              <div class="hint-item">
                <kbd class="kbd">F9</kbd>
                <span>Hoàn tất</span>
              </div>
              <div class="hint-item">
                <kbd class="kbd">Space</kbd>
                <span>Đổi phương thức</span>
              </div>
              <div class="hint-item">
                <kbd class="kbd">↑ ↓</kbd>
                <span>Chọn số tiền</span>
              </div>
              <div class="hint-item">
                <kbd class="kbd">ESC</kbd>
                <span>Đóng</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="drawer-footer">
            <button
              class="btn-complete"
              @click="handleComplete"
              :disabled="!canComplete || isProcessing"
            >
              <i v-if="isProcessing" class="fa-solid fa-spinner fa-spin"></i>
              <span v-else>Hoàn tất</span>
              <kbd class="kbd">F9</kbd>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { ElMessage } from "element-plus";
import posService from "@/services/posService";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "complete", "cancel"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// State
const activeMethod = ref("cash");
const multiMethodEnabled = ref(false);
const amountReceived = ref(0);
const amountReceivedDisplay = ref("");
const selectedChip = ref(null);
const isProcessing = ref(false);
const amountInputRef = ref(null);
const showBeneficiaryModal = ref(false);
const selectedBeneficiary = ref(null);
const isLoadingQR = ref(false);
const qrData = ref(null);
const qrPaymentConfirmed = ref(false);
const qrErrorMessage = ref("");
const qrPollingTimer = ref(null);
const qrTransactionInfo = ref(null);

const paymentMethods = [
  { id: "cash", label: "Tiền mặt", icon: "fa-solid fa-money-bill-wave" },
  { id: "bank_qr", label: "QR Code", icon: "fa-solid fa-qrcode" },
  { id: "bank", label: "Chuyển khoản", icon: "fa-solid fa-building-columns" },
  { id: "card", label: "Thanh toán thẻ", icon: "fa-solid fa-credit-card" },
];

// Computed
const totalPayable = computed(() => props.totalAmount);

const remaining = computed(() => {
  return Math.max(0, totalPayable.value - amountReceived.value);
});

const canComplete = computed(() => {
  if (activeMethod.value === "bank_qr") {
    return qrPaymentConfirmed.value && !isProcessing.value;
  }
  return amountReceived.value >= totalPayable.value && !isProcessing.value;
});

const quickAmounts = computed(() => {
  const total = totalPayable.value;
  return [
    total, // Exact amount
    Math.ceil(total / 1000) * 1000, // Round to nearest 1k
    Math.ceil(total / 5000) * 5000, // Round to nearest 5k
    Math.ceil(total / 10000) * 10000, // Round to nearest 10k
    Math.ceil(total / 50000) * 50000, // Round to nearest 50k
    Math.ceil(total / 100000) * 100000, // Round to nearest 100k
  ].filter((amt, idx, arr) => arr.indexOf(amt) === idx); // Remove duplicates
});

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const selectMethod = (methodId) => {
  activeMethod.value = methodId;
  selectedChip.value = null;

  // Auto-fill exact amount for non-cash methods
  if (methodId !== "cash") {
    amountReceived.value = totalPayable.value;
    amountReceivedDisplay.value = formatPrice(totalPayable.value);
  }

  // Auto-generate QR code when selecting QR method
  if (methodId === "bank_qr") {
    loadQRCode();
    return;
  }

  // Focus amount input when switching method
  nextTick(() => {
    amountInputRef.value?.focus();
  });
};

const loadQRCode = async () => {
  isLoadingQR.value = true;
  qrData.value = null;
  qrPaymentConfirmed.value = false;
  qrErrorMessage.value = "";
  qrTransactionInfo.value = null;
  stopQRPolling();

  try {
    const response = await posService.generateQRCode({
      amount: totalPayable.value,
      order_info: props.orderData?.order_code || `POS-${Date.now()}`,
    });
    qrData.value = response.data;
    // Bắt đầu polling kiểm tra thanh toán từ Sepay
    startQRPolling();
  } catch (error) {
    console.error("QR generation failed:", error);
    qrErrorMessage.value =
      error.message || "Không thể tạo mã QR. Vui lòng thử lại.";
    ElMessage.error(qrErrorMessage.value);
  } finally {
    isLoadingQR.value = false;
  }
};

// Sepay auto-polling: kiểm tra mỗi 3 giây
const startQRPolling = () => {
  stopQRPolling();
  qrPollingTimer.value = setInterval(async () => {
    if (!qrData.value || qrPaymentConfirmed.value) {
      stopQRPolling();
      return;
    }
    try {
      const result = await posService.checkQRPayment({
        amount: qrData.value.amount,
        account_number: qrData.value.account_number,
        transfer_content: qrData.value.transfer_content,
      });
      if (result.data?.paid) {
        // Tự động xác nhận thanh toán!
        qrPaymentConfirmed.value = true;
        qrTransactionInfo.value = result.data.transaction;
        amountReceived.value = totalPayable.value;
        amountReceivedDisplay.value = formatPrice(totalPayable.value);
        stopQRPolling();
        ElMessage.success({
          message: "Đã nhận được chuyển khoản thành công!",
          duration: 5000,
        });
      }
    } catch (err) {
      // Im lặng, tiếp tục polling
    }
  }, 3000);
};

const stopQRPolling = () => {
  if (qrPollingTimer.value) {
    clearInterval(qrPollingTimer.value);
    qrPollingTimer.value = null;
  }
};

const confirmQRPayment = () => {
  qrPaymentConfirmed.value = true;
  amountReceived.value = totalPayable.value;
  amountReceivedDisplay.value = formatPrice(totalPayable.value);
  stopQRPolling();
  ElMessage.success("Xác nhận thanh toán QR thành công!");
};

const selectQuickAmount = (amount) => {
  selectedChip.value = amount;
  amountReceived.value = amount;
  amountReceivedDisplay.value = formatPrice(amount);
};

const handleAmountFocus = () => {
  // Remove currency formatting for editing
  amountReceivedDisplay.value = amountReceived.value.toString();
};

const handleAmountBlur = () => {
  // Reformat with currency
  amountReceivedDisplay.value = formatPrice(amountReceived.value);
};

const handleAmountInput = (e) => {
  // Remove non-digits
  const value = e.target.value.replace(/\D/g, "");
  amountReceived.value = parseInt(value) || 0;
  selectedChip.value = null; // Deselect chip when manually typing
};

const handleComplete = async () => {
  if (!canComplete.value) {
    ElMessage.warning("Số tiền khách đưa chưa đủ");
    return;
  }

  isProcessing.value = true;

  try {
    const paymentData = {
      method: activeMethod.value,
      totalAmount: totalPayable.value,
      amountReceived: amountReceived.value,
      change: amountReceived.value - totalPayable.value,
      beneficiary:
        activeMethod.value === "bank" ? selectedBeneficiary.value : null,
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    emit("complete", paymentData);
    ElMessage.success("Thanh toán thành công!");
    handleClose();
  } catch (error) {
    ElMessage.error("Có lỗi xảy ra khi thanh toán");
  } finally {
    isProcessing.value = false;
  }
};

const handleClose = () => {
  if (isProcessing.value) return;
  stopQRPolling();
  emit("cancel");
  isOpen.value = false;
};

const cyclePaymentMethod = () => {
  const methods = ["cash", "bank_qr", "bank", "card"];
  const currentIndex = methods.indexOf(activeMethod.value);
  const nextIndex = (currentIndex + 1) % methods.length;
  selectMethod(methods[nextIndex]);
};

const navigateQuickAmounts = (direction) => {
  if (activeMethod.value !== "cash") return;

  const currentIndex = selectedChip.value
    ? quickAmounts.value.indexOf(selectedChip.value)
    : -1;

  let nextIndex;
  if (direction === "up") {
    nextIndex =
      currentIndex > 0 ? currentIndex - 1 : quickAmounts.value.length - 1;
  } else {
    nextIndex =
      currentIndex < quickAmounts.value.length - 1 ? currentIndex + 1 : 0;
  }

  selectQuickAmount(quickAmounts.value[nextIndex]);
};

// Keyboard shortcuts
const handleKeyPress = (e) => {
  if (!isOpen.value) return;

  if (e.key === "Escape") {
    e.preventDefault();
    handleClose();
  } else if (e.key === "F9") {
    e.preventDefault();
    handleComplete();
  } else if (e.key === " " && e.target.tagName !== "INPUT") {
    e.preventDefault();
    cyclePaymentMethod();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    navigateQuickAmounts("up");
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    navigateQuickAmounts("down");
  }
};

// Initialize amount when opened
watch(
  () => isOpen.value,
  (newVal) => {
    if (newVal) {
      amountReceived.value = totalPayable.value;
      amountReceivedDisplay.value = formatPrice(totalPayable.value);
      selectedChip.value = totalPayable.value;
      activeMethod.value = "cash";
      qrData.value = null;
      isLoadingQR.value = false;
      qrPaymentConfirmed.value = false;
      qrErrorMessage.value = "";
      qrTransactionInfo.value = null;
      stopQRPolling();

      // Focus input after opening
      nextTick(() => {
        amountInputRef.value?.focus();
        amountInputRef.value?.select();
      });
    }
  },
);

onMounted(() => {
  window.addEventListener("keydown", handleKeyPress);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyPress);
  stopQRPolling();
});
</script>

<style scoped>
/* Overlay & Drawer */
.payment-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  z-index: 9999;
}

.payment-drawer {
  width: 480px;
  max-width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
}

/* Header */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.drawer-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.multi-method-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #1e40af;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Payment Methods */
.payment-methods {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border: 2px solid transparent;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.method-btn:hover:not(:disabled) {
  background: #f8fafc;
}

.method-btn.active {
  border-color: #1e40af;
  background: #eff6ff;
}

.method-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.method-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #64748b;
  transition: all 0.2s;
}

.method-btn.active .method-icon {
  background: #1e40af;
  color: white;
}

.method-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-align: center;
  line-height: 1.2;
}

.method-btn.active .method-label {
  color: #1e40af;
}

/* Content Area */
.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Amount Section */
.amount-section {
  margin-bottom: 24px;
}

.amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.amount-row.primary {
  background: #f8fafc;
  padding: 16px 16px;
  margin: 0 -16px;
  border-radius: 8px;
  border-bottom: none;
}

.amount-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.amount-row.primary .amount-label {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.amount-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.amount-value.remaining {
  color: #dc2626;
  font-size: 1.1rem;
  font-weight: 700;
}

.amount-value.remaining.paid {
  color: #16a34a;
}

.amount-value.remaining.change {
  color: #16a34a;
}

.amount-input-wrapper {
  flex: 1;
  max-width: 200px;
}

.amount-input {
  width: 100%;
  text-align: right;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e40af;
  border: none;
  border-bottom: 2px solid #1e40af;
  background: transparent;
  padding: 4px 8px;
  outline: none;
}

/* Quick Amounts */
.quick-amounts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.chip-btn {
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-btn:hover:not(:disabled) {
  border-color: #1e40af;
  background: #f8fafc;
}

.chip-btn.active {
  border-color: #1e40af;
  background: #eff6ff;
  color: #1e40af;
}

.chip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transfer Section */
.transfer-section {
  margin-bottom: 24px;
}

.beneficiary-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.beneficiary-row:hover:not(:disabled) {
  border-color: #1e40af;
  background: #f8fafc;
}

.beneficiary-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e40af;
}

.beneficiary-row i {
  color: #94a3b8;
}

.selected-beneficiary {
  margin-top: 12px;
  padding: 12px;
  background: #eff6ff;
  border-radius: 8px;
}

.beneficiary-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.beneficiary-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.beneficiary-account {
  font-size: 0.8rem;
  color: #64748b;
}

/* Card Section */
.card-section {
  margin-bottom: 24px;
}

.info-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fffbeb;
  border: 1px solid #fde047;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #854d0e;
}

.info-message i {
  font-size: 1.25rem;
  color: #ca8a04;
}

/* Hint Bar */
.hint-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-top: auto;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #64748b;
}

/* Footer */
.drawer-footer {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.btn-complete {
  width: 100%;
  padding: 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
}

.btn-complete:hover:not(:disabled) {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  box-shadow: 0 6px 16px rgba(30, 64, 175, 0.4);
  transform: translateY(-1px);
}

.btn-complete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.kbd {
  padding: 3px 7px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-active .payment-drawer,
.drawer-leave-active .payment-drawer {
  transition: transform 0.3s ease;
}

.drawer-enter-from .payment-drawer,
.drawer-leave-to .payment-drawer {
  transform: translateX(100%);
}

/* Scrollbar */
.drawer-content::-webkit-scrollbar {
  width: 6px;
}

.drawer-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.drawer-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 640px) {
  .payment-drawer {
    width: 100%;
  }

  .payment-methods {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ===== QR Code Section ===== */
.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: #64748b;
  font-size: 14px;
}
.qr-loading i {
  font-size: 28px;
  color: #3b82f6;
}

.qr-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.qr-image-wrapper {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.qr-image {
  width: 220px;
  height: auto;
  display: block;
  border-radius: 8px;
}

.qr-bank-info {
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qr-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.qr-info-label {
  color: #64748b;
  font-weight: 500;
}

.qr-info-value {
  color: #1e293b;
  font-weight: 600;
  text-align: right;
}

.qr-info-value.account-number {
  font-family: "Courier New", monospace;
  letter-spacing: 0.5px;
  color: #3b82f6;
}

.qr-info-value.amount {
  color: #059669;
  font-size: 15px;
}

.qr-info-value.transfer-content {
  color: #7c3aed;
  font-family: "Courier New", monospace;
  font-size: 12px;
}

.qr-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #fef9c3;
  border: 1px solid #fde68a;
  border-radius: 8px;
  color: #92400e;
  font-size: 13px;
  font-weight: 500;
  width: 100%;
}
.qr-status-success {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #065f46;
}
.qr-status-success i {
  color: #059669;
  font-size: 18px;
}
.qr-status-icon {
  animation: pulse 2s ease-in-out infinite;
}

.qr-polling-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  margin-left: auto;
  animation: pollingBlink 1.5s ease-in-out infinite;
}

@keyframes pollingBlink {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(0.7);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.qr-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}

.qr-confirm-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #059669, #10b981);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
}
.qr-confirm-btn:hover {
  background: linear-gradient(135deg, #047857, #059669);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
  transform: translateY(-1px);
}
.qr-confirm-btn:active {
  transform: translateY(0);
}

.qr-refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #3b82f6;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.qr-refresh-btn:hover {
  background: #dbeafe;
}
.qr-refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qr-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 0;
  color: #ef4444;
  font-size: 14px;
}
.qr-error i {
  font-size: 28px;
}

.qr-retry-btn {
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  background: #ef4444;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.qr-retry-btn:hover {
  background: #dc2626;
}
</style>
