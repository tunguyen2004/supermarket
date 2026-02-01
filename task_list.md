# 📋 TASK LIST - HỆ THỐNG QUẢN LÝ SIÊU THỊ MINI

**Cập nhật:** 31/01/2026  
**Tham khảo:** `API_ANALYSIS.md`

---

## 📊 TỔNG QUAN

| Hạng mục | Đã có | Còn thiếu | Tổng |
|----------|-------|-----------|------|
| **APIs** | 129 | 0 | 129 |
| **Modules** | 21 | 0 | 21 |

### 🎉 TẤT CẢ MODULES ĐÃ HOÀN THÀNH!

### 🎯 Vừa hoà### ✅ Module 20: Bank Account - Tài khoản ngân hàng (5 APIs) - DONE

> **Frontend:** `PaymentDrawer.vue` (Thiết lập tài khoản thụ hưởng)
> **Service:** ✅ `bankAccountService.js` đã tạo

| STT | Chức năng | Method | Endpoint | Priority | Trạng thái |
|-----|-----------|--------|----------|----------|------------|
| 1 | DS tài khoản NH | GET | `/api/bank-accounts` | 🟡 MEDIUM | ✅ Done |
| 2 | Thêm tài khoản NH | POST | `/api/bank-accounts` | 🟡 MEDIUM | ✅ Done |
| 3 | Sửa tài khoản NH | PUT | `/api/bank-accounts/:id` | 🟢 LOW | ✅ Done |
| 4 | Xóa tài khoản NH | DELETE | `/api/bank-accounts/:id` | 🟢 LOW | ✅ Done |
| 5 | Tạo mã QR thanh toán | GET | `/api/bank-accounts/:id/qr` | 🟡 MEDIUM | ✅ Done |APIs mới):
- ✅ Module 11: Customers (8 APIs)
- ✅ Module 12: Suppliers (5 APIs)
- ✅ Module 13: Discounts (8 APIs)
- ✅ Module 14: Transactions (7 APIs)
- ✅ Module 15: Shipments (8 APIs)
- ✅ Module 16: Orders Enhancement (4 APIs)
- ✅ Module 17: Staff Reports (5 APIs)
- ✅ Module 18: Inventory Lookup (2 APIs)
- ✅ Module 19: POS Payment (10 APIs)

### 📝 APIs mới thêm vào danh sách:
- 🔴 Module 19: POS Payment (8 APIs) - Thanh toán tại quầy
- ✅ Module 20: Bank Account (5 APIs) - Quản lý tài khoản ngân hàng
- ✅ Module 21: Checkouts (4 APIs) - Đơn chưa hoàn tất

---

## ✅ PHẦN 1: CÁC MODULE ĐÃ HOÀN THÀNH (67 APIs)

### Module 1: Authentication (4 APIs) ✅
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Đăng nhập | POST | `/api/auth/login` | ✅ Done |
| 2 | Đăng xuất | POST | `/api/auth/logout` | ✅ Done |
| 3 | Refresh token | POST | `/api/auth/refresh` | ✅ Done |
| 4 | Lấy danh sách roles | GET | `/api/auth/roles` | ✅ Done |

### Module 2: Profile (5 APIs) ✅
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Xem thông tin cá nhân | GET | `/api/users/profile` | ✅ Done |
| 2 | Cập nhật thông tin | PUT | `/api/users/profile` | ✅ Done |
| 3 | Đổi mật khẩu | PUT | `/api/users/change-password` | ✅ Done |
| 4 | Upload avatar | POST | `/api/users/avatar` | ✅ Done |
| 5 | Xóa avatar | DELETE | `/api/users/avatar` | ✅ Done |

### Module 3: Staff Management (6 APIs) ✅
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách nhân viên | GET | `/api/staff` | ✅ Done |
| 2 | Thêm nhân viên | POST | `/api/staff` | ✅ Done |
| 3 | Chi tiết nhân viên | GET | `/api/staff/:id` | ✅ Done |
| 4 | Sửa nhân viên | PUT | `/api/staff/:id` | ✅ Done |
| 5 | Xóa nhân viên | DELETE | `/api/staff/:id` | ✅ Done |
| 6 | Phân quyền | PUT | `/api/staff/:id/role` | ✅ Done |

