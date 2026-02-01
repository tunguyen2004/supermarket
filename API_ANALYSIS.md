# 📊 PHÂN TÍCH API - HỆ THỐNG QUẢN LÝ SIÊU THỊ MINI

**Ngày phân tích:** 31/01/2026  
**Phiên bản:** 1.0

---

## 📋 TỔNG QUAN

### Thống kê hiện tại

| Hạng mục | Đã có (Backend) | Frontend cần | Còn thiếu |
|----------|-----------------|--------------|-----------|
| **APIs** | 67 | ~85 | ~18 |
| **Modules** | 10 | 15 | 5 |

---

## ✅ PHẦN 1: CÁC API ĐÃ CÓ (67 APIs - Theo API.md)

### Module 1: Authentication (4 APIs) ✅
| STT | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| 1 | POST | `/api/auth/login` | Đăng nhập |
| 2 | POST | `/api/auth/logout` | Đăng xuất (đã có blacklist token) |
| 3 | POST | `/api/auth/refresh` | Làm mới token |
| 4 | GET | `/api/auth/roles` | Danh sách vai trò |

### Module 2: Staff Management (6 APIs) ✅
| STT | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| 1 | GET | `/api/staff` | Danh sách nhân viên |
| 2 | POST | `/api/staff` | Thêm nhân viên |
| 3 | GET | `/api/staff/:id` | Chi tiết nhân viên |
| 4 | PUT | `/api/staff/:id` | Cập nhật nhân viên |
| 5 | DELETE | `/api/staff/:id` | Xóa nhân viên |
| 6 | PUT | `/api/staff/:id/role` | Phân quyền nhân viên |

### Module 3: Profile Management (5 APIs) ✅
| STT | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| 1 | GET | `/api/users/profile` | Xem profile |
| 2 | PUT | `/api/users/profile` | Cập nhật profile |
| 3 | PUT | `/api/users/change-password` | Đổi mật khẩu |
| 4 | POST | `/api/users/avatar` | Upload avatar |
| 5 | DELETE | `/api/users/avatar` | Xóa avatar |

### Module 4: Products (10 APIs) ✅
| STT | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| 1 | GET | `/api/products` | Danh sách sản phẩm |
| 2 | POST | `/api/products` | Thêm sản phẩm |
| 3 | GET | `/api/products/:id` | Chi tiết sản phẩm |
| 4 | PUT | `/api/products/:id` | Sửa sản phẩm |
| 5 | DELETE | `/api/products/:id` | Xóa sản phẩm |
| 6 | PATCH | `/api/products/bulk-status` | Bật/tắt hàng loạt |
| 7 | POST | `/api/products/import` | Import CSV |
| 8 | GET | `/api/products/export` | Export CSV |
| 9 | GET | `/api/brands` | DS thương hiệu |
| 10 | GET | `/api/units` | DS đơn vị tính |

### Module 5: Collections (6 APIs) ✅
| STT | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| 1 | GET | `/api/collections` | Danh sách danh mục |
| 2 | GET | `/api/collections/tree` | Cây danh mục |
| 3 | POST | `/api/collections` | Thêm danh mục |
| 4 | GET | `/api/collections/:id` | Chi tiết danh mục |
| 5 | PUT | `/api/collections/:id` | Sửa danh mục |
| 6 | DELETE | `/api/collections/:id` | Xóa danh mục |

### Module 6: Dashboard (7 APIs) ✅
| STT | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| 1 | GET | `/api/dashboard/overview` | Tổng quan |
| 2 | GET | `/api/dashboard/stats` | Thống kê |
| 3 | GET | `/api/dashboard/revenue-chart` | Biểu đồ doanh thu |
| 4 | GET | `/api/dashboard/top-products` | Top sản phẩm |
| 5 | GET | `/api/dashboard/sales-channels` | Kênh bán hàng |
| 6 | GET | `/api/dashboard/top-customers` | Top khách hàng |
| 7 | GET | `/api/dashboard/low-stock` | SP sắp hết |

### Module 7: Catalog - Bảng giá (5 APIs) ✅
| STT | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| 1 | GET | `/api/catalogs` | Danh sách bảng giá |
| 2 | GET | `/api/catalogs/:id` | Chi tiết bảng giá |
| 3 | PUT | `/api/catalogs/:id` | Cập nhật giá |
| 4 | PATCH | `/api/catalogs/bulk-update` | Cập nhật giá hàng loạt |
| 5 | GET | `/api/catalogs/export` | Export CSV |

