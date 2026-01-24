## 📊 TỔNG QUAN

| Tổng số Module | Tổng số API | Tổng số Tables |
|----------------|-------------|----------------|
| 14 modules | ~95 APIs | ~20 tables |

---

## 👤 THÀNH VIÊN 1: Authentication & Quản lý người dùng

### Module 1: Authentication (Xác thực)
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Đăng nhập | POST | `/api/auth/login` | ✅ Đã có |
| 2 | Đăng xuất | POST | `/api/auth/logout` | ✅ Đã có |
| 3 | Refresh token | POST | `/api/auth/refresh` | ✅ Đã có |
| 4 | Lấy danh sách roles | GET | `/api/auth/roles` | ✅ Đã có |

> ⚠️ **Ghi chú:** API `POST /api/auth/register` đã bỏ - Chỉ Admin mới có quyền tạo tài khoản qua Staff Management

### Module 2: Quản lý tài khoản cá nhân (Profile)
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Xem thông tin cá nhân | GET | `/api/users/profile` | ✅ Đã có |
| 2 | Cập nhật thông tin cá nhân | PUT | `/api/users/profile` | ✅ Đã có |
| 3 | Đổi mật khẩu | PUT | `/api/users/change-password` | ✅ Đã có |
| 4 | Upload avatar | POST | `/api/users/avatar` | ✅ Đã có |
| 5 | Xóa avatar | DELETE | `/api/users/avatar` | ✅ Đã có |

### Module 3: Quản lý nhân viên (Staff) - *Admin Only*
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách nhân viên | GET | `/api/staff` | ✅ Đã có |
| 2 | Thêm nhân viên | POST | `/api/staff` | ✅ Đã có |
| 3 | Chi tiết nhân viên | GET | `/api/staff/:id` | ✅ Đã có |
| 4 | Sửa nhân viên | PUT | `/api/staff/:id` | ✅ Đã có |
| 5 | Xóa nhân viên | DELETE | `/api/staff/:id` | ✅ Đã có |
| 6 | Phân quyền nhân viên | PUT | `/api/staff/:id/role` | ✅ Đã có |

### Database Tables:
```
- dim_users (users)
- subdim_roles (roles)
```

### 📈 Tổng kết Thành viên 1:
- **Số API:** 15 APIs
- **Số Tables:** 2


---

## 👤 THÀNH VIÊN 2: Sản phẩm & Quản lý kho

### Module 4: Sản phẩm (Products)
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách sản phẩm | GET | `/api/products` | ✅ Đã có |
| 2 | Thêm sản phẩm | POST | `/api/products` | ✅ Đã có |
| 3 | Chi tiết sản phẩm | GET | `/api/products/:id` | ✅ Đã có |
| 4 | Sửa sản phẩm | PUT | `/api/products/:id` | ✅ Đã có |
| 5 | Xóa sản phẩm | DELETE | `/api/products/:id` | ✅ Đã có |
| 6 | Bật/tắt trạng thái hàng loạt | PATCH | `/api/products/bulk-status` | ✅ Đã có |
| 7 | Import sản phẩm từ CSV | POST | `/api/products/import` | ✅ Đã có |
| 8 | Export sản phẩm ra CSV | GET | `/api/products/export` | ✅ Đã có |
| 9 | Danh sách thương hiệu | GET | `/api/brands` | ✅ Đã có |
| 10 | Danh sách đơn vị tính | GET | `/api/units` | ✅ Đã có |

> 📝 **Query Parameters cho GET /api/products:**
> - `search` - Tìm theo tên/mã sản phẩm
> - `category_id` - Lọc theo danh mục
> - `brand_id` - Lọc theo thương hiệu
> - `is_active` - Lọc theo trạng thái
> - `page`, `limit` - Phân trang

### Module 5: Danh mục sản phẩm (Collections)
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách danh mục | GET | `/api/collections` | ✅ Đã có |
| 2 | Cây danh mục (Tree View) | GET | `/api/collections/tree` | ✅ Đã có |
| 3 | Thêm danh mục | POST | `/api/collections` | ✅ Đã có |
| 4 | Chi tiết danh mục | GET | `/api/collections/:id` | ✅ Đã có |
| 5 | Sửa danh mục | PUT | `/api/collections/:id` | ✅ Đã có |
| 6 | Xóa danh mục | DELETE | `/api/collections/:id` | ✅ Đã có |