### Module 4: Products (10 APIs) ✅
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách sản phẩm | GET | `/api/products` | ✅ Done |
| 2 | Thêm sản phẩm | POST | `/api/products` | ✅ Done |
| 3 | Chi tiết sản phẩm | GET | `/api/products/:id` | ✅ Done |
| 4 | Sửa sản phẩm | PUT | `/api/products/:id` | ✅ Done |
| 5 | Xóa sản phẩm | DELETE | `/api/products/:id` | ✅ Done |
| 6 | Bật/tắt hàng loạt | PATCH | `/api/products/bulk-status` | ✅ Done |
| 7 | Import CSV | POST | `/api/products/import` | ✅ Done |
| 8 | Export CSV | GET | `/api/products/export` | ✅ Done |
| 9 | Danh sách thương hiệu | GET | `/api/brands` | ✅ Done |
| 10 | Danh sách đơn vị | GET | `/api/units` | ✅ Done |

### Module 5: Collections (6 APIs) ✅
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách danh mục | GET | `/api/collections` | ✅ Done |
| 2 | Cây danh mục | GET | `/api/collections/tree` | ✅ Done |
| 3 | Thêm danh mục | POST | `/api/collections` | ✅ Done |
| 4 | Chi tiết danh mục | GET | `/api/collections/:id` | ✅ Done |
| 5 | Sửa danh mục | PUT | `/api/collections/:id` | ✅ Done |
| 6 | Xóa danh mục | DELETE | `/api/collections/:id` | ✅ Done |

### Module 6: Dashboard (7 APIs) ✅
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Tổng quan Dashboard | GET | `/api/dashboard/overview` | ✅ Done |
| 2 | Thống kê theo khoảng | GET | `/api/dashboard/stats` | ✅ Done |
| 3 | Biểu đồ doanh thu | GET | `/api/dashboard/revenue-chart` | ✅ Done |
| 4 | Top sản phẩm bán chạy | GET | `/api/dashboard/top-products` | ✅ Done |
| 5 | Kênh bán hàng | GET | `/api/dashboard/sales-channels` | ✅ Done |
| 6 | Top khách hàng | GET | `/api/dashboard/top-customers` | ✅ Done |
| 7 | Sản phẩm sắp hết | GET | `/api/dashboard/low-stock` | ✅ Done |

### Module 7: Catalog - Bảng giá (5 APIs) ✅
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách bảng giá | GET | `/api/catalogs` | ✅ Done |
| 2 | Chi tiết bảng giá | GET | `/api/catalogs/:id` | ✅ Done |
| 3 | Cập nhật giá | PUT | `/api/catalogs/:id` | ✅ Done |
| 4 | Cập nhật giá hàng loạt | PATCH | `/api/catalogs/bulk-update` | ✅ Done |
| 5 | Export bảng giá | GET | `/api/catalogs/export` | ✅ Done |

### Module 8: Inventory (9 APIs) ✅
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | DS cửa hàng/kho | GET | `/api/stores` | ✅ Done |
| 2 | DS loại giao dịch | GET | `/api/transaction-types` | ✅ Done |
| 3 | Danh sách tồn kho | GET | `/api/inventories` | ✅ Done |
| 4 | Chi tiết tồn kho | GET | `/api/inventories/:variantId` | ✅ Done |
| 5 | Điều chỉnh tồn kho | PUT | `/api/inventories/:variantId` | ✅ Done |
| 6 | Lịch sử xuất nhập | GET | `/api/inventories/:variantId/history` | ✅ Done |
| 7 | Nhập kho | POST | `/api/inventories/receive` | ✅ Done |
| 8 | Chuyển kho | POST | `/api/inventories/transfer` | ✅ Done |
| 9 | Trả hàng NCC | POST | `/api/inventories/return` | ✅ Done |