### Module 8: Inventory (9 APIs) ✅
| STT | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| 1 | GET | `/api/stores` | DS cửa hàng/kho |
| 2 | GET | `/api/transaction-types` | DS loại giao dịch |
| 3 | GET | `/api/inventories` | Danh sách tồn kho |
| 4 | GET | `/api/inventories/:variantId` | Chi tiết tồn kho |
| 5 | PUT | `/api/inventories/:variantId` | Điều chỉnh tồn kho |
| 6 | GET | `/api/inventories/:variantId/history` | Lịch sử xuất nhập |
| 7 | POST | `/api/inventories/receive` | Nhập kho |
| 8 | POST | `/api/inventories/transfer` | Chuyển kho |
| 9 | POST | `/api/inventories/return` | Trả hàng NCC |

### Module 9: Product Images (7 APIs) ✅
| STT | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| 1 | GET | `/api/products/:id/images` | DS ảnh sản phẩm |
| 2 | POST | `/api/products/:id/image` | Upload ảnh chính |
| 3 | DELETE | `/api/products/:id/image` | Xóa ảnh chính |
| 4 | POST | `/api/products/:id/images` | Upload gallery |
| 5 | DELETE | `/api/products/:id/images/:imageId` | Xóa ảnh gallery |
| 6 | PUT | `/api/products/:id/images/:imageId/primary` | Set ảnh chính |
| 7 | PUT | `/api/products/:id/images/reorder` | Sắp xếp ảnh |

### Module 10: Orders (7 APIs) ✅
| STT | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| 1 | GET | `/api/orders` | Danh sách đơn hàng |
| 2 | POST | `/api/orders` | Tạo đơn hàng |
| 3 | GET | `/api/orders/:id` | Chi tiết đơn hàng |
| 4 | PUT | `/api/orders/:id` | Cập nhật đơn hàng |
| 5 | DELETE | `/api/orders/:id` | Hủy đơn hàng |
| 6 | GET | `/api/orders/stats/summary` | Thống kê summary |
| 7 | GET | `/api/orders/stats/detailed` | Thống kê chi tiết |

---

## ❌ PHẦN 2: CÁC API CÒN THIẾU (Frontend đang cần)

### 🔴 Module: Customers (Khách hàng) - 8 APIs

> **File Frontend:** `CustomerList.vue`, `Pos.vue` (CustomerPicker)

| STT | Method | Endpoint | Mô tả | Priority |
|-----|--------|----------|-------|----------|
| 1 | GET | `/api/customers` | Danh sách khách hàng | 🔴 HIGH |
| 2 | GET | `/api/customers/search` | Tìm kiếm nhanh (cho POS) | 🔴 HIGH |
| 3 | POST | `/api/customers` | Thêm khách hàng | 🔴 HIGH |
| 4 | GET | `/api/customers/:id` | Chi tiết khách hàng | 🟡 MEDIUM |
| 5 | PUT | `/api/customers/:id` | Sửa khách hàng | 🟡 MEDIUM |
| 6 | DELETE | `/api/customers/:id` | Xóa khách hàng | 🟢 LOW |
| 7 | GET | `/api/customer-groups` | DS nhóm khách hàng | 🟡 MEDIUM |
| 8 | PUT | `/api/customers/:id/group` | Chuyển nhóm KH | 🟢 LOW |

### 🔴 Module: Suppliers (Nhà cung cấp) - 5 APIs

> **File Frontend:** `Suppliers.vue`
> **Service:** `supplierService.js` (đã có định nghĩa nhưng backend chưa có)

| STT | Method | Endpoint | Mô tả | Priority |
|-----|--------|----------|-------|----------|
| 1 | GET | `/api/suppliers` | Danh sách NCC | 🔴 HIGH |
| 2 | POST | `/api/suppliers` | Thêm NCC | 🔴 HIGH |
| 3 | PUT | `/api/suppliers/:id` | Sửa NCC | 🟡 MEDIUM |
| 4 | DELETE | `/api/suppliers/:id` | Xóa NCC | 🟢 LOW |
| 5 | POST | `/api/suppliers/returns` | Trả hàng cho NCC | 🟢 LOW |

