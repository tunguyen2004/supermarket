<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">Thêm mới khách hàng</h2>
            <button class="btn-close" @click="handleClose" title="Đóng (ESC)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <!-- Sidebar Navigation -->
            <nav class="section-nav">
              <button
                v-for="section in sections"
                :key="section.id"
                class="nav-item"
                :class="{ active: activeSection === section.id }"
                @click="scrollToSection(section.id)"
              >
                <i :class="section.icon" class="nav-icon"></i>
                <span>{{ section.label }}</span>
                <i
                  v-if="section.hasError"
                  class="fa-solid fa-circle-exclamation error-indicator"
                ></i>
              </button>
            </nav>

            <!-- Content Area (Scrollable) -->
            <div
              class="content-area"
              ref="contentAreaRef"
              @scroll="handleScroll"
            >
              <!-- Section: Thông tin cơ bản -->
              <div :id="`section-basic`" class="form-section">
                <h3 class="section-title">Thông tin cơ bản</h3>

                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Họ</label>
                    <input
                      v-model="form.firstName"
                      type="text"
                      class="form-input"
                      placeholder="Nhập họ"
                      :disabled="isSubmitting"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Tên</label>
                    <input
                      v-model="form.lastName"
                      type="text"
                      class="form-input"
                      placeholder="Nhập tên"
                      :disabled="isSubmitting"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Email</label>
                    <input
                      v-model="form.email"
                      type="email"
                      class="form-input"
                      :class="{ 'has-error': errors.email }"
                      placeholder="email@example.com"
                      :disabled="isSubmitting"
                    />
                    <span v-if="errors.email" class="error-message">{{
                      errors.email
                    }}</span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Số điện thoại</label>
                    <div class="phone-input-group">
                      <select
                        v-model="form.phoneCountryCode"
                        class="phone-prefix"
                        :disabled="isSubmitting"
                      >
                        <option value="VN">🇻🇳 +84</option>
                        <option value="US">🇺🇸 +1</option>
                        <option value="CN">🇨🇳 +86</option>
                      </select>
                      <input
                        v-model="form.phoneNumber"
                        type="tel"
                        class="form-input phone-number"
                        :class="{ 'has-error': errors.phoneNumber }"
                        placeholder="901234567"
                        :disabled="isSubmitting"
                      />
                    </div>
                    <span v-if="errors.phoneNumber" class="error-message">{{
                      errors.phoneNumber
                    }}</span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Ngày sinh</label>
                    <input
                      v-model="form.dob"
                      type="date"
                      class="form-input"
                      :class="{ 'has-error': errors.dob }"
                      :max="today"
                      :disabled="isSubmitting"
                    />
                    <span v-if="errors.dob" class="error-message">{{
                      errors.dob
                    }}</span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Giới tính</label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input
                          v-model="form.gender"
                          type="radio"
                          value="male"
                          :disabled="isSubmitting"
                        />
                        <span>Nam</span>
                      </label>
                      <label class="radio-label">
                        <input
                          v-model="form.gender"
                          type="radio"
                          value="female"
                          :disabled="isSubmitting"
                        />
                        <span>Nữ</span>
                      </label>
                      <label class="radio-label">
                        <input
                          v-model="form.gender"
                          type="radio"
                          value="other"
                          :disabled="isSubmitting"
                        />
                        <span>Khác</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="form-group full-width">
                  <label class="checkbox-label">
                    <input
                      v-model="form.marketingOptIn"
                      type="checkbox"
                      :disabled="isSubmitting"
                    />
                    <span>Khách hàng muốn nhận tiếp thị</span>
                  </label>
                </div>
              </div>

              <!-- Section: Địa chỉ -->
              <div :id="`section-address`" class="form-section">
                <h3 class="section-title">Địa chỉ</h3>

                <div class="form-group">
                  <label class="form-label">Quốc gia</label>
                  <select
                    v-model="form.country"
                    class="form-input"
                    :disabled="isSubmitting"
                  >
                    <option value="Vietnam">Vietnam</option>
                    <option value="USA">United States</option>
                    <option value="China">China</option>
                  </select>
                </div>

                <div class="form-group full-width">
                  <label class="checkbox-label">
                    <input
                      v-model="form.hasNewAddress"
                      type="checkbox"
                      :disabled="isSubmitting"
                    />
                    <span>Địa chỉ mới</span>
                    <i
                      class="fa-solid fa-circle-info info-icon"
                      title="Bật để nhập địa chỉ chi tiết"
                    ></i>
                  </label>
                </div>

                <!-- Address Details (Progressive Disclosure) -->
                <Transition name="expand">
                  <div v-if="form.hasNewAddress" class="address-details">
                    <div class="form-grid">
                      <div class="form-group">
                        <label class="form-label">Tỉnh/Thành phố</label>
                        <select
                          v-model="form.provinceId"
                          class="form-input"
                          :disabled="isSubmitting"
                          @change="handleProvinceChange"
                        >
                          <option value="">-- Chọn tỉnh/thành phố --</option>
                          <option
                            v-for="province in provinces"
                            :key="province.id"
                            :value="province.id"
                          >
                            {{ province.name }}
                          </option>
                        </select>
                      </div>

                      <div class="form-group">
                        <label class="form-label">Quận/Huyện</label>
                        <select
                          v-model="form.districtId"
                          class="form-input"
                          :disabled="isSubmitting || !form.provinceId"
                          @change="handleDistrictChange"
                        >
                          <option value="">-- Chọn quận/huyện --</option>
                          <option
                            v-for="district in districts"
                            :key="district.id"
                            :value="district.id"
                          >
                            {{ district.name }}
                          </option>
                        </select>
                      </div>

                      <div class="form-group">
                        <label class="form-label">Phường/Xã</label>
                        <select
                          v-model="form.wardId"
                          class="form-input"
                          :disabled="isSubmitting || !form.districtId"
                        >
                          <option value="">-- Chọn phường/xã --</option>
                          <option
                            v-for="ward in wards"
                            :key="ward.id"
                            :value="ward.id"
                          >
                            {{ ward.name }}
                          </option>
                        </select>
                      </div>

                      <div class="form-group full-width">
                        <label class="form-label">Địa chỉ chi tiết</label>
                        <input
                          v-model="form.addressLine"
                          type="text"
                          class="form-input"
                          placeholder="Số nhà, tên đường..."
                          :disabled="isSubmitting"
                        />
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- Section: Thông tin xuất hoá đơn -->
              <div :id="`section-invoice`" class="form-section">
                <h3 class="section-title">Thông tin xuất hoá đơn</h3>

                <div class="form-group full-width">
                  <label class="checkbox-label checkbox-toggle">
                    <input
                      v-model="form.hasInvoiceInfo"
                      type="checkbox"
                      :disabled="isSubmitting"
                    />
                    <span>Khách có thông tin xuất hoá đơn</span>
                  </label>
                </div>

                <!-- Invoice Details (Progressive Disclosure) -->
                <Transition name="expand">
                  <div v-if="form.hasInvoiceInfo" class="invoice-details">
                    <div class="form-grid">
                      <div class="form-group">
                        <label class="form-label">Mã số thuế</label>
                        <div class="input-with-button">
                          <input
                            v-model="form.taxCode"
                            type="text"
                            class="form-input"
                            :class="{ 'has-error': errors.taxCode }"
                            placeholder="Nhập mã số thuế"
                            :disabled="isSubmitting"
                          />
                          <button
                            class="btn-fetch-info"
                            @click="fetchCompanyInfo"
                            :disabled="isSubmitting || !form.taxCode"
                          >
                            <i
                              v-if="isFetchingInfo"
                              class="fa-solid fa-spinner fa-spin"
                            ></i>
                            <span v-else>Lấy thông tin</span>
                          </button>
                        </div>
                        <span v-if="errors.taxCode" class="error-message">{{
                          errors.taxCode
                        }}</span>
                      </div>

                      <div class="form-group">
                        <label class="form-label">Tên công ty</label>
                        <input
                          v-model="form.companyName"
                          type="text"
                          class="form-input"
                          placeholder="Nhập tên công ty"
                          :disabled="isSubmitting"
                        />
                      </div>

                      <div class="form-group full-width">
                        <label class="form-label">Địa chỉ công ty</label>
                        <input
                          v-model="form.invoiceAddress"
                          type="text"
                          class="form-input"
                          placeholder="Nhập địa chỉ công ty"
                          :disabled="isSubmitting"
                        />
                      </div>

                      <div class="form-group">
                        <label class="form-label">Tên người mua</label>
                        <input
                          v-model="form.buyerName"
                          type="text"
                          class="form-input"
                          placeholder="Nhập tên người mua"
                          :disabled="isSubmitting"
                        />
                      </div>

                      <div class="form-group">
                        <label class="form-label"
                          >Số điện thoại người mua</label
                        >
                        <input
                          v-model="form.buyerPhone"
                          type="tel"
                          class="form-input"
                          placeholder="Nhập số điện thoại"
                          :disabled="isSubmitting"
                        />
                      </div>

                      <div class="form-group">
                        <label class="form-label">Số căn cước công dân</label>
                        <input
                          v-model="form.buyerIdNumber"
                          type="text"
                          class="form-input"
                          placeholder="Nhập CCCD"
                          :disabled="isSubmitting"
                        />
                      </div>

                      <div class="form-group">
                        <label class="form-label">Email nhận hoá đơn</label>
                        <input
                          v-model="form.invoiceEmail"
                          type="email"
                          class="form-input"
                          :class="{ 'has-error': errors.invoiceEmail }"
                          placeholder="email@company.com"
                          :disabled="isSubmitting"
                        />
                        <span
                          v-if="errors.invoiceEmail"
                          class="error-message"
                          >{{ errors.invoiceEmail }}</span
                        >
                      </div>

                      <div class="form-group full-width">
                        <label class="form-label"
                          >Mã đơn vị quan hệ ngân sách (tuỳ chọn)</label
                        >
                        <input
                          v-model="form.budgetUnitCode"
                          type="text"
                          class="form-input"
                          placeholder="Nhập mã đơn vị (nếu có)"
                          :disabled="isSubmitting"
                        />
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button
              class="btn btn-secondary"
              @click="handleClose"
              :disabled="isSubmitting"
            >
              <span>Huỷ</span>
              <kbd class="kbd">ESC</kbd>
            </button>
            <button
              class="btn btn-primary"
              @click="handleSubmit"
              :disabled="isSubmitting"
            >
              <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
              <span v-else>Thêm</span>
              <kbd class="kbd">F8</kbd>
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
  reactive,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "created"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const activeSection = ref("basic");
