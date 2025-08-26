<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Đơn nhập hàng</h1>
      <div class="action-buttons-group">
        <el-button :icon="Upload" @click="importDialogVisible = true"
          >Nhập file</el-button
        >
        <el-button type="primary" :icon="Plus" @click="openCreateDialog"
          >Tạo đơn nhập hàng</el-button
        >
      </div>
    </div>

    <el-tabs v-model="activeTab" class="order-tabs">
      <el-tab-pane label="Tất cả" name="all" />
      <el-tab-pane label="Tạm lưu" name="draft" />
      <el-tab-pane label="Hoàn thành" name="completed" />
    </el-tabs>

    <div class="table-container">
      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-input-wrapper">
          <el-input
            v-model="search"
            placeholder="Tìm theo mã phiếu, mã đơn đặt hàng, nhà cung cấp..."
            clearable
            :prefix-icon="Search"
          />
        </div>
        <div v-if="!isMobile" class="advanced-filters">
          <el-select
            v-model="supplierFilter"
            placeholder="Nhà cung cấp"
            clearable
            class="adv-select"
          >
            <el-option
              v-for="s in uniqueSuppliers"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="Từ ngày"
            end-placeholder="Đến ngày"
            value-format="YYYY-MM-DD"
            class="adv-date"
          />
        </div>
      </div>

      <!-- Desktop table -->
      <el-table
        v-if="!isMobile"
        :data="pagedReceipts"
        v-loading="isLoading"
        style="width: 100%"
      >
        <el-table-column prop="receiptCode" label="Mã phiếu nhập" width="170" />
        <el-table-column prop="poCode" label="Đơn đặt hàng" width="160" />
        <el-table-column prop="supplier" label="Nhà cung cấp" min-width="180" />
        <el-table-column prop="receivedDate" label="Ngày nhập" width="150" />
        <el-table-column label="Tổng tiền" width="150" align="right">
          <template #default="scope"
            ><span class="total-amount">{{
              formatCurrency(scope.row.totalValue)
            }}</span></template
          >
        </el-table-column>
        <el-table-column prop="employee" label="Nhân viên nhận" width="170" />
        <el-table-column label="Trạng thái" width="140" align="center">
          <template #default="scope"
            ><el-tag
              :type="getStatusType(scope.row.status)"
              effect="light"
              size="small"
              >{{ scope.row.status }}</el-tag
            ></template
          >
        </el-table-column>
        <el-table-column label="Thao tác" width="220" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="View"
                text
                bg
                @click="openDetail(scope.row)"
                >Xem</el-button
              >
              <el-dropdown trigger="click">
                <el-button size="small" text>Hành động</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      @click="openEditDialog(scope.row)"
                      v-if="scope.row.status === 'Tạm lưu'"
                      >Sửa</el-dropdown-item
                    >
                    <el-dropdown-item
                      @click="markCompleted(scope.row)"
                      v-if="scope.row.status === 'Tạm lưu'"
                      >Đánh dấu Hoàn thành</el-dropdown-item
                    >
                    <el-dropdown-item divided @click="removeReceipt(scope.row)"
                      >Xoá phiếu</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Mobile cards -->
      <div v-else class="mobile-card-list">
        <div
          v-for="item in pagedReceipts"
          :key="item.receiptCode"
          class="mobile-card"
        >
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-title">{{ item.receiptCode }}</span>
              <span class="card-subtitle">{{ item.supplier }}</span>
            </div>
            <el-tag
              :type="getStatusType(item.status)"
              effect="light"
              size="small"
              >{{ item.status }}</el-tag
            >
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Đơn đặt hàng</span
              ><span class="card-value">{{ item.poCode }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Ngày nhập</span
              ><span class="card-value">{{ item.receivedDate }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Tổng tiền</span
              ><span class="card-value total-amount">{{
                formatCurrency(item.totalValue)
              }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              size="small"
              :icon="View"
              text
              bg
              @click="openDetail(item)"
              >Xem chi tiết</el-button
            >
          </div>
        </div>
      </div>

      <el-empty v-if="!isLoading && pagedReceipts.length === 0">
        <template #description>
          <div class="orders-empty-title">Chưa có đơn nhập hàng nào</div>
          <p class="orders-empty-desc">
            Tạo mới đơn nhập hàng để ghi nhận nhập kho và tăng số lượng tồn cho
            sản phẩm.
          </p>
        </template>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog"
          >Tạo đơn nhập hàng</el-button
        >
      </el-empty>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-if="filteredReceipts.length > 0"
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="filteredReceipts.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <!-- DETAIL DIALOG -->
    <el-dialog
      v-model="detailVisible"
      :title="`Chi tiết · ${selectedReceipt?.receiptCode || ''}`"
      width="840"
    >
      <template v-if="selectedReceipt">
        <div class="detail-grid">
          <div class="drow">
            <span class="dl">Đơn đặt hàng</span
            ><span class="dv">{{ selectedReceipt.poCode || "—" }}</span>
          </div>
          <div class="drow">
            <span class="dl">Nhà cung cấp</span
            ><span class="dv">{{ selectedReceipt.supplier }}</span>
          </div>
          <div class="drow">
            <span class="dl">Ngày nhập</span
            ><span class="dv">{{ selectedReceipt.receivedDate }}</span>
          </div>
          <div class="drow">
            <span class="dl">Nhân viên</span
            ><span class="dv">{{ selectedReceipt.employee }}</span>
          </div>
          <div class="drow">
            <span class="dl">Trạng thái</span
            ><span class="dv"
              ><el-tag
                :type="getStatusType(selectedReceipt.status)"
                size="small"
                effect="light"
                >{{ selectedReceipt.status }}</el-tag
              ></span
            >
          </div>
          <div class="drow">
            <span class="dl">Ghi chú</span
            ><span class="dv">{{ selectedReceipt.note || "—" }}</span>
          </div>
        </div>
        <div class="sub-title">Danh sách hàng</div>
        <el-table :data="selectedReceipt.lines || []" size="small">
          <el-table-column prop="sku" label="Mã hàng" width="140" />
          <el-table-column prop="name" label="Tên hàng" min-width="220" />
          <el-table-column prop="qty" label="SL" width="90" align="center" />
          <el-table-column
            prop="cost"
            label="Giá nhập"
            width="140"
            align="right"
          >
            <template #default="s">{{ formatCurrency(s.row.cost) }}</template>
          </el-table-column>
          <el-table-column label="Thành tiền" width="160" align="right">
            <template #default="s">{{
              formatCurrency(s.row.qty * s.row.cost)
            }}</template>
          </el-table-column>
        </el-table>
        <div class="total-row">
          Tổng cộng: <b>{{ formatCurrency(selectedReceipt.totalValue) }}</b>
        </div>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">Đóng</el-button>
        <el-button
          v-if="selectedReceipt?.status === 'Tạm lưu'"
          type="success"
          @click="markCompleted(selectedReceipt)"
          >Đánh dấu Hoàn thành</el-button
        >
      </template>
    </el-dialog>

    <!-- CREATE / EDIT DIALOG -->
    <el-dialog
      v-model="formVisible"
      :title="
        formMode === 'create'
          ? 'Tạo đơn nhập hàng'
          : `Sửa · ${formModel.receiptCode}`
      "
      width="900"
    >
      <el-form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        label-width="140px"
        class="create-grid"
      >
        <el-form-item label="Đơn đặt hàng (PO)" prop="poCode">
          <el-input v-model="formModel.poCode" placeholder="VD: PO2025..." />
        </el-form-item>
        <el-form-item label="Nhà cung cấp" prop="supplier">
          <el-select
            v-model="formModel.supplier"
            filterable
            allow-create
            default-first-option
            placeholder="Chọn/nhập nhà cung cấp"
            class="adv-select"
          >
            <el-option
              v-for="s in allSuppliers"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Ngày nhập" prop="receivedDate">
          <el-date-picker
            v-model="formModel.receivedDate"
            type="date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="Nhân viên nhận" prop="employee">
          <el-input v-model="formModel.employee" placeholder="Tên nhân viên" />
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input v-model="formModel.note" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>

      <div class="sub-title">Hàng nhập</div>
      <el-table :data="formModel.lines" size="small">
        <el-table-column label="#" width="54" align="center">
          <template #default="s">{{ s.$index + 1 }}</template>
        </el-table-column>
        <el-table-column label="Mã hàng" width="160">
          <template #default="s"
            ><el-input v-model="s.row.sku" placeholder="SKU"
          /></template>
        </el-table-column>
        <el-table-column label="Tên hàng" min-width="260">
          <template #default="s"
            ><el-input v-model="s.row.name" placeholder="Tên sản phẩm"
          /></template>
        </el-table-column>
        <el-table-column label="SL" width="110" align="center">
          <template #default="s"
            ><el-input-number v-model="s.row.qty" :min="1"
          /></template>
        </el-table-column>
        <el-table-column label="Giá nhập" width="160" align="right">
          <template #default="s"
            ><el-input-number
              v-model="s.row.cost"
              :min="0"
              :step="1000"
              controls-position="right"
          /></template>
        </el-table-column>
        <el-table-column label="Thành tiền" width="160" align="right">
          <template #default="s">{{
            formatCurrency(s.row.qty * s.row.cost)
          }}</template>
        </el-table-column>
        <el-table-column label="" width="70" align="center">
          <template #default="s"
            ><el-button text type="danger" @click="removeLine(s.$index)"
              >Xoá</el-button
            ></template
          >
        </el-table-column>
      </el-table>
      <div class="table-actions">
        <el-button @click="addLine">Thêm dòng</el-button>
        <div class="spacer" />
        <div class="grand-total">
          Tổng: <b>{{ formatCurrency(formTotal) }}</b>
        </div>
      </div>

      <template #footer>
        <el-button @click="formVisible = false">Huỷ</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{
          formMode === "create" ? "Tạo phiếu" : "Lưu thay đổi"
        }}</el-button>
      </template>
    </el-dialog>

    <!-- IMPORT DIALOG -->
    <el-dialog
      v-model="importDialogVisible"
      title="Nhập file đơn nhập hàng"
      width="640"
      align-center
    >
      <el-upload
        ref="uploadRef"
        class="import-uploader"
        drag
        action="#"
        :auto-upload="false"
        :limit="1"
        :on-exceed="handleExceed"
        :on-change="handleFileChange"
        accept=".csv"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          Kéo thả file CSV vào đây hoặc <em>nhấn để chọn file</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            Chỉ chấp nhận file .csv.
            <el-button type="primary" link @click.stop="downloadTemplate"
              >Tải file mẫu</el-button
            >
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">Hủy</el-button>
        <el-button
          type="primary"
          @click="handleImport"
          :disabled="!selectedFile"
          >Bắt đầu nhập</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import {
  Search,
  Plus,
  View,
  Upload,
  UploadFilled,
} from "@element-plus/icons-vue";