### 🔴 Module: Discounts (Khuyến mại) - 7 APIs

> **File Frontend:** `Discounts.vue`, `DiscountForm.vue`

| STT | Method | Endpoint | Mô tả | Priority |
|-----|--------|----------|-------|----------|
| 1 | GET | `/api/discounts` | Danh sách khuyến mại | 🟡 MEDIUM |
| 2 | POST | `/api/discounts` | Tạo khuyến mại | 🟡 MEDIUM |
| 3 | GET | `/api/discounts/:id` | Chi tiết khuyến mại | 🟢 LOW |
| 4 | PUT | `/api/discounts/:id` | Sửa khuyến mại | 🟢 LOW |
| 5 | DELETE | `/api/discounts/:id` | Xóa khuyến mại | 🟢 LOW |
| 6 | PATCH | `/api/discounts/:id/deactivate` | Kết thúc khuyến mại | 🟢 LOW |
| 7 | POST | `/api/discounts/validate` | Kiểm tra mã KM (POS) | 🟡 MEDIUM |

### 🔴 Module: Transactions/Cashbook (Sổ quỹ) - 6 APIs

> **File Frontend:** `Fundbook.vue`
> **Service:** `cashbookService.js` (trống)

| STT | Method | Endpoint | Mô tả | Priority |
|-----|--------|----------|-------|----------|
| 1 | GET | `/api/transactions` | Danh sách giao dịch | 🟡 MEDIUM |
| 2 | POST | `/api/transactions` | Thêm phiếu thu/chi | 🟡 MEDIUM |
| 3 | GET | `/api/transactions/:id` | Chi tiết giao dịch | 🟢 LOW |
| 4 | PUT | `/api/transactions/:id` | Sửa giao dịch | 🟢 LOW |
| 5 | DELETE | `/api/transactions/:id` | Xóa giao dịch | 🟢 LOW |
| 6 | GET | `/api/transactions/summary` | Thống kê tồn quỹ | 🟡 MEDIUM |

### 🔴 Module: Shipments (Vận chuyển) - 6 APIs

> **File Frontend:** `Shipments.vue`, `ShipmentForm.vue`, `Reports_Shipments.vue`
> **Service:** `shipmentService.js` (trống)

| STT | Method | Endpoint | Mô tả | Priority |
|-----|--------|----------|-------|----------|
| 1 | GET | `/api/shipments` | Danh sách vận đơn | 🟢 LOW |
| 2 | POST | `/api/shipments` | Tạo vận đơn | 🟢 LOW |
| 3 | GET | `/api/shipments/:id` | Chi tiết vận đơn | 🟢 LOW |
| 4 | PUT | `/api/shipments/:id` | Sửa vận đơn | 🟢 LOW |
| 5 | DELETE | `/api/shipments/:id` | Xóa vận đơn | 🟢 LOW |
| 6 | PATCH | `/api/shipments/:id/status` | Cập nhật trạng thái | 🟢 LOW |

### 🔴 Module: Staff POS (Bán hàng) - 4 APIs

> **File Frontend:** `Pos.vue` (staff folder)

| STT | Method | Endpoint | Mô tả | Priority |
|-----|--------|----------|-------|----------|
| 1 | GET | `/api/pos/products/search` | Tìm SP nhanh (F3) | 🔴 HIGH |
| 2 | POST | `/api/pos/orders` | Tạo đơn từ POS | 🔴 HIGH |
| 3 | GET | `/api/pos/orders/:id/print` | In hóa đơn | 🟡 MEDIUM |
| 4 | POST | `/api/pos/customers` | Thêm KH nhanh | 🟡 MEDIUM |

> **Ghi chú:** Có thể dùng chung với `/api/orders` và `/api/products` nhưng cần endpoint riêng cho tối ưu performance

### 🔴 Module: Staff Inventory Lookup (Tra cứu tồn kho) - 2 APIs

> **File Frontend:** `InventoryLookup.vue`, `InventoryLookupDetail.vue`
> **Service:** `inventoryLookupService.js` (đã có định nghĩa)