const isSubmitting = ref(false);
const isFetchingInfo = ref(false);
const contentAreaRef = ref(null);

const today = new Date().toISOString().split("T")[0];

const sections = [
  {
    id: "basic",
    label: "Thông tin cơ bản",
    icon: "fa-solid fa-user",
    hasError: false,
  },
  {
    id: "address",
    label: "Địa chỉ",
    icon: "fa-solid fa-location-dot",
    hasError: false,
  },
  {
    id: "invoice",
    label: "Thông tin xuất hoá đơn",
    icon: "fa-solid fa-file-invoice",
    hasError: false,
  },
];

const form = reactive({
  // Basic
  firstName: "",
  lastName: "",
  email: "",
  phoneCountryCode: "VN",
  phoneNumber: "",
  dob: null,
  gender: null,
  marketingOptIn: false,

  // Address
  country: "Vietnam",
  hasNewAddress: false,
  provinceId: null,
  districtId: null,
  wardId: null,
  addressLine: "",

  // Invoice
  hasInvoiceInfo: false,
  taxCode: "",
  companyName: "",
  invoiceAddress: "",
  buyerName: "",
  buyerPhone: "",
  buyerIdNumber: "",
  invoiceEmail: "",
  budgetUnitCode: "",
});

const errors = reactive({
  email: "",
  phoneNumber: "",
  dob: "",
  taxCode: "",
  invoiceEmail: "",
});