### Module 9: Product Images (7 APIs) ✅
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | DS ảnh sản phẩm | GET | `/api/products/:id/images` | ✅ Done |
| 2 | Upload ảnh chính | POST | `/api/products/:id/image` | ✅ Done |
| 3 | Xóa ảnh chính | DELETE | `/api/products/:id/image` | ✅ Done |
| 4 | Upload gallery | POST | `/api/products/:id/images` | ✅ Done |
| 5 | Xóa ảnh gallery | DELETE | `/api/products/:id/images/:imageId` | ✅ Done |
| 6 | Set ảnh chính | PUT | `/api/products/:id/images/:imageId/primary` | ✅ Done |
| 7 | Sắp xếp ảnh | PUT | `/api/products/:id/images/reorder` | ✅ Done |

### Module 10: Orders (7 APIs) ✅
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách đơn hàng | GET | `/api/orders` | ✅ Done |
| 2 | Tạo đơn hàng | POST | `/api/orders` | ✅ Done |
| 3 | Chi tiết đơn hàng | GET | `/api/orders/:id` | ✅ Done |
| 4 | Cập nhật đơn hàng | PUT | `/api/orders/:id` | ✅ Done |
| 5 | Hủy đơn hàng | DELETE | `/api/orders/:id` | ✅ Done |
| 6 | Thống kê summary | GET | `/api/orders/stats/summary` | ✅ Done |
| 7 | Thống kê chi tiết | GET | `/api/orders/stats/detailed` | ✅ Done |

---

## ⏳ PHẦN 2: CÁC MODULE CẦN LÀM (27 APIs còn lại)

### ✅ Module 11: Customers - Khách hàng (8 APIs) - DONE

> **Frontend:** `CustomerList.vue`, `Customer_groups.vue`, `Pos.vue` (CustomerPicker)
> **Service:** ✅ `customerService.js` đã tạo

| STT | Chức năng | Method | Endpoint | Priority | Trạng thái |
|-----|-----------|--------|----------|----------|------------|
| 1 | Danh sách khách hàng | GET | `/api/customers` | 🔴 HIGH | ✅ Done |
| 2 | Tìm kiếm nhanh (POS) | GET | `/api/customers/search` | 🔴 HIGH | ✅ Done |
| 3 | Thêm khách hàng | POST | `/api/customers` | 🔴 HIGH | ✅ Done |
| 4 | Chi tiết khách hàng | GET | `/api/customers/:id` | 🟡 MEDIUM | ✅ Done |
| 5 | Sửa khách hàng | PUT | `/api/customers/:id` | 🟡 MEDIUM | ✅ Done |
| 6 | Xóa khách hàng | DELETE | `/api/customers/:id` | 🟢 LOW | ✅ Done |
| 7 | DS nhóm khách hàng | GET | `/api/customer-groups` | 🟡 MEDIUM | ✅ Done |
| 8 | Chuyển nhóm KH | PUT | `/api/customers/:id/group` | 🟢 LOW | ✅ Done |

**Query Params cho GET /api/customers:**
```
?search=tên/sđt&group_id=1&page=1&limit=20
```

---

### ✅ Module 12: Suppliers - Nhà cung cấp (5 APIs) - DONE

> **Frontend:** `Suppliers.vue`
> **Service:** ✅ `supplierService.js` đã tạo

| STT | Chức năng | Method | Endpoint | Priority | Trạng thái |
|-----|-----------|--------|----------|----------|------------|
| 1 | Danh sách NCC | GET | `/api/suppliers` | 🔴 HIGH | ✅ Done |
| 2 | Chi tiết NCC | GET | `/api/suppliers/:id` | � MEDIUM | ✅ Done |
| 3 | Thêm NCC | POST | `/api/suppliers` | � HIGH | ✅ Done |
| 4 | Sửa NCC | PUT | `/api/suppliers/:id` | � MEDIUM | ✅ Done |
| 5 | Xóa NCC | DELETE | `/api/suppliers/:id` | 🟢 LOW | ✅ Done |

---

### ✅ Module 13: Discounts - Khuyến mại (7 APIs) - DONE

> **Frontend:** `Discounts.vue`, `DiscountForm.vue`
> **Service:** ✅ `discountService.js` đã tạo