### Module 6: Bảng giá (Catalogs) - *Chưa triển khai backend*
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách bảng giá | GET | `/api/catalogs` | ⏳ Cần làm |
| 2 | Thêm bảng giá | POST | `/api/catalogs` | ⏳ Cần làm |
| 3 | Chi tiết bảng giá | GET | `/api/catalogs/:id` | ⏳ Cần làm |
| 4 | Sửa bảng giá | PUT | `/api/catalogs/:id` | ⏳ Cần làm |
| 5 | Xóa bảng giá | DELETE | `/api/catalogs/:id` | ⏳ Cần làm |

### Module 7: Quản lý kho (Inventory) - *Chưa triển khai backend*
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách tồn kho | GET | `/api/inventories` | ⏳ Cần làm |
| 2 | Chi tiết tồn kho | GET | `/api/inventories/:id` | ⏳ Cần làm |
| 3 | Cập nhật số lượng tồn | PUT | `/api/inventories/:id` | ⏳ Cần làm |
| 4 | Lịch sử xuất nhập kho | GET | `/api/inventories/:id/history` | ⏳ Cần làm |
| 5 | Danh sách đơn đặt hàng nhập | GET | `/api/purchase-orders` | ⏳ Cần làm |
| 6 | Tạo đơn đặt hàng nhập | POST | `/api/purchase-orders` | ⏳ Cần làm |
| 7 | Chi tiết đơn nhập | GET | `/api/purchase-orders/:id` | ⏳ Cần làm |
| 8 | Cập nhật đơn nhập | PUT | `/api/purchase-orders/:id` | ⏳ Cần làm |

### Database Tables:
```
- dim_products (sản phẩm)
- dim_product_variants (biến thể sản phẩm: SKU, barcode, giá)
- subdim_categories (danh mục/collections)
- subdim_brands (thương hiệu)
- subdim_units (đơn vị tính)
- fact_inventory (tồn kho) - Chưa có
- fact_purchase_orders (đơn nhập hàng) - Chưa có
```

### 📈 Tổng kết Thành viên 2:
- **Số API đã có:** 16 APIs (Module 4 + 5)
- **Số API cần làm:** 13 APIs (Module 6 + 7)
- **Số Tables:** 5 (đã có)

---

## 👤 THÀNH VIÊN 3: Đơn hàng & Khách hàng & Khuyến mại

### Module 8: Đơn hàng (Orders) - *Chưa triển khai backend*
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách đơn hàng | GET | `/api/orders` | ⏳ Cần làm |
| 2 | Tạo đơn hàng | POST | `/api/orders` | ⏳ Cần làm |
| 3 | Chi tiết đơn hàng | GET | `/api/orders/:id` | ⏳ Cần làm |
| 4 | Sửa đơn hàng | PUT | `/api/orders/:id` | ⏳ Cần làm |
| 5 | Xóa đơn hàng | DELETE | `/api/orders/:id` | ⏳ Cần làm |
| 6 | Cập nhật trạng thái | PATCH | `/api/orders/:id/status` | ⏳ Cần làm |
| 7 | Trả hàng | POST | `/api/orders/:id/return` | ⏳ Cần làm |

> 📝 **Query Parameters cho GET /api/orders:**
> - `search` - Tìm theo mã đơn
> - `status` - Lọc theo trạng thái (draft, checkout, completed, cancelled)
> - `from`, `to` - Lọc theo ngày
> - `page`, `limit` - Phân trang

### Module 9: Khách hàng (Customers) - *Chưa triển khai backend*
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách khách hàng | GET | `/api/customers` | ⏳ Cần làm |
| 2 | Thêm khách hàng | POST | `/api/customers` | ⏳ Cần làm |
| 3 | Chi tiết khách hàng | GET | `/api/customers/:id` | ⏳ Cần làm |
| 4 | Sửa khách hàng | PUT | `/api/customers/:id` | ⏳ Cần làm |
| 5 | Xóa khách hàng | DELETE | `/api/customers/:id` | ⏳ Cần làm |
| 6 | Danh sách nhóm khách hàng | GET | `/api/customer-groups` | ⏳ Cần làm |
| 7 | Thêm nhóm khách hàng | POST | `/api/customer-groups` | ⏳ Cần làm |
| 8 | Sửa nhóm khách hàng | PUT | `/api/customer-groups/:id` | ⏳ Cần làm |
| 9 | Xóa nhóm khách hàng | DELETE | `/api/customer-groups/:id` | ⏳ Cần làm |