// Mock data for provinces/districts/wards (replace with API)
const provinces = ref([
  { id: "1", name: "Hà Nội" },
  { id: "2", name: "Hồ Chí Minh" },
  { id: "3", name: "Đà Nẵng" },
]);

const districts = ref([]);
const wards = ref([]);

const handleProvinceChange = () => {
  form.districtId = null;
  form.wardId = null;
  districts.value = [];
  wards.value = [];

  // TODO: Fetch districts based on provinceId
  // Mock data
  if (form.provinceId) {
    districts.value = [
      { id: "101", name: "Quận Ba Đình" },
      { id: "102", name: "Quận Hoàn Kiếm" },
    ];
  }
};

const handleDistrictChange = () => {
  form.wardId = null;
  wards.value = [];

  // TODO: Fetch wards based on districtId
  // Mock data
  if (form.districtId) {
    wards.value = [
      { id: "1001", name: "Phường Phúc Xá" },
      { id: "1002", name: "Phường Trúc Bạch" },
    ];
  }
};

const fetchCompanyInfo = async () => {
  if (!form.taxCode) {
    errors.taxCode = "Vui lòng nhập mã số thuế";
    return;
  }

  isFetchingInfo.value = true;
  errors.taxCode = "";

  try {
    // TODO: Replace with actual API call
    // const response = await taxService.getCompanyInfo(form.taxCode);

    // Mock response
    await new Promise((resolve) => setTimeout(resolve, 1000));

    form.companyName = "Công ty TNHH ABC";
    form.invoiceAddress = "123 Đường XYZ, Quận 1, TP.HCM";

    ElMessage.success("Đã lấy thông tin công ty");
  } catch (error) {
    ElMessage.error("Không tìm thấy thông tin công ty");
  } finally {
    isFetchingInfo.value = false;
  }
};