| STT | Method | Endpoint | Mô tả | Priority |
|-----|--------|----------|-------|----------|
| 1 | GET | `/api/inventory/lookup/search` | Tìm kiếm SP tồn kho | 🟡 MEDIUM |
| 2 | GET | `/api/inventory/lookup/:productId` | Chi tiết tồn theo chi nhánh | 🟡 MEDIUM |

### 🔴 Module: Staff End of Day (Báo cáo cuối ngày) - 4 APIs

> **File Frontend:** `EndOfDay.vue`

| STT | Method | Endpoint | Mô tả | Priority |
|-----|--------|----------|-------|----------|
| 1 | GET | `/api/staff/reports/daily` | Thống kê doanh thu ngày | 🟡 MEDIUM |
| 2 | GET | `/api/staff/reports/actual-revenue` | Thống kê thực thu | 🟡 MEDIUM |
| 3 | GET | `/api/staff/reports/sold-products` | DS sản phẩm đã bán | 🟡 MEDIUM |
| 4 | GET | `/api/staff/reports/daily/print` | In báo cáo cuối ngày | 🟢 LOW |

### 🔴 Module: Order Returns (Trả hàng) - 2 APIs

> **File Frontend:** `Order_Returns.vue`, `OrderLookup.vue`

| STT | Method | Endpoint | Mô tả | Priority |
|-----|--------|----------|-------|----------|
| 1 | GET | `/api/orders/returns` | DS đơn trả hàng | 🟡 MEDIUM |
| 2 | POST | `/api/orders/:id/return` | Hoàn trả đơn hàng | 🟡 MEDIUM |

---

## 📊 PHẦN 3: THỐNG KÊ TỔNG HỢP

### Theo Module

| Module | Có sẵn | Còn thiếu | Tổng cần |
|--------|--------|-----------|----------|
| Authentication | 4 | 0 | 4 |
| Staff Management | 6 | 0 | 6 |
| Profile | 5 | 0 | 5 |
| Products | 10 | 0 | 10 |
| Collections | 6 | 0 | 6 |
| Dashboard | 7 | 0 | 7 |
| Catalog | 5 | 0 | 5 |
| Inventory | 9 | 2 | 11 |
| Product Images | 7 | 0 | 7 |
| Orders | 7 | 2 | 9 |
| **Customers** | 0 | **8** | 8 |
| **Suppliers** | 0 | **5** | 5 |
| **Discounts** | 0 | **7** | 7 |
| **Transactions** | 0 | **6** | 6 |
| **Shipments** | 0 | **6** | 6 |
| **Staff POS** | 0 | **4** | 4 |
| **Staff Reports** | 0 | **4** | 4 |
| **TỔNG** | **67** | **44** | **111** |

### Theo Priority

| Priority | Số lượng | Ghi chú |
|----------|----------|---------|
| 🔴 HIGH | 11 APIs | Cần làm ngay để có thể bán hàng |
| 🟡 MEDIUM | 19 APIs | Quan trọng cho vận hành |
| 🟢 LOW | 14 APIs | Có thể làm sau |

---

## 🎯 PHẦN 4: ĐỀ XUẤT CẢI TIẾN

### 4.1. Gộp APIs để tối ưu

#### ⚡ Gộp POS APIs
```
Thay vì:
- GET /api/pos/products/search
- POST /api/pos/orders

Có thể dùng:
- GET /api/products?search=xxx&limit=10&fields=id,name,sku,price,stock (thêm param fields)
- POST /api/orders (giữ nguyên)
```

#### ⚡ Gộp Customer APIs
```
Thay vì:
- GET /api/customers/search

Có thể dùng:
- GET /api/customers?search=xxx&limit=10 (tìm kiếm nhanh)
```

#### ⚡ Gộp Inventory Lookup với Inventory
```
Thay vì:
- GET /api/inventory/lookup/search
- GET /api/inventory/lookup/:productId

Có thể dùng:
- GET /api/inventories?search=xxx (đã có)
- GET /api/inventories/:variantId (đã có)
```

### 4.2. Service Files cần cập nhật

| File | Trạng thái | Cần làm |
|------|------------|---------|
| `salesService.js` | ❌ Trống | Xóa hoặc implement |
| `shipmentService.js` | ❌ Trống | Xóa hoặc implement |
| `cashbookService.js` | ❌ Trống | Implement cho Fundbook.vue |
| `customerGroupService.js` | ❌ Trống | Implement hoặc gộp vào customerService |
| `inventoryLookupService.js` | ✅ Có code | Gộp vào inventoryService |
| `reportService.js` | ⚠️ Thiếu | Cần thêm nhiều endpoint |
| `supplierService.js` | ✅ Có code | Backend chưa có |