| STT | Chức năng | Method | Endpoint | Priority | Trạng thái |
|-----|-----------|--------|----------|----------|------------|
| 1 | Danh sách khuyến mại | GET | `/api/discounts` | 🟡 MEDIUM | ✅ Done |
| 2 | Tạo khuyến mại | POST | `/api/discounts` | 🟡 MEDIUM | ✅ Done |
| 3 | Chi tiết khuyến mại | GET | `/api/discounts/:id` | 🟢 LOW | ✅ Done |
| 4 | Sửa khuyến mại | PUT | `/api/discounts/:id` | 🟢 LOW | ✅ Done |
| 5 | Xóa khuyến mại | DELETE | `/api/discounts/:id` | 🟢 LOW | ✅ Done |
| 6 | Kết thúc khuyến mại | PATCH | `/api/discounts/:id/deactivate` | 🟢 LOW | ✅ Done |
| 7 | Kiểm tra mã KM (POS) | POST | `/api/discounts/validate` | 🟡 MEDIUM | ✅ Done |
| 8 | DS loại khuyến mại | GET | `/api/discounts/types` | 🟢 LOW | ✅ Done (bonus) |

---

### ✅ Module 14: Transactions - Sổ quỹ (6 APIs) - DONE

> **Frontend:** `Fundbook.vue`
> **Service:** ✅ `cashbookService.js` đã tạo

| STT | Chức năng | Method | Endpoint | Priority | Trạng thái |
|-----|-----------|--------|----------|----------|------------|
| 1 | Danh sách giao dịch | GET | `/api/transactions` | 🟡 MEDIUM | ✅ Done |
| 2 | Thêm phiếu thu/chi | POST | `/api/transactions` | 🟡 MEDIUM | ✅ Done |
| 3 | Chi tiết giao dịch | GET | `/api/transactions/:id` | 🟢 LOW | ✅ Done |
| 4 | Sửa giao dịch | PUT | `/api/transactions/:id` | 🟢 LOW | ✅ Done |
| 5 | Xóa giao dịch | DELETE | `/api/transactions/:id` | 🟢 LOW | ✅ Done |
| 6 | Thống kê tồn quỹ | GET | `/api/transactions/summary` | 🟡 MEDIUM | ✅ Done |
| 7 | Duyệt giao dịch | PATCH | `/api/transactions/:id/approve` | 🟢 LOW | ✅ Done (bonus) |

**Query Params cho GET /api/transactions:**
```
?from=2026-01-01&to=2026-01-31&type=thu|chi&employee_id=1&page=1&limit=20
```

---

### ✅ Module 15: Shipments - Vận chuyển (6 APIs) - DONE

> **Frontend:** `Shipments.vue`, `ShipmentForm.vue`, `Reports_Shipments.vue`
> **Service:** ✅ `shipmentService.js` đã tạo

| STT | Chức năng | Method | Endpoint | Priority | Trạng thái |
|-----|-----------|--------|----------|----------|------------|
| 1 | Danh sách vận đơn | GET | `/api/shipments` | 🟢 LOW | ✅ Done |
| 2 | Tạo vận đơn | POST | `/api/shipments` | 🟢 LOW | ✅ Done |
| 3 | Chi tiết vận đơn | GET | `/api/shipments/:id` | 🟢 LOW | ✅ Done |
| 4 | Sửa vận đơn | PUT | `/api/shipments/:id` | 🟢 LOW | ✅ Done |
| 5 | Xóa vận đơn | DELETE | `/api/shipments/:id` | 🟢 LOW | ✅ Done |
| 6 | Cập nhật trạng thái | PATCH | `/api/shipments/:id/status` | 🟢 LOW | ✅ Done |
| 7 | DS trạng thái vận đơn | GET | `/api/shipments/statuses` | 🟢 LOW | ✅ Done (bonus) |
| 8 | DS đơn vị vận chuyển | GET | `/api/shipments/shippers` | 🟢 LOW | ✅ Done (bonus) |

---

### ✅ Module 16: Orders Enhancement (4 APIs) - DONE

> **Frontend:** `OrderLookup.vue`, `Order_Returns.vue`
> **Service:** ✅ Bổ sung vào `orderService.js`