const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  // Email validation
  if (form.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      errors.email = "Email không hợp lệ";
      isValid = false;
    }
  }

  // Phone validation
  if (form.phoneNumber) {
    const phoneRegex = /^\d{9,11}$/;
    if (!phoneRegex.test(form.phoneNumber)) {
      errors.phoneNumber = "Số điện thoại không hợp lệ";
      isValid = false;
    }
  }

  // DOB validation
  if (form.dob && form.dob > today) {
    errors.dob = "Ngày sinh không được lớn hơn ngày hiện tại";
    isValid = false;
  }

  // Invoice email validation (only if hasInvoiceInfo is true)
  if (form.hasInvoiceInfo && form.invoiceEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.invoiceEmail)) {
      errors.invoiceEmail = "Email không hợp lệ";
      isValid = false;
    }
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    ElMessage.error("Vui lòng kiểm tra lại thông tin");
    return;
  }

  isSubmitting.value = true;

  try {
    // TODO: Replace with actual API call
    // const response = await customerService.create(form);

    // Mock response
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newCustomer = {
      id: Date.now(),
      name: `${form.firstName} ${form.lastName}`.trim() || "Khách hàng mới",
      phone: form.phoneNumber,
      email: form.email,
    };

    ElMessage.success("Thêm khách hàng thành công");
    emit("created", newCustomer);
    handleClose();
  } catch (error) {
    ElMessage.error("Có lỗi xảy ra, vui lòng thử lại");
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, {
    firstName: "",
    lastName: "",
    email: "",
    phoneCountryCode: "VN",
    phoneNumber: "",
    dob: null,
    gender: null,
    marketingOptIn: false,
    country: "Vietnam",
    hasNewAddress: false,
    provinceId: null,
    districtId: null,
    wardId: null,
    addressLine: "",
    hasInvoiceInfo: false,
    taxCode: "",
    companyName: "",
    invoiceAddress: "",
    buyerName: "",
    buyerPhone: "",
    buyerIdNumber: "",
    invoiceEmail: "",
    budgetUnitCode: "",
  });

  Object.keys(errors).forEach((key) => (errors[key] = ""));
  activeSection.value = "basic";
  if (contentAreaRef.value) {
    contentAreaRef.value.scrollTop = 0;
  }
};

const handleClose = () => {
  // TODO: Add unsaved changes confirmation if needed
  resetForm();
  isOpen.value = false;
};

const handleOverlayClick = () => {
  // Optional: prevent closing on overlay click
  // handleClose();
};

