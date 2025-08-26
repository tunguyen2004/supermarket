<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Đơn đặt hàng nhập</h1>
      <div class="action-buttons-group">
        <el-button :icon="Upload" @click="importDialogVisible = true"
          >Nhập file</el-button
        >
        <el-button type="primary" :icon="Plus" @click="openCreateDialog"
          >Tạo đơn đặt hàng</el-button
        >
      </div>
    </div>

    <el-tabs v-model="activeTab" class="order-tabs">
      <el-tab-pane label="Tất cả" name="all" />
      <el-tab-pane label="Nháp" name="draft" />
      <el-tab-pane label="Đã đặt hàng" name="ordered" />
      <el-tab-pane label="Đã nhập kho" name="received" />
      <el-tab-pane label="Đã hủy" name="cancelled" />
    </el-tabs>

    <div class="table-container">
      <div class="filters-bar">
        <div class="search-input-wrapper">
          <el-input
            v-model="search"
            placeholder="Tìm theo mã đơn, nhà cung cấp..."
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

      <!-- DESKTOP TABLE -->
      <el-table
        v-if="!isMobile"
        :data="pagedPOs"
        v-loading="isLoading"
        style="width: 100%"
      >
        <el-table-column prop="poCode" label="Mã đơn nhập" width="170" />
        <el-table-column prop="supplier" label="Nhà cung cấp" min-width="200" />
        <el-table-column prop="branch" label="Chi nhánh nhận" width="180" />
        <el-table-column prop="createdDate" label="Ngày tạo" width="150" />
        <el-table-column label="Tổng tiền" width="150" align="right">
          <template #default="scope"
            ><span class="total-amount">{{
              formatCurrency(scope.row.totalCost)
            }}</span></template
          >
        </el-table-column>
        <el-table-column label="Trạng thái" width="160" align="center">
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
                      @click="markOrdered(scope.row)"
                      v-if="scope.row.status === 'Nháp'"
                      >Đánh dấu Đã đặt hàng</el-dropdown-item
                    >
                    <el-dropdown-item
                      @click="markReceived(scope.row)"
                      v-if="scope.row.status === 'Đã đặt hàng'"
                      >Đánh dấu Đã nhập kho</el-dropdown-item
                    >
                    <el-dropdown-item
                      divided
                      @click="cancelPO(scope.row)"
                      v-if="scope.row.status !== 'Đã hủy'"
                      >Huỷ đơn</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- MOBILE LIST -->
      <div v-else class="mobile-card-list">
        <div v-for="item in pagedPOs" :key="item.poCode" class="mobile-card">
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-title">{{ item.poCode }}</span>
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
              <span class="card-label">Chi nhánh</span
              ><span class="card-value">{{ item.branch }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Ngày tạo</span
              ><span class="card-value">{{ item.createdDate }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Tổng tiền</span
              ><span class="card-value total-amount">{{
                formatCurrency(item.totalCost)
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
              >Xem</el-button
            >
          </div>
        </div>
      </div>

      <el-empty
        v-if="!isLoading && pagedPOs.length === 0"
        description="Chưa có đơn đặt hàng nhập nào"
      />
    </div>

    <div class="pagination-container">
      <el-pagination
        v-if="filteredPOs.length > 0"
        :small="isMobile"
        background
        layout="total, prev, pager, next"
        :total="filteredPOs.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

    <!-- DETAIL DIALOG -->
    <el-dialog
      v-model="detailVisible"
      :title="`Chi tiết · ${selectedPO?.poCode || ''}`"
      width="720"
    >
      <div v-if="selectedPO" class="detail-grid">
        <div class="drow">
          <span class="dl">Nhà cung cấp</span
          ><span class="dv">{{ selectedPO.supplier }}</span>
        </div>
        <div class="drow">
          <span class="dl">Chi nhánh</span
          ><span class="dv">{{ selectedPO.branch }}</span>
        </div>
        <div class="drow">
          <span class="dl">Ngày tạo</span
          ><span class="dv">{{ selectedPO.createdDate }}</span>
        </div>
        <div class="drow">
          <span class="dl">Tổng tiền</span
          ><span class="dv">{{ formatCurrency(selectedPO.totalCost) }}</span>
        </div>
        <div class="drow">
          <span class="dl">Trạng thái</span
          ><span class="dv"
            ><el-tag
              :type="getStatusType(selectedPO.status)"
              size="small"
              effect="light"
              >{{ selectedPO.status }}</el-tag
            ></span
          >
        </div>
        <div class="divider" />
        <div class="drow">
          <span class="dl">Ghi chú</span
          ><span class="dv">{{ selectedPO.note || "—" }}</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">Đóng</el-button>
          <el-button
            v-if="selectedPO?.status === 'Nháp'"
            @click="markOrdered(selectedPO)"
            >Đánh dấu Đã đặt hàng</el-button
          >
          <el-button
            type="success"
            v-if="selectedPO?.status === 'Đã đặt hàng'"
            @click="markReceived(selectedPO)"
            >Đánh dấu Đã nhập kho</el-button
          >
          <el-button
            type="danger"
            v-if="selectedPO && selectedPO.status !== 'Đã hủy'"
            @click="cancelPO(selectedPO)"
            >Huỷ đơn</el-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- CREATE DIALOG -->
    <el-dialog v-model="createVisible" title="Tạo đơn đặt hàng" width="720">
      <el-form
        ref="createFormRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        class="create-grid"
      >
        <el-form-item label="Nhà cung cấp" prop="supplier">
          <el-select v-model="form.supplier" placeholder="Chọn nhà cung cấp">
            <el-option
              v-for="s in allSuppliers"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Chi nhánh nhận" prop="branch">
          <el-select v-model="form.branch" placeholder="Chọn chi nhánh">
            <el-option
              v-for="b in allBranches"
              :key="b"
              :label="b"
              :value="b"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Ngày tạo" prop="createdDate">
          <el-date-picker
            v-model="form.createdDate"
            type="date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="Tổng tiền (đ)" prop="totalCost">
          <el-input-number
            v-model="form.totalCost"
            :min="0"
            :step="1000"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input
            v-model="form.note"
            type="textarea"
            :rows="2"
            placeholder="Ghi chú nội bộ"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">Huỷ</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate"
          >Tạo</el-button
        >
      </template>
    </el-dialog>

    <!-- IMPORT DIALOG -->
    <el-dialog
      v-model="importDialogVisible"
      title="Nhập file đơn đặt hàng"
      width="640"
      align-center
    >
      <el-form :model="importForm" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Chi nhánh tạo đơn">
              <el-select
                v-model="importForm.branch"
                placeholder="Chọn chi nhánh"
                style="width: 100%"
              >
                <el-option
                  v-for="b in allBranches"
                  :key="b"
                  :label="b"
                  :value="b"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Nhà cung cấp (mặc định)">
              <el-select
                v-model="importForm.supplier"
                placeholder="Chọn nhà cung cấp"
                style="width: 100%"
              >
                <el-option
                  v-for="s in allSuppliers"
                  :key="s"
                  :label="s"
                  :value="s"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
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

// --- Responsive ---
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

// --- Base state ---
const isLoading = ref(true);
const search = ref("");
const dateRange = ref("");
const activeTab = ref("all");
const supplierFilter = ref("");
const currentPage = ref(1);
const pageSize = 10;
const purchaseOrders = ref([]);

// --- Mock data ---
const samplePOs = [
  {
    poCode: "PO20250808-01",
    supplier: "Nhà cung cấp A",
    branch: "Chi nhánh trung tâm",
    createdDate: "2025-08-08",
    totalCost: 5500000,
    status: "Đã nhập kho",
    note: "",
  },
  {
    poCode: "PO20250807-03",
    supplier: "Nhà cung cấp B",
    branch: "Chi nhánh trung tâm",
    createdDate: "2025-08-07",
    totalCost: 12000000,
    status: "Đã đặt hàng",
    note: "",
  },
  {
    poCode: "PO20250807-02",
    supplier: "Nhà cung cấp A",
    branch: "Chi nhánh trung tâm",
    createdDate: "2025-08-07",
    totalCost: 3200000,
    status: "Nháp",
    note: "",
  },
  {
    poCode: "PO20250806-01",
    supplier: "Nhà cung cấp B",
    branch: "Chi nhánh trung tâm",
    createdDate: "2025-08-06",
    totalCost: 800000,
    status: "Đã hủy",
    note: "Khách đổi lịch",
  },
];

function initData() {
  setTimeout(() => {
    purchaseOrders.value = samplePOs;
    isLoading.value = false;
  }, 500);
}

// --- Helpers ---
const formatCurrency = (value) => (value ?? 0).toLocaleString("vi-VN") + "đ";
const getStatusType = (status) => {
  if (status === "Đã nhập kho") return "success";
  if (status === "Đã đặt hàng") return "primary";
  if (status === "Nháp") return "warning";
  if (status === "Đã hủy") return "danger";
  return "info";
};
const getStatusFromTab = (tab) =>
  ({
    draft: "Nháp",
    ordered: "Đã đặt hàng",
    received: "Đã nhập kho",
    cancelled: "Đã hủy",
  }[tab]);

const uniqueSuppliers = computed(() =>
  Array.from(new Set(purchaseOrders.value.map((p) => p.supplier))).sort()
);
const allSuppliers = computed(() =>
  uniqueSuppliers.value.length
    ? uniqueSuppliers.value
    : ["Nhà cung cấp A", "Nhà cung cấp B"]
);
const allBranches = ["Chi nhánh trung tâm", "Chi nhánh 1", "Chi nhánh 2"];

// --- Filters ---
const filteredPOs = computed(() => {
  let arr = purchaseOrders.value;
  const q = search.value.trim().toLowerCase();
  if (q)
    arr = arr.filter(
      (i) =>
        i.poCode.toLowerCase().includes(q) ||
        i.supplier.toLowerCase().includes(q)
    );
  if (supplierFilter.value)
    arr = arr.filter((i) => i.supplier === supplierFilter.value);
  if (Array.isArray(dateRange.value) && dateRange.value.length === 2) {
    const [s, e] = dateRange.value;
    arr = arr.filter((i) => i.createdDate >= s && i.createdDate <= e);
  }
  if (activeTab.value !== "all")
    arr = arr.filter((i) => i.status === getStatusFromTab(activeTab.value));
  return arr;
});

const pagedPOs = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredPOs.value.slice(start, start + pageSize);
});
watch([search, supplierFilter, activeTab, dateRange], () => {
  currentPage.value = 1;
});

// --- Detail dialog ---
const detailVisible = ref(false);
const selectedPO = ref(null);
const openDetail = (row) => {
  selectedPO.value = row;
  detailVisible.value = true;
};

// --- Status actions ---
const markOrdered = async (row) => {
  await ElMessageBox.confirm(
    `Đánh dấu đơn ${row.poCode} là "Đã đặt hàng"?`,
    "Xác nhận",
    { type: "warning" }
  ).catch(() => null);
  row.status = "Đã đặt hàng";
  ElNotification({
    title: "Cập nhật trạng thái",
    message: "Đã đặt hàng",
    type: "success",
  });
};
const markReceived = async (row) => {
  await ElMessageBox.confirm(
    `Đánh dấu đơn ${row.poCode} là "Đã nhập kho"?`,
    "Xác nhận",
    { type: "warning" }
  ).catch(() => null);
  row.status = "Đã nhập kho";
  ElNotification({
    title: "Cập nhật trạng thái",
    message: "Đã nhập kho",
    type: "success",
  });
};
const cancelPO = async (row) => {
  await ElMessageBox.confirm(`Huỷ đơn ${row.poCode}?`, "Xác nhận huỷ", {
    type: "warning",
  }).catch(() => null);
  row.status = "Đã hủy";
  ElNotification({ title: "Đã huỷ đơn", message: row.poCode, type: "warning" });
};

// --- Create dialog ---
const createVisible = ref(false);
const creating = ref(false);
const createFormRef = ref();
const today = () => new Date().toISOString().slice(0, 10);
const form = reactive({
  supplier: "",
  branch: "",
  createdDate: today(),
  totalCost: 0,
  note: "",
});

const rules = {
  supplier: [
    { required: true, message: "Chọn nhà cung cấp", trigger: "change" },
  ],
  branch: [{ required: true, message: "Chọn chi nhánh", trigger: "change" }],
  createdDate: [
    { required: true, message: "Chọn ngày tạo", trigger: "change" },
  ],
  totalCost: [{ required: true, message: "Nhập tổng tiền", trigger: "blur" }],
};

const openCreateDialog = () => {
  createVisible.value = true;
  Object.assign(form, {
    supplier: "",
    branch: "",
    createdDate: today(),
    totalCost: 0,
    note: "",
  });
  createFormRef.value?.clearValidate?.();
};

const nextPOCode = () => {
  const ymd = today().replaceAll("-", "");
  const sameDay = purchaseOrders.value.filter((p) =>
    p.poCode.startsWith("PO" + ymd)
  );
  const idx = sameDay.length + 1;
  return `PO${ymd}-${String(idx).padStart(2, "0")}`;
};

const submitCreate = () => {
  createFormRef.value.validate((valid) => {
    if (!valid) return;
    creating.value = true;
    setTimeout(() => {
      purchaseOrders.value.unshift({
        poCode: nextPOCode(),
        supplier: form.supplier,
        branch: form.branch,
        createdDate: form.createdDate,
        totalCost: Number(form.totalCost) || 0,
        status: "Nháp",
        note: form.note?.trim() || "",
      });
      ElNotification({
        title: "Đã tạo đơn",
        message: "Đơn mới đã được thêm vào danh sách",
        type: "success",
      });
      creating.value = false;
      createVisible.value = false;
    }, 500);
  });
};

// --- Import dialog ---
const importDialogVisible = ref(false);
const uploadRef = ref();
const selectedFile = ref(null);
const importForm = reactive({ branch: "", supplier: "" });

const handleFileChange = (file) => {
  selectedFile.value = file?.raw || null;
};
const handleExceed = (files) => {
  uploadRef.value?.clearFiles();
  const file = files[0];
  uploadRef.value?.handleStart(file);
  selectedFile.value = file;
};

const downloadTemplate = () => {
  const headers = [
    "POCode",
    "Supplier",
    "Branch",
    "CreatedDate",
    "TotalCost",
    "Status",
    "Note",
  ];
  const example = [
    "PO20250101-01",
    "Nhà cung cấp A",
    "Chi nhánh trung tâm",
    "2025-01-01",
    "1000000",
    "Nháp",
    "Ghi chú mẫu",
  ];
  const csv = [headers.join(","), example.join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "purchase_orders_template.csv";
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
      } else cell += ch;
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
  reader.onload = async (evt) => {
    try {
      const text = String(evt.target.result || "");
      const rows = parseCSV(text);
      if (!rows.length) throw new Error("File trống");
      const header = rows.shift().map((h) => String(h).trim().toLowerCase());
      const idx = (n) => header.indexOf(n);
      const iCode = idx("pocode"),
        iSupplier = idx("supplier"),
        iBranch = idx("branch"),
        iDate = idx("createddate"),
        iTotal = idx("totalcost"),
        iStatus = idx("status"),
        iNote = idx("note");
      if (iSupplier < 0 || iBranch < 0 || iDate < 0 || iTotal < 0)
        throw new Error(
          "Thiếu cột bắt buộc: Supplier/Branch/CreatedDate/TotalCost"
        );

      let count = 0;
      for (const r of rows) {
        const po = {
          poCode: iCode > -1 && r[iCode] ? String(r[iCode]) : nextPOCode(),
          supplier: r[iSupplier] || importForm.supplier || "Nhà cung cấp A",
          branch: r[iBranch] || importForm.branch || "Chi nhánh trung tâm",
          createdDate: r[iDate] || today(),
          totalCost: Number(r[iTotal] || 0),
          status: r[iStatus] || "Nháp",
          note: r[iNote] || "",
        };
        const existIdx = purchaseOrders.value.findIndex(
          (p) => p.poCode === po.poCode
        );
        if (existIdx > -1) purchaseOrders.value.splice(existIdx, 1, po);
        else purchaseOrders.value.unshift(po);
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
.adv-select {
  width: 220px;
}
.adv-date {
  width: 260px;
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

/* ========= DIALOGS (DETAIL/CREATE/IMPORT) ========= */
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
.total-row {
  margin-top: 12px;
  text-align: right;
  font-size: 16px;
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
.import-uploader {
  margin-top: 20px;
}
.import-uploader :deep(.el-upload-dragger) {
  padding: 30px 20px;
}
.el-upload__tip {
  margin-top: 10px;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-upload__tip .el-button {
  margin-left: 5px;
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
  .advanced-filters {
    grid-auto-flow: row;
    grid-template-columns: 1fr;
  }

  /* Form & detail single column */
  .create-grid {
    grid-template-columns: 1fr !important;
  }
  .detail-grid {
    grid-template-columns: 1fr !important;
  }

  /* Force dialogs full-screen & comfortable paddings */
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