| STT | Chức năng | Method | Endpoint | Priority | Trạng thái |
|-----|-----------|--------|----------|----------|------------|
| 1 | Hoàn trả đơn hàng | POST | `/api/orders/:id/return` | 🔴 HIGH | ✅ Done |
| 2 | In hóa đơn | GET | `/api/orders/:id/invoice` | 🟡 MEDIUM | ✅ Done |
| 3 | DS đơn trả hàng | GET | `/api/orders/returns` | 🟡 MEDIUM | ✅ Done |
| 4 | Chi tiết đơn trả | GET | `/api/orders/returns/:id` | 🟢 LOW | ✅ Done (dùng /:id) |

---

### ✅ Module 17: Staff Reports - Báo cáo cuối ngày (5 APIs) - DONE

> **Frontend:** `EndOfDay.vue`
> **Service:** ✅ `reportService.js` đã tạo

| STT | Chức năng | Method | Endpoint | Priority | Trạng thái |
|-----|-----------|--------|----------|----------|------------|
| 1 | Doanh thu theo ngày | GET | `/api/reports/daily` | 🟡 MEDIUM | ✅ Done |
| 2 | Thống kê thực thu | GET | `/api/reports/actual-revenue` | 🟡 MEDIUM | ✅ Done |
| 3 | DS sản phẩm đã bán | GET | `/api/reports/sold-products` | 🟡 MEDIUM | ✅ Done |
| 4 | In báo cáo cuối ngày | GET | `/api/reports/daily/print` | 🟢 LOW | ✅ Done |
| 5 | DS nhân viên lọc báo cáo | GET | `/api/reports/staff` | 🟢 LOW | ✅ Done (bonus) |

**Query Params:**
```
?from=2026-01-01&to=2026-01-31&staff_id=1&store_id=1
```

---

### ✅ Module 18: Inventory Lookup - Tra cứu tồn kho (2 APIs) - DONE

> **Frontend:** `InventoryLookup.vue`, `InventoryLookupDetail.vue`
> **Service:** ✅ Thêm vào `inventoryService.js`

| STT | Chức năng | Method | Endpoint | Priority | Trạng thái |
|-----|-----------|--------|----------|----------|------------|
| 1 | Tìm kiếm SP tồn kho | GET | `/api/inventory/lookup/search` | 🟡 MEDIUM | ✅ Done |
| 2 | Chi tiết tồn theo chi nhánh | GET | `/api/inventory/lookup/:productId` | 🟡 MEDIUM | ✅ Done |

> **Đề xuất:** Có thể dùng chung với `/api/inventories?search=xxx` đã có

---

### ✅ Module 19: POS Payment - Thanh toán POS (10 APIs) - DONE

> **Frontend:** `Pos.vue`, `PaymentDrawer.vue`, `Checkouts.vue`
> **Service:** ✅ `posService.js` đã tạo

| STT | Chức năng | Method | Endpoint | Priority | Trạng thái |
|-----|-----------|--------|----------|----------|------------|
| 1 | Xử lý thanh toán | POST | `/api/pos/checkout` | 🔴 HIGH | ✅ Done |
| 2 | Tìm sản phẩm nhanh (barcode/SKU) | GET | `/api/pos/products/search` | 🔴 HIGH | ✅ Done |
| 3 | Lấy giá SP theo store | GET | `/api/pos/products/:id/price` | 🔴 HIGH | ✅ Done |
| 4 | Lưu đơn tạm (draft) | POST | `/api/pos/orders/draft` | 🟡 MEDIUM | ✅ Done |
| 5 | Danh sách đơn tạm | GET | `/api/pos/orders/drafts` | 🟡 MEDIUM | ✅ Done |
| 6 | Chi tiết đơn tạm | GET | `/api/pos/orders/drafts/:id` | 🟢 LOW | ✅ Done (bonus) |
| 7 | Xóa đơn tạm | DELETE | `/api/pos/orders/draft/:id` | 🟢 LOW | ✅ Done |
| 8 | In hóa đơn POS | GET | `/api/pos/orders/:id/receipt` | 🟡 MEDIUM | ✅ Done |
| 9 | Kiểm tra mã giảm giá | POST | `/api/pos/discounts/validate` | 🟡 MEDIUM | ✅ Done |
| 10 | DS phương thức thanh toán | GET | `/api/pos/payment-methods` | 🟢 LOW | ✅ Done (bonus) |