### Module 10: Khuyến mại (Discounts) - *Chưa triển khai backend*
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách khuyến mại | GET | `/api/discounts` | ⏳ Cần làm |
| 2 | Tạo khuyến mại | POST | `/api/discounts` | ⏳ Cần làm |
| 3 | Chi tiết khuyến mại | GET | `/api/discounts/:id` | ⏳ Cần làm |
| 4 | Sửa khuyến mại | PUT | `/api/discounts/:id` | ⏳ Cần làm |
| 5 | Xóa khuyến mại | DELETE | `/api/discounts/:id` | ⏳ Cần làm |
| 6 | Kết thúc khuyến mại | PATCH | `/api/discounts/:id/deactivate` | ⏳ Cần làm |
| 7 | Kiểm tra mã khuyến mại | POST | `/api/discounts/validate` | ⏳ Cần làm |

### Database Tables (cần tạo):
```
- dim_customers (khách hàng)
- subdim_customer_groups (nhóm khách hàng)
- fact_orders (đơn hàng)
- fact_order_items (chi tiết đơn hàng)
- fact_order_returns (trả hàng)
- dim_discounts (khuyến mại)
```

### 📈 Tổng kết Thành viên 3:
- **Số API cần làm:** 23 APIs
- **Số Tables cần tạo:** 6


---

## 👤 THÀNH VIÊN 4: Nhà cung cấp & Vận chuyển & Sổ quỹ & Báo cáo

### Module 11: Nhà cung cấp (Suppliers) - *Chưa triển khai backend*
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách nhà cung cấp | GET | `/api/suppliers` | ⏳ Cần làm |
| 2 | Thêm nhà cung cấp | POST | `/api/suppliers` | ⏳ Cần làm |
| 3 | Chi tiết nhà cung cấp | GET | `/api/suppliers/:id` | ⏳ Cần làm |
| 4 | Sửa nhà cung cấp | PUT | `/api/suppliers/:id` | ⏳ Cần làm |
| 5 | Xóa nhà cung cấp | DELETE | `/api/suppliers/:id` | ⏳ Cần làm |
| 6 | Trả hàng cho NCC | POST | `/api/suppliers/returns` | ⏳ Cần làm |

### Module 12: Vận chuyển (Shipments) - *Chưa triển khai backend*
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách vận đơn | GET | `/api/shipments` | ⏳ Cần làm |
| 2 | Tạo vận đơn | POST | `/api/shipments` | ⏳ Cần làm |
| 3 | Chi tiết vận đơn | GET | `/api/shipments/:id` | ⏳ Cần làm |
| 4 | Sửa vận đơn | PUT | `/api/shipments/:id` | ⏳ Cần làm |
| 5 | Xóa vận đơn | DELETE | `/api/shipments/:id` | ⏳ Cần làm |
| 6 | Cập nhật trạng thái | PATCH | `/api/shipments/:id/status` | ⏳ Cần làm |

### Module 13: Sổ quỹ (Cashbook/Transactions) - *Chưa triển khai backend*
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Danh sách giao dịch | GET | `/api/transactions` | ⏳ Cần làm |
| 2 | Thêm phiếu thu/chi | POST | `/api/transactions` | ⏳ Cần làm |
| 3 | Chi tiết giao dịch | GET | `/api/transactions/:id` | ⏳ Cần làm |
| 4 | Sửa giao dịch | PUT | `/api/transactions/:id` | ⏳ Cần làm |
| 5 | Xóa giao dịch | DELETE | `/api/transactions/:id` | ⏳ Cần làm |
| 6 | Thống kê tồn quỹ | GET | `/api/transactions/summary` | ⏳ Cần làm |