// Responsive
const isMobile = ref(false);
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  initData();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// Base state
const isLoading = ref(true);
const search = ref("");
const dateRange = ref("");
const activeTab = ref("all");
const supplierFilter = ref("");
const currentPage = ref(1);
const pageSize = 10;

// Data
const receipts = ref([]);

const sampleReceipts = [
  {
    receiptCode: "PN20250808-01",
    poCode: "PO20250808-01",
    supplier: "Nhà cung cấp A",
    receivedDate: "2025-08-08",
    employee: "Nhân viên kho A",
    totalValue: 5500000,
    status: "Hoàn thành",
    note: "",
    lines: [{ sku: "SP001", name: "Sữa tươi 1L", qty: 20, cost: 50000 }],
  },
  {
    receiptCode: "PN20250807-02",
    poCode: "PO20250807-03",
    supplier: "Nhà cung cấp B",
    receivedDate: "2025-08-07",
    employee: "Nhân viên kho B",
    totalValue: 12000000,
    status: "Hoàn thành",
    note: "",
    lines: [{ sku: "SP004", name: "Mì gói", qty: 1000, cost: 12000 }],
  },
  {
    receiptCode: "PN20250807-01",
    poCode: "PO20250807-02",
    supplier: "Nhà cung cấp A",
    receivedDate: "2025-08-07",
    employee: "Nhân viên kho A",
    totalValue: 3200000,
    status: "Tạm lưu",
    note: "Kiểm đếm lại",
    lines: [{ sku: "SP010", name: "Đường 1kg", qty: 200, cost: 16000 }],
  },
];