### 4.3. Frontend Views cần API

| View | Folder | APIs hiện tại | APIs còn thiếu |
|------|--------|---------------|----------------|
| `Pos.vue` | staff | 0 | 4 (POS search, create order, customer) |
| `EndOfDay.vue` | staff | 0 | 4 (Daily reports) |
| `OrderLookup.vue` | staff | Dùng chung orders | 1 (print invoice) |
| `InventoryLookup.vue` | staff | Dùng chung inventory | 0 |
| `CustomerList.vue` | views/Users | 0 | 8 (Customers) |
| `Suppliers.vue` | views/Inventory | 0 | 5 (Suppliers) |
| `Discounts.vue` | views/Sales | 0 | 7 (Discounts) |
| `Fundbook.vue` | views/Cashbook | 0 | 6 (Transactions) |
| `Shipments.vue` | views/Shipments | 0 | 6 (Shipments) |

### 4.4. Đề xuất thứ tự triển khai

#### 🔴 Giai đoạn 1: Core POS (Tuần 1)
```
1. Customers APIs (8 APIs) → Quản lý khách hàng
2. Tối ưu Orders API cho POS → Thêm param fields, quick search
3. Print Invoice API → In hóa đơn
```
**Kết quả:** Nhân viên có thể bán hàng, quản lý khách

#### 🟡 Giai đoạn 2: Quản lý NCC & Kho (Tuần 2)
```
1. Suppliers APIs (5 APIs) → Quản lý nhà cung cấp
2. Staff Reports APIs (4 APIs) → Báo cáo cuối ngày
3. Order Returns API (2 APIs) → Hoàn trả đơn hàng
```
**Kết quả:** Hoàn thiện quy trình nhập hàng, báo cáo

#### 🟢 Giai đoạn 3: Tính năng bổ sung (Tuần 3-4)
```
1. Discounts APIs (7 APIs) → Khuyến mại
2. Transactions APIs (6 APIs) → Sổ quỹ
3. Shipments APIs (6 APIs) → Vận chuyển
```
**Kết quả:** Hoàn thiện hệ thống

---

## 📝 PHẦN 5: DANH SÁCH API ĐỀ XUẤT CUỐI CÙNG

### APIs cần làm ngay (11 APIs - Priority HIGH)

```javascript
// Customers - 5 APIs HIGH
GET    /api/customers              // Danh sách khách hàng
GET    /api/customers/search       // Tìm kiếm nhanh (cho POS)
POST   /api/customers              // Thêm khách hàng
GET    /api/customers/:id          // Chi tiết khách hàng (bonus)
GET    /api/customer-groups        // Danh sách nhóm KH

// Suppliers - 2 APIs HIGH
GET    /api/suppliers              // Danh sách NCC
POST   /api/suppliers              // Thêm NCC

// Orders Enhancement - 2 APIs HIGH
POST   /api/orders/:id/return      // Hoàn trả đơn hàng
GET    /api/orders/:id/invoice     // In hóa đơn (PDF/HTML)

// POS Optimization - 2 APIs HIGH
GET    /api/products?search&fields&limit  // Tìm SP nhanh (dùng chung)
POST   /api/customers              // Thêm KH nhanh (dùng chung)
```

### APIs cần làm sớm (19 APIs - Priority MEDIUM)

```javascript
// Customers - 3 APIs
PUT    /api/customers/:id          // Sửa khách hàng
DELETE /api/customers/:id          // Xóa khách hàng
PUT    /api/customers/:id/group    // Chuyển nhóm KH

// Suppliers - 2 APIs
PUT    /api/suppliers/:id          // Sửa NCC
DELETE /api/suppliers/:id          // Xóa NCC

// Discounts - 3 APIs
GET    /api/discounts              // Danh sách khuyến mại
POST   /api/discounts              // Tạo khuyến mại
POST   /api/discounts/validate     // Kiểm tra mã KM

// Transactions - 3 APIs
GET    /api/transactions           // Danh sách giao dịch
POST   /api/transactions           // Thêm phiếu thu/chi
GET    /api/transactions/summary   // Thống kê tồn quỹ

// Staff Reports - 4 APIs
GET    /api/staff/reports/daily         // Doanh thu ngày
GET    /api/staff/reports/actual-revenue // Thực thu
GET    /api/staff/reports/sold-products  // DS đã bán
GET    /api/staff/reports/daily/print    // In báo cáo

// Order Returns - 1 API
GET    /api/orders/returns         // DS đơn trả hàng
```