### Module 14: Báo cáo (Reports) - *Chưa triển khai backend*
| STT | Chức năng | Method | Endpoint | Trạng thái |
|-----|-----------|--------|----------|------------|
| 1 | Tổng quan dashboard | GET | `/api/reports/overview` | ⏳ Cần làm |
| 2 | Biểu đồ doanh thu | GET | `/api/reports/revenue` | ⏳ Cần làm |
| 3 | Top sản phẩm bán chạy | GET | `/api/reports/top-products` | ⏳ Cần làm |
| 4 | Phân loại kênh bán hàng | GET | `/api/reports/sales-channels` | ⏳ Cần làm |
| 5 | Top khách hàng chi tiêu | GET | `/api/reports/top-customers` | ⏳ Cần làm |
| 6 | Sản phẩm sắp hết hàng | GET | `/api/reports/low-stock` | ⏳ Cần làm |
| 7 | Danh sách báo cáo | GET | `/api/reports` | ⏳ Cần làm |

### Database Tables (cần tạo):
```
- dim_suppliers (nhà cung cấp)
- fact_supplier_returns (trả hàng NCC)
- fact_shipments (vận đơn)
- fact_transactions (sổ quỹ/giao dịch)
```

### 📈 Tổng kết Thành viên 4:
- **Số API cần làm:** 25 APIs
- **Số Tables cần tạo:** 4

---

## 📊 TỔNG KẾT TOÀN BỘ DỰ ÁN

### Trạng thái triển khai

| Module | Tên | Số API | Trạng thái |
|--------|-----|--------|------------|
| 1 | Authentication | 4 | ✅ Hoàn thành |
| 2 | Profile | 5 | ✅ Hoàn thành |
| 3 | Staff | 6 | ✅ Hoàn thành |
| 4 | Products | 10 | ✅ Hoàn thành |
| 5 | Collections | 6 | ✅ Hoàn thành |
| 6 | Catalogs | 5 | ⏳ Chưa làm |
| 7 | Inventory | 8 | ⏳ Chưa làm |
| 8 | Orders | 7 | ⏳ Chưa làm |
| 9 | Customers | 9 | ⏳ Chưa làm |
| 10 | Discounts | 7 | ⏳ Chưa làm |
| 11 | Suppliers | 6 | ⏳ Chưa làm |
| 12 | Shipments | 6 | ⏳ Chưa làm |
| 13 | Transactions | 6 | ⏳ Chưa làm |
| 14 | Reports | 7 | ⏳ Chưa làm |

### Thống kê tổng

| Hạng mục | Đã có | Cần làm | Tổng |
|----------|-------|---------|------|
| **APIs** | 31 | 61 | 92 |
| **Tables** | 7 | 10 | 17 |

---

## 🎯 API ƯU TIÊN CẦN LÀM NGAY (Cho Dashboard & Frontend)

### 🏠 APIs cho trang Home/Dashboard

Frontend hiện tại có **2 trang Dashboard**:
1. `DashboardOverview.vue` - Trang chào mừng đơn giản
2. `Reports/Reports.vue` - Trang tổng quan chi tiết với biểu đồ

#### API 1: Tổng quan Dashboard
**Endpoint:** `GET /api/dashboard/overview`

**Mô tả:** Lấy các số liệu thống kê tổng quan cho trang Home

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 120,
    "totalProducts": 58,
    "totalCustomers": 34,
    "recentOrders": [
      {
        "id": 1,
        "code": "DH001",
        "customerName": "Nguyễn Văn A",
        "createdAt": "2024-06-01",
        "status": "completed",
        "totalAmount": 1200000
      }
    ]
  }
}
```

---

#### API 2: Thống kê báo cáo (Reports Page)
**Endpoint:** `GET /api/dashboard/stats`

**Query Params:** `?from=2026-01-01&to=2026-01-23`

**Mô tả:** Lấy các số liệu thống kê cho trang Reports

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 156820000,
    "revenueChange": 12.5,
    "totalOrders": 1240,
    "ordersChange": 8.2,
    "avgOrderValue": 126467,
    "avgOrderChange": 4.1,
    "newCustomers": 82,
    "customersChange": -5.5
  }
}
```

---

#### API 3: Biểu đồ doanh thu
**Endpoint:** `GET /api/dashboard/revenue-chart`

**Query Params:** `?from=2026-01-01&to=2026-01-23&groupBy=day`