function initData() {
  setTimeout(() => {
    receipts.value = sampleReceipts;
    isLoading.value = false;
  }, 500);
}

// Helpers
const formatCurrency = (v) => (v ?? 0).toLocaleString("vi-VN") + "đ";
const getStatusType = (s) => {
  if (s === "Hoàn thành") return "success";
  if (s === "Tạm lưu") return "warning";
  return "info";
};
const getStatusFromTab = (tab) =>
  ({ draft: "Tạm lưu", completed: "Hoàn thành" }[tab]);
const uniqueSuppliers = computed(() =>
  Array.from(new Set(receipts.value.map((r) => r.supplier))).sort()
);
const allSuppliers = computed(() =>
  uniqueSuppliers.value.length
    ? uniqueSuppliers.value
    : ["Nhà cung cấp A", "Nhà cung cấp B"]
);

// Filters
const filteredReceipts = computed(() => {
  let arr = receipts.value;
  const q = search.value.trim().toLowerCase();
  if (q)
    arr = arr.filter(
      (i) =>
        i.receiptCode.toLowerCase().includes(q) ||
        i.poCode.toLowerCase().includes(q) ||
        i.supplier.toLowerCase().includes(q)
    );
  if (supplierFilter.value)
    arr = arr.filter((i) => i.supplier === supplierFilter.value);
  if (Array.isArray(dateRange.value) && dateRange.value.length === 2) {
    const [s, e] = dateRange.value;
    arr = arr.filter((i) => i.receivedDate >= s && i.receivedDate <= e);
  }
  if (activeTab.value !== "all")
    arr = arr.filter((i) => i.status === getStatusFromTab(activeTab.value));
  return arr;
});