---

## 🔧 PHẦN 6: CODE MẪU CHO SERVICE FILES

### customerService.js (cần tạo mới)

```javascript
import apiClient from "./apiClient";

const customerService = {
  // Danh sách khách hàng
  async getCustomers(params = {}) {
    const response = await apiClient.get("/api/customers", { params });
    return response.data;
  },

  // Tìm kiếm nhanh (cho POS)
  async searchCustomers(query, limit = 10) {
    const response = await apiClient.get("/api/customers/search", {
      params: { q: query, limit }
    });
    return response.data;
  },

  // Thêm khách hàng
  async createCustomer(data) {
    const response = await apiClient.post("/api/customers", data);
    return response.data;
  },

  // Chi tiết khách hàng
  async getCustomerById(id) {
    const response = await apiClient.get(`/api/customers/${id}`);
    return response.data;
  },

  // Sửa khách hàng
  async updateCustomer(id, data) {
    const response = await apiClient.put(`/api/customers/${id}`, data);
    return response.data;
  },

  // Xóa khách hàng
  async deleteCustomer(id) {
    const response = await apiClient.delete(`/api/customers/${id}`);
    return response.data;
  },

  // Danh sách nhóm khách hàng
  async getCustomerGroups() {
    const response = await apiClient.get("/api/customer-groups");
    return response.data;
  },

  // Chuyển nhóm khách hàng
  async updateCustomerGroup(customerId, groupId) {
    const response = await apiClient.put(`/api/customers/${customerId}/group`, {
      group_id: groupId
    });
    return response.data;
  }
};

export default customerService;
```

### discountService.js (cần tạo mới)

```javascript
import apiClient from "./apiClient";

const discountService = {
  // Danh sách khuyến mại
  async getDiscounts(params = {}) {
    const response = await apiClient.get("/api/discounts", { params });
    return response.data;
  },

  // Tạo khuyến mại
  async createDiscount(data) {
    const response = await apiClient.post("/api/discounts", data);
    return response.data;
  },

  // Chi tiết khuyến mại
  async getDiscountById(id) {
    const response = await apiClient.get(`/api/discounts/${id}`);
    return response.data;
  },

  // Sửa khuyến mại
  async updateDiscount(id, data) {
    const response = await apiClient.put(`/api/discounts/${id}`, data);
    return response.data;
  },

  // Xóa khuyến mại
  async deleteDiscount(id) {
    const response = await apiClient.delete(`/api/discounts/${id}`);
    return response.data;
  },

  // Kết thúc khuyến mại
  async deactivateDiscount(id) {
    const response = await apiClient.patch(`/api/discounts/${id}/deactivate`);
    return response.data;
  },

  // Kiểm tra mã khuyến mại (POS)
  async validateDiscount(code, orderData) {
    const response = await apiClient.post("/api/discounts/validate", {
      code,
      ...orderData
    });
    return response.data;
  }
};

export default discountService;
```

---

## 📋 TÓM TẮT

| Hạng mục | Số lượng |
|----------|----------|
| **APIs đã có** | 67 |
| **APIs còn thiếu** | 44 |
| **Tổng cần có** | 111 |
| **Priority HIGH** | 11 |
| **Priority MEDIUM** | 19 |
| **Priority LOW** | 14 |

### Đề xuất tối ưu

1. **Gộp APIs**: Inventory Lookup → Inventory, Customer Search → Customer
2. **Xóa service trống**: salesService.js, shipmentService.js (nếu không dùng)
3. **Cập nhật API.md**: Thêm các APIs còn thiếu sau khi implement
4. **Sử dụng query params**: Thay vì tạo endpoint riêng, dùng `?fields=` để tối ưu

---

**Cập nhật:** 31/01/2026  
**Tác giả:** GitHub Copilot