**Mô tả:** Dữ liệu cho biểu đồ line doanh thu

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "labels": ["01/01", "02/01", "03/01", "04/01", "05/01"],
    "datasets": [
      {
        "label": "Doanh thu",
        "data": [5200000, 4800000, 6100000, 5500000, 7200000]
      }
    ]
  }
}
```

---

#### API 4: Top sản phẩm bán chạy
**Endpoint:** `GET /api/dashboard/top-products`

**Query Params:** `?limit=5&from=2026-01-01&to=2026-01-23`

**Mô tả:** Top N sản phẩm bán chạy nhất (cho bar chart)

**Response mẫu:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Mì Hảo Hảo", "quantity": 1200 },
    { "id": 2, "name": "Trứng gà", "quantity": 950 },
    { "id": 3, "name": "Bột ngọt Ajinomoto", "quantity": 800 },
    { "id": 4, "name": "Dầu ăn Tường An", "quantity": 700 },
    { "id": 5, "name": "Nước mắm Nam Ngư", "quantity": 600 }
  ]
}
```

---

#### API 5: Phân loại kênh bán hàng
**Endpoint:** `GET /api/dashboard/sales-channels`

**Query Params:** `?from=2026-01-01&to=2026-01-23`

**Mô tả:** Phân loại doanh thu theo kênh bán (cho pie/doughnut chart)

**Response mẫu:**
```json
{
  "success": true,
  "data": [
    { "channel": "Tại cửa hàng", "percentage": 45, "revenue": 70569000 },
    { "channel": "Giao hàng", "percentage": 25, "revenue": 39205000 },
    { "channel": "ShopeeFood", "percentage": 20, "revenue": 31364000 },
    { "channel": "GrabMart", "percentage": 10, "revenue": 15682000 }
  ]
}
```

---

#### API 6: Top khách hàng chi tiêu
**Endpoint:** `GET /api/dashboard/top-customers`

**Query Params:** `?limit=5&from=2026-01-01&to=2026-01-23`

**Mô tả:** Top N khách hàng chi tiêu nhiều nhất

**Response mẫu:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Trần Văn An", "totalSpent": 15600000, "avatarUrl": "" },
    { "id": 2, "name": "Nguyễn Thị Bình", "totalSpent": 8250000, "avatarUrl": "https://..." },
    { "id": 3, "name": "Đỗ Ngọc Giang", "totalSpent": 5400000, "avatarUrl": "https://..." }
  ]
}
```

---

#### API 7: Sản phẩm sắp hết hàng
**Endpoint:** `GET /api/dashboard/low-stock`

**Query Params:** `?threshold=20&limit=10`

**Mô tả:** Danh sách sản phẩm có số lượng tồn kho thấp

**Response mẫu:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Trứng gà 10 quả", "stock": 0, "imageUrl": "https://..." },
    { "id": 2, "name": "Bột ngọt Ajinomoto", "stock": 8, "imageUrl": "https://..." },
    { "id": 3, "name": "Mì Hảo Hảo", "stock": 15, "imageUrl": "https://..." }
  ]
}
```

---

### 📋 Tóm tắt Dashboard APIs

| STT | API | Method | Endpoint | Mô tả |
|-----|-----|--------|----------|-------|
| 1 | Tổng quan Home | GET | `/api/dashboard/overview` | Số liệu cho DashboardOverview.vue |
| 2 | Thống kê Reports | GET | `/api/dashboard/stats` | 4 thẻ số liệu trên Reports.vue |
| 3 | Biểu đồ doanh thu | GET | `/api/dashboard/revenue-chart` | Line chart doanh thu |
| 4 | Top sản phẩm | GET | `/api/dashboard/top-products` | Bar chart sản phẩm bán chạy |
| 5 | Kênh bán hàng | GET | `/api/dashboard/sales-channels` | Pie chart phân loại kênh |
| 6 | Top khách hàng | GET | `/api/dashboard/top-customers` | Danh sách KH chi tiêu nhiều |
| 7 | Sắp hết hàng | GET | `/api/dashboard/low-stock` | Danh sách SP tồn kho thấp |

**Tổng: 7 APIs cho Dashboard**

---

## 📝 GHI CHÚ

- **Cập nhật:** 23/01/2026
- **Backend modules đã hoàn thành:** 1-5 (Auth, Profile, Staff, Products, Collections)
- **Frontend đang sử dụng mock data** cho các module chưa có API
- **Ưu tiên tiếp theo:** Dashboard/Reports APIs để hiển thị dữ liệu thực trên trang tổng quan