<template>
  <div class="orders-page">
    <div class="orders-header">
      <h1 class="orders-title">Danh sách vận đơn</h1>
      <div class="export-file" @click="showExportModal = true">Xuất file</div>
    </div>
    <div class="orders-table">
      <table>
        <thead>
          <tr>
            <th></th>
            <th><div class="skeleton-header"></div></th>
            <th><div class="skeleton-header"></div></th>
            <th><div class="skeleton-header"></div></th>
            <th><div class="skeleton-header"></div></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 3" :key="i">
            <td><div class="skeleton-row"></div></td>
            <td><div class="skeleton-row"></div></td>
            <td><div class="skeleton-row"></div></td>
            <td><div class="skeleton-row"></div></td>
            <td><div class="skeleton-row"></div></td>
          </tr>
        </tbody>
      </table>
      <div class="orders-empty">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1048/1048953.png"
          alt="empty"
          class="orders-empty-img"
        />
        <div class="orders-empty-title">
          Cửa hàng của bạn chưa có vận đơn nào
        </div>
        <div class="orders-empty-desc">Tạo mới vận đơn của bạn</div>
        <button class="orders-add-btn">
          <i class="fa fa-plus-circle"></i> Tạo vận đơn
        </button>
      </div>
    </div>
    <div class="orders-footer">
      Tìm hiểu về <a href="#" class="orders-link">vận đơn </a>
    </div>
    <!-- Modal Xuất file -->
    <div
      v-if="showExportModal"
      class="modal-overlay"
      @click.self="showExportModal = false"
    >
      <div class="modal-export">
        <div class="modal-header">
          <span>Xuất file danh sách vận đơn</span>
          <button class="modal-close" @click="showExportModal = false">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <div class="modal-label">Chọn vận đơn:</div>
            <label class="modal-radio">
              <input type="radio" value="all" v-model="shipmentScope" />
              <span>Tất cả vận đơn</span>
            </label>
            <label class="modal-radio">
              <input type="radio" value="page" v-model="shipmentScope" />
              <span>Vận đơn trên trang này</span>
            </label>
          </div>
          <div class="modal-section">
            <div class="modal-label">Loại xuất file:</div>
            <label class="modal-radio">
              <input
                type="radio"
                value="overview-shipment"
                v-model="exportType"
              />
              <span>File tổng quan theo vận đơn</span>
            </label>
            <label class="modal-radio">
              <input
                type="radio"
                value="overview-product"
                v-model="exportType"
              />
              <span>File tổng quan theo sản phẩm</span>
            </label>
            <label class="modal-radio">
              <input type="radio" value="detail" v-model="exportType" />
              <span>File chi tiết</span>
            </label>
          </div>
          <div class="modal-section">
            <a href="#" class="modal-link">
              <i class="fa fa-cog"></i> Tùy chọn trường dữ liệu xuất
            </a>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="showExportModal = false">
            Hủy
          </button>
          <button class="modal-btn export" @click="exportFile">
            Xuất file
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
const showExportModal = ref(false);
const shipmentScope = ref("all");
const exportType = ref("overview-shipment");

function exportFile() {
  // Xử lý xuất file ở đây
  showExportModal.value = false;
}
</script>

<style scoped>
.orders-page {
  padding: 24px 16px 0 16px;
  background: #f7f7f9;
  min-height: 100vh;
}
.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.export-file {
  background: #2196f3;
  color: #fff;
  padding: 8px 16px;
  margin-right: 30px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
  transition: background 0.2s;
}
.export-file:hover {
  background: #1976d2;
}
.orders-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 18px;
  color: #222;
  margin-top: 0px;
}
.orders-table {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 24px 0 48px 0;
  min-height: 500px;
  position: relative;
}
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 32px;
}
th,
td {
  padding: 8px 0;
}
.skeleton-header {
  height: 18px;
  width: 120px;
  background: #f0f1f3;
  border-radius: 6px;
  opacity: 0.5;
}
.skeleton-row {
  height: 16px;
  width: 100px;
  background: #f0f1f3;
  border-radius: 6px;
  opacity: 0.3;
}
.orders-empty {
  position: absolute;
  left: 0;
  right: 0;
  top: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.orders-empty-img {
  width: 72px;
  margin-bottom: 16px;
  opacity: 0.95;
}
.orders-empty-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 4px;
  color: #222;
  text-align: center;
}
.orders-empty-desc {
  color: #888;
  margin-bottom: 18px;
  text-align: center;
}
.orders-add-btn {
  background: #2196f3;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 22px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
  transition: background 0.2s;
}
.orders-add-btn:hover {
  background: #1976d2;
}
.orders-footer {
  text-align: right;
  margin-top: 18px;
  color: #888;
  font-size: 0.97rem;
  display: flex;
  justify-content: center;
}
.orders-link {
  color: #2196f3;
  text-decoration: underline;
}
/* Modal styles */
.modal-overlay {
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-export {
  background: #fff;
  border-radius: 10px;
  min-width: 420px;
  max-width: 95vw;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.13);
  padding: 0;
  animation: modalIn 0.18s;
}
@keyframes modalIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 28px 10px 28px;
  font-size: 1.18rem;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
}
.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  margin-left: 10px;
}
.modal-body {
  padding: 18px 28px 0 28px;
}
.modal-section {
  margin-bottom: 18px;
}
.modal-label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #222;
}
.modal-radio {
  display: flex;
  align-items: center;
  margin-bottom: 7px;
  font-size: 1rem;
  cursor: pointer;
  gap: 8px;
}
.modal-radio input[type="radio"] {
  accent-color: #2196f3;
  margin-right: 6px;
}
.modal-link {
  color: #2196f3;
  text-decoration: underline;
  font-size: 0.97rem;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px 28px 18px 28px;
  border-top: 1px solid #f0f0f0;
  background: #fafbfc;
  border-radius: 0 0 10px 10px;
}
.modal-btn {
  min-width: 80px;
  padding: 8px 18px;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.modal-btn.cancel {
  background: #fff;
  color: #2196f3;
  border: 1px solid #2196f3;
}
.modal-btn.export {
  background: #2196f3;
  color: #fff;
  border: none;
}
.modal-btn.export:hover {
  background: #1976d2;
}
</style>