const pagedReceipts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredReceipts.value.slice(start, start + pageSize);
});
watch([search, supplierFilter, dateRange, activeTab], () => {
  currentPage.value = 1;
});

// Detail
const detailVisible = ref(false);
const selectedReceipt = ref(null);
const openDetail = (row) => {
  selectedReceipt.value = row;
  detailVisible.value = true;
};

// Create/Edit form
const formVisible = ref(false);
const formMode = ref("create"); // 'create' | 'edit'
const formRef = ref();
const submitting = ref(false);
const today = () => new Date().toISOString().slice(0, 10);
const nextPNCode = () => {
  const ymd = today().replaceAll("-", "");
  const sameDay = receipts.value.filter((r) =>
    r.receiptCode.startsWith("PN" + ymd)
  );
  const idx = sameDay.length + 1;
  return `PN${ymd}-${String(idx).padStart(2, "0")}`;
};

const formModel = reactive({
  receiptCode: "",
  poCode: "",
  supplier: "",
  receivedDate: today(),
  employee: "",
  note: "",
  lines: [],
});
const formRules = {
  supplier: [
    { required: true, message: "Chọn/nhập nhà cung cấp", trigger: "change" },
  ],
  receivedDate: [
    { required: true, message: "Chọn ngày nhập", trigger: "change" },
  ],
  employee: [
    { required: true, message: "Nhập tên nhân viên nhận", trigger: "blur" },
  ],
};

const formTotal = computed(() =>
  formModel.lines.reduce(
    (s, l) => s + Number(l.qty || 0) * Number(l.cost || 0),
    0
  )
);
const addLine = () => {
  formModel.lines.push({ sku: "", name: "", qty: 1, cost: 0 });
};
const removeLine = (i) => {
  formModel.lines.splice(i, 1);
};

const openCreateDialog = () => {
  formMode.value = "create";
  Object.assign(formModel, {
    receiptCode: "",
    poCode: "",
    supplier: "",
    receivedDate: today(),
    employee: "",
    note: "",
    lines: [],
  });
  addLine();
  formVisible.value = true;
  formRef.value?.clearValidate?.();
};

const openEditDialog = (row) => {
  formMode.value = "edit";
  Object.assign(formModel, JSON.parse(JSON.stringify(row)));
  formVisible.value = true;
  formRef.value?.clearValidate?.();
};

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (!valid) return;
    submitting.value = true;
    setTimeout(() => {
      if (formMode.value === "create") {
        const newRow = { ...JSON.parse(JSON.stringify(formModel)) };
        newRow.receiptCode = nextPNCode();
        newRow.status = "Tạm lưu";
        newRow.totalValue = formTotal.value;
        receipts.value.unshift(newRow);
        ElNotification({
          title: "Đã tạo phiếu",
          message: newRow.receiptCode,
          type: "success",
        });
      } else {
        const idx = receipts.value.findIndex(
          (r) => r.receiptCode === formModel.receiptCode
        );
        if (idx > -1) {
          const updated = { ...JSON.parse(JSON.stringify(formModel)) };
          updated.totalValue = formTotal.value;
          receipts.value.splice(idx, 1, updated);
          ElNotification({
            title: "Đã lưu thay đổi",
            message: updated.receiptCode,
            type: "success",
          });
        }
      }
      submitting.value = false;
      formVisible.value = false;
    }, 400);
  });
};