**POST /api/pos/checkout Body:**
```json
{
  "store_id": 1,
  "customer_id": null,
  "items": [
    { "variant_id": 1, "quantity": 2, "unit_price": 50000 }
  ],
  "subtotal": 100000,
  "discount_amount": 10000,
  "discount_code": "SALE10",
  "payment_method": "cash",
  "amount_received": 100000,
  "change": 10000,
  "notes": "Ghi chú"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 123,
    "order_code": "ORD-260131-00001",
    "receipt_url": "/api/pos/orders/123/receipt"
  }
}
```

---

### 🟡 Module 20: Bank Account - Tài khoản ngân hàng (5 APIs)

> **Frontend:** `PaymentDrawer.vue` (Thiết lập tài khoản thụ hưởng)
> **Service:** Cần tạo `bankAccountService.js`

| STT | Chức năng | Method | Endpoint | Priority | Trạng thái |
|-----|-----------|--------|----------|----------|------------|
| 1 | DS tài khoản NH | GET | `/api/bank-accounts` | 🟡 MEDIUM | ⏳ TODO |
| 2 | Thêm tài khoản NH | POST | `/api/bank-accounts` | � MEDIUM | ⏳ TODO |
| 3 | Sửa tài khoản NH | PUT | `/api/bank-accounts/:id` | 🟢 LOW | ⏳ TODO |
| 4 | Xóa tài khoản NH | DELETE | `/api/bank-accounts/:id` | 🟢 LOW | ⏳ TODO |
| 5 | Tạo mã QR thanh toán | GET | `/api/bank-accounts/:id/qr` | 🟡 MEDIUM | ⏳ TODO |

---

### ✅ Module 21: Checkouts - Đơn chưa hoàn tất (4 APIs) - DONE

> **Frontend:** `Checkouts.vue`
> **Service:** ✅ `checkoutService.js` đã tạo

| STT | Chức năng | Method | Endpoint | Priority | Trạng thái |
|-----|-----------|--------|----------|----------|------------|
| 1 | DS đơn chưa hoàn tất | GET | `/api/checkouts` | 🟢 LOW | ✅ Done |
| 2 | Chi tiết đơn | GET | `/api/checkouts/:id` | 🟢 LOW | ✅ Done |
| 3 | Gửi link thanh toán | POST | `/api/checkouts/:id/send-link` | 🟢 LOW | ✅ Done |
| 4 | Gửi email hàng loạt | POST | `/api/checkouts/mass-email` | 🟢 LOW | ✅ Done |

---

## �📊 PHẦN 3: THỐNG KÊ THEO PRIORITY

| Priority | Số APIs | Modules | Ghi chú |
|----------|---------|---------|---------|
| 🔴 HIGH | 14 | Customers (5), Suppliers (2), Orders (1), POS (3), Payment (3) | Cần làm ngay |
| 🟡 MEDIUM | 27 | POS (4), Bank (3), Discounts (3), Transactions (3), Reports (4), Others | Quan trọng |
| 🟢 LOW | 20 | Shipments (6), Checkouts (4), Discounts (4), Others | Làm sau |

---

## 🎯 PHẦN 4: THỨ TỰ TRIỂN KHAI

### 🔴 Giai đoạn 1: Core POS (Tuần 1)
**Mục tiêu:** Nhân viên có thể bán hàng, quản lý khách

| Module | APIs | Mô tả |
|--------|------|-------|
| Customers | 5 HIGH + 2 MEDIUM | Quản lý khách hàng |
| Orders Enhancement | 1 HIGH + 1 MEDIUM | Hoàn trả, in hóa đơn |
| Suppliers | 2 HIGH | Quản lý NCC cơ bản |
| POS Payment | 3 HIGH | Checkout, tìm SP, lấy giá |

**Tổng: 14 APIs**