const scrollToSection = (sectionId) => {
  const sectionElement = document.getElementById(`section-${sectionId}`);
  if (sectionElement && contentAreaRef.value) {
    const offsetTop = sectionElement.offsetTop - 20; // 20px padding from top
    contentAreaRef.value.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });
  }
};

const handleScroll = () => {
  if (!contentAreaRef.value) return;

  const sections = ["basic", "address", "invoice"];

  // Find the section that is currently most visible
  let currentSection = "basic";
  let minDistance = Infinity;

  sections.forEach((sectionId) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      const containerRect = contentAreaRef.value.getBoundingClientRect();
      const distance = Math.abs(rect.top - containerRect.top);

      if (distance < minDistance && rect.top <= containerRect.top + 100) {
        minDistance = distance;
        currentSection = sectionId;
      }
    }
  });

  activeSection.value = currentSection;
};

// Keyboard shortcuts
const handleKeyPress = (e) => {
  if (!isOpen.value) return;

  if (e.key === "Escape") {
    e.preventDefault();
    handleClose();
  } else if (e.key === "F8") {
    e.preventDefault();
    handleSubmit();
  }
};

// Focus first input when invoice section is activated
watch(
  () => form.hasInvoiceInfo,
  (newVal) => {
    if (newVal) {
      // Optional: focus on taxCode input
      // nextTick(() => {
      //   const taxCodeInput = document.querySelector('input[type="text"]');
      //   taxCodeInput?.focus();
      // });
    }
  },
);

onMounted(() => {
  window.addEventListener("keydown", handleKeyPress);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyPress);
});
</script>

<style scoped>
/* Modal Overlay & Container */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 1100px;
  height: 720px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.btn-close:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* Modal Body */
.modal-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* Sidebar Navigation */
.section-nav {
  width: 240px;
  border-right: 1px solid #e2e8f0;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.nav-item:hover {
  background: #f8fafc;
  color: #1e293b;
}

.nav-item.active {
  background: #eff6ff;
  color: #1e40af;
  font-weight: 600;
}

.nav-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: #1e40af;
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  width: 20px;
  text-align: center;
}

.error-indicator {
  margin-left: auto;
  color: #dc2626;
  font-size: 0.875rem;
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  min-height: 0;
}

.form-section {
  max-width: 720px;
  margin-bottom: 48px;
}

.form-section:last-child {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px 0;
}

/* Form Elements */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.form-input:disabled {
  background: #f8fafc;
  cursor: not-allowed;
}

.form-input.has-error {
  border-color: #dc2626;
}

.error-message {
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: -4px;
}

/* Phone Input */
.phone-input-group {
  display: flex;
  gap: 8px;
}

.phone-prefix {
  width: 110px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
}

.phone-number {
  flex: 1;
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #475569;
}

.radio-label input[type="radio"] {
  cursor: pointer;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #475569;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-toggle {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-weight: 600;
  color: #1e293b;
}

.info-icon {
  color: #94a3b8;
  font-size: 0.875rem;
  cursor: help;
}

/* Input with Button */
.input-with-button {
  display: flex;
  gap: 8px;
}

.input-with-button .form-input {
  flex: 1;
}

.btn-fetch-info {
  padding: 10px 16px;
  border: none;
  background: #1e40af;
  color: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-fetch-info:hover:not(:disabled) {
  background: #1e3a8a;
}

.btn-fetch-info:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Progressive Disclosure Animations */
.address-details,
.invoice-details {
  margin-top: 16px;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-primary {
  background: #1e40af;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1e3a8a;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.kbd {
  padding: 3px 7px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

/* Scrollbar */
.content-area::-webkit-scrollbar,
.section-nav::-webkit-scrollbar {
  width: 8px;
}

.content-area::-webkit-scrollbar-track,
.section-nav::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.content-area::-webkit-scrollbar-thumb,
.section-nav::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.content-area::-webkit-scrollbar-thumb:hover,
.section-nav::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    max-height: 95vh;
  }

  .modal-body {
    flex-direction: column;
  }

  .section-nav {
    width: 100%;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    overflow-x: auto;
  }

  .nav-item {
    flex-shrink: 0;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