// Actions
const markCompleted = async (row) => {
  await ElMessageBox.confirm(
    `Đánh dấu phiếu ${row.receiptCode} là "Hoàn thành"?`,
    "Xác nhận",
    { type: "warning" }
  ).catch(() => null);
  row.status = "Hoàn thành";
  ElNotification({
    title: "Cập nhật trạng thái",
    message: "Hoàn thành",
    type: "success",
  });
};

const removeReceipt = async (row) => {
  await ElMessageBox.confirm(`Xoá phiếu ${row.receiptCode}?`, "Xác nhận xoá", {
    type: "warning",
  }).catch(() => null);
  const i = receipts.value.findIndex((r) => r.receiptCode === row.receiptCode);
  if (i > -1) receipts.value.splice(i, 1);
  ElMessage.success("Đã xoá phiếu");
};

// Import CSV
const importDialogVisible = ref(false);
const uploadRef = ref();
const selectedFile = ref(null);
const handleFileChange = (file) => {
  selectedFile.value = file?.raw || null;
};
const handleExceed = (files) => {
  uploadRef.value?.clearFiles();
  const f = files[0];
  uploadRef.value?.handleStart(f);
  selectedFile.value = f;
};

const downloadTemplate = () => {
  const headers = [
    "ReceiptCode",
    "POCode",
    "Supplier",
    "ReceivedDate",
    "Employee",
    "TotalValue",
    "Status",
    "Note",
  ];
  const example = [
    "PN20250101-01",
    "PO20250101-01",
    "Nhà cung cấp A",
    "2025-01-01",
    "Nguyễn A",
    "1000000",
    "Tạm lưu",
    "Ghi chú",
  ];
  const csv = [headers.join(","), example.join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "receipts_template.csv";
  a.click();
  URL.revokeObjectURL(url);
};

function parseCSV(text) {
  const rows = [];
  let cur = [];
  let cell = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ",") {
        cur.push(cell);
        cell = "";
      } else if (ch === "\n" || ch === "\r") {
        if (cell !== "" || cur.length) {
          cur.push(cell);
          rows.push(cur);
          cur = [];
          cell = "";
        }
      } else cell += ch;
    }
  }
  if (cell !== "" || cur.length) {
    cur.push(cell);
    rows.push(cur);
  }
  return rows;
}

const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning("Chưa chọn file CSV");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || "");
      const rows = parseCSV(text);
      if (!rows.length) throw new Error("File trống");
      const header = rows.shift().map((h) => String(h).trim().toLowerCase());
      const idx = (n) => header.indexOf(n);
      const iCode = idx("receiptcode"),
        iPO = idx("pocode"),
        iSup = idx("supplier"),
        iDate = idx("receiveddate"),
        iEmp = idx("employee"),
        iTotal = idx("totalvalue"),
        iStatus = idx("status"),
        iNote = idx("note");
      if (iSup < 0 || iDate < 0)
        throw new Error("Thiếu cột bắt buộc: Supplier/ReceivedDate");

      let count = 0;
      for (const r of rows) {
        const row = {
          receiptCode: iCode > -1 && r[iCode] ? String(r[iCode]) : nextPNCode(),
          poCode: iPO > -1 ? String(r[iPO] || "") : "",
          supplier: r[iSup] || "Nhà cung cấp A",
          receivedDate: r[iDate] || today(),
          employee: iEmp > -1 ? String(r[iEmp] || "") : "",
          totalValue: Number(iTotal > -1 ? r[iTotal] : 0),
          status: iStatus > -1 ? r[iStatus] : "Tạm lưu",
          note: iNote > -1 ? String(r[iNote] || "") : "",
          lines: [],
        };
        const existIdx = receipts.value.findIndex(
          (x) => x.receiptCode === row.receiptCode
        );
        if (existIdx > -1) receipts.value.splice(existIdx, 1, row);
        else receipts.value.unshift(row);
        count++;
      }
      ElNotification({
        title: "Nhập file thành công",
        message: `${count} dòng đã được xử lý`,
        type: "success",
      });
      importDialogVisible.value = false;
      uploadRef.value?.clearFiles();
      selectedFile.value = null;
    } catch (err) {
      ElMessage.error("Lỗi nhập file: " + (err?.message || "Không xác định"));
    }
  };
  reader.readAsText(selectedFile.value);
};
</script>