### 🟡 Giai đoạn 2: Quản lý & Báo cáo (Tuần 2)
**Mục tiêu:** Hoàn thiện quy trình, báo cáo cuối ngày

| Module | APIs | Mô tả |
|--------|------|-------|
| Suppliers | 3 còn lại | Hoàn thiện NCC |
| Staff Reports | 4 | Báo cáo cuối ngày |
| Orders Enhancement | 2 còn lại | DS trả hàng |
| Discounts | 3 MEDIUM | Khuyến mại cơ bản |

**Tổng: 12 APIs**

### 🟢 Giai đoạn 3: Tính năng bổ sung (Tuần 3-4)
**Mục tiêu:** Hoàn thiện hệ thống

| Module | APIs | Mô tả |
|--------|------|-------|
| Discounts | 4 LOW | Hoàn thiện khuyến mại |
| Transactions | 6 | Sổ quỹ |
| Shipments | 6 | Vận chuyển |
| Inventory Lookup | 2 | Tra cứu tồn kho |

**Tổng: 18 APIs**

---

## 📁 PHẦN 5: SERVICE FILES CẦN XỬ LÝ

| File | Trạng thái | Hành động |
|------|------------|-----------|
| `customerService.js` | ❌ Chưa có | **Tạo mới** |
| `discountService.js` | ❌ Chưa có | **Tạo mới** |
| `supplierService.js` | ✅ Có code | Backend cần implement |
| `cashbookService.js` | ❌ Trống | **Implement** |
| `shipmentService.js` | ❌ Trống | Implement sau |
| `salesService.js` | ❌ Trống | **Xóa** (không dùng) |
| `customerGroupService.js` | ❌ Trống | Gộp vào customerService |
| `inventoryLookupService.js` | ✅ Có code | Backend cần implement |
| `reportService.js` | ⚠️ Thiếu | Bổ sung APIs |

---

## 🗄️ DATABASE TABLES

### Tables đã có
```sql
-- Dimensions
dim_users, dim_products, dim_product_variants, dim_product_images
dim_stores, dim_time

-- Sub-dimensions  
subdim_roles, subdim_categories, subdim_brands, subdim_units

-- Facts
fact_orders, fact_order_items
fact_inventory_stocks, fact_inventory_transactions
```

### Tables cần tạo
```sql
-- Customers
dim_customers              -- Khách hàng
subdim_customer_groups     -- Nhóm khách hàng

-- Suppliers
dim_suppliers              -- Nhà cung cấp

-- Discounts
dim_discounts              -- Khuyến mại

-- Transactions
fact_transactions          -- Sổ quỹ (phiếu thu/chi)

-- Shipments (optional)
fact_shipments             -- Vận đơn

-- Order Returns
fact_order_returns         -- Đơn trả hàng
```

---

## 📝 GHI CHÚ

- **Cập nhật:** 31/01/2026
- **Tham khảo:** `API.md` (67 APIs đã có), `API_ANALYSIS.md` (phân tích chi tiết)
- **Backend hoàn thành:** Module 1-10 (67 APIs)
- **Frontend đang dùng mock data:** CustomerList, Suppliers, Discounts, Fundbook, Shipments

---

## 🚀 QUICK START

### APIs cần làm đầu tiên (Bán hàng được):

```javascript
// 1. Khách hàng - Quan trọng nhất cho POS
GET  /api/customers              // Danh sách
GET  /api/customers/search?q=xxx // Tìm nhanh cho POS
POST /api/customers              // Thêm mới
GET  /api/customer-groups        // Nhóm KH

// 2. Nhà cung cấp - Quản lý kho
GET  /api/suppliers              // Danh sách
POST /api/suppliers              // Thêm mới

// 3. Orders mở rộng
POST /api/orders/:id/return      // Hoàn trả
GET  /api/orders/:id/invoice     // In hóa đơn
```

### Response Format chuẩn:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

**Tổng kết:**
- ✅ Đã có: 67 APIs (10 modules)
- ⏳ Cần làm: 44 APIs (8 modules)
- 🎯 Ưu tiên: Customers → Suppliers → Orders Enhancement → Staff Reports