<style scoped>
/* ========= COMMON / LAYOUT ========= */
.page-container {
  padding: 16px;
  background: #f9fafb;
  font-family: "Inter", sans-serif;
  min-height: 100vh;
}
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.table-container {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.total-amount {
  font-weight: 700;
}
.adv-select {
  width: 150px;
}

/* ========= TABS ========= */
.order-tabs {
  margin-bottom: 1px;
}
.order-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}
.table-container {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

/* ========= FILTER BAR ========= */
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.search-input-wrapper {
  flex: 1;
  min-width: 260px;
}
.advanced-filters {
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  align-items: center;
  gap: 12px;
}

/* ========= TABLE ========= */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.page-container :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}
.page-container :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
}
.page-container :deep(.el-table th) {
  background: #f9fafb !important;
  color: #6b7280;
  font-weight: 600;
}
.page-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #f3f4f6;
  padding: 14px 0;
}
.page-container :deep(.el-table .el-table__row:hover > td) {
  background: #f9fafb !important;
}

/* ========= MOBILE CARD ========= */
.mobile-card-list {
  padding: 16px;
}
.mobile-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.mobile-card .card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.card-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.card-title {
  color: #111827;
  font-weight: 600;
  line-height: 1.25;
  word-break: break-word;
}
.card-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 400;
}
.mobile-card .card-header :deep(.el-tag) {
  line-height: 20px;
  height: 22px;
  padding: 0 6px;
}

.card-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.card-label {
  min-width: 40%;
  color: #6b7280;
  line-height: 1.25;
}
.card-label::after {
  content: ":";
  margin: 0 4px;
  color: #9ca3af;
}
.card-value {
  width: 60%;
  text-align: right;
  word-break: break-word;
}
.card-footer {
  padding: 8px 16px;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ========= DIALOGS (DETAIL/FORM/IMPORT) ========= */
.detail-grid {
  display: grid;
  grid-template-columns: 160px 1fr;
  row-gap: 10px;
  column-gap: 12px;
  margin-bottom: 12px;
}
.drow {
  display: contents;
}
.dl {
  color: #6b7280;
}
.dv {
  color: #111827;
  font-weight: 500;
}
.sub-title {
  margin: 12px 0 8px;
  font-weight: 600;
  color: #111827;
}

.create-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}
.table-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.table-actions .spacer {
  flex: 1;
}
.grand-total {
  font-weight: 600;
}

/* ========= EMPTY STATE ========= */
.orders-empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}
.orders-empty-desc {
  font-size: 0.9rem;
  color: #6b7280;
  max-width: 460px;
  margin-top: 8px;
  margin-bottom: 20px;
  line-height: 1.5;
}

/* ========= MOBILE TWEAKS ========= */
@media (max-width: 767px) {
  .order-tabs :deep(.el-tabs__header) {
    padding: 0;
  }
  .order-tabs :deep(.el-tabs__nav) {
    width: 100%;
    display: flex;
  }
  .order-tabs :deep(.el-tabs__item) {
    flex: 1;
    text-align: center;
    padding: 0 6px;
    white-space: nowrap;
  }

  .filters-bar {
    gap: 8px;
  }
  .filters-bar .el-input {
    flex: 1;
    min-width: 0;
  }

  .create-grid {
    grid-template-columns: 1fr !important;
  }
  .detail-grid {
    grid-template-columns: 1fr !important;
  }

  /* Force dialogs full-screen & scrollable on small screens */
  :deep(.el-dialog) {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    height: 100% !important;
    display: flex;
    flex-direction: column;
  }
  :deep(.el-dialog__body) {
    flex: 1 1 auto;
    overflow: auto;
    padding: 12px !important;
  }
  :deep(.el-dialog__header),
  :deep(.el-dialog__footer) {
    padding: 10px 12px;
  }
}
</style>
