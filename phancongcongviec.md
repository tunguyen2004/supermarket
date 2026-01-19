
Trang
1
/
1
100%
# 📋 PHÂN CÔNG CÔNG VIỆC - DỰ ÁN SUPERMARKET

## 👥 Nhóm: 4 thành viên | Môn học: 3 tín chỉ

---

## 📊 TỔNG QUAN

| Tổng số Module | Tổng số API | Tổng số Tables |
|----------------|-------------|----------------|
| 13 modules | ~92 APIs | ~20 tables |

---

## 👤 THÀNH VIÊN 1: Authentication & Quản lý người dùng

### Module 1: Authentication (Xác thực)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Đăng nhập | POST | `/api/auth/login` |
| 2 | Đăng ký | POST | `/api/auth/register` |
| 3 | Đăng xuất | POST | `/api/auth/logout` |
| 4 | Refresh token | POST | `/api/auth/refresh` |
| 5 | Lấy thông tin user đang đăng nhập | GET | `/api/auth/me` |

### Module 2: Quản lý tài khoản cá nhân (Profile)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Xem thông tin cá nhân | GET | `/api/users/profile` |
| 2 | Cập nhật thông tin cá nhân | PUT | `/api/users/profile` |
| 3 | Đổi mật khẩu | PUT | `/api/users/change-password` |
| 4 | Upload avatar | POST | `/api/users/avatar` |

### Module 3: Quản lý nhân viên (Staff) - *Bổ sung*
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Danh sách nhân viên | GET | `/api/staff` |
| 2 | Thêm nhân viên | POST | `/api/staff` |
| 3 | Chi tiết nhân viên | GET | `/api/staff/:id` |
| 4 | Sửa nhân viên | PUT | `/api/staff/:id` |
| 5 | Xóa nhân viên | DELETE | `/api/staff/:id` |
| 6 | Phân quyền nhân viên | PUT | `/api/staff/:id/role` |

### Database Tables:
```
- users
- roles
- permissions
- staff
```

### 📈 Tổng kết Thành viên 1:
- **Số API:** 15
- **Số Tables:** 4


---

## 👤 THÀNH VIÊN 2: Sản phẩm & Quản lý kho

### Module 4: Sản phẩm (Products)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Danh sách sản phẩm | GET | `/api/products` |
| 2 | Thêm sản phẩm | POST | `/api/products` |
| 3 | Chi tiết sản phẩm | GET | `/api/products/:id` |
| 4 | Sửa sản phẩm | PUT | `/api/products/:id` |
| 5 | Xóa sản phẩm | DELETE | `/api/products/:id` |
| 6 | Tìm kiếm sản phẩm | GET | `/api/products?search=` |
| 7 | Lọc theo loại | GET | `/api/products?type=` |
| 8 | Lọc theo nhãn hiệu | GET | `/api/products?brand=` |
| 9 | Bật/tắt trạng thái hàng loạt | PATCH | `/api/products/bulk-status` |
| 10 | Import sản phẩm từ CSV | POST | `/api/products/import` |
| 11 | Export sản phẩm ra CSV | GET | `/api/products/export` |

### Module 5: Danh mục sản phẩm (Collections)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Danh sách danh mục | GET | `/api/collections` |
| 2 | Thêm danh mục | POST | `/api/collections` |
| 3 | Chi tiết danh mục | GET | `/api/collections/:id` |
| 4 | Sửa danh mục | PUT | `/api/collections/:id` |
| 5 | Xóa danh mục | DELETE | `/api/collections/:id` |

### Module 6: Bảng giá (Catalogs)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Danh sách bảng giá | GET | `/api/catalogs` |
| 2 | Thêm bảng giá | POST | `/api/catalogs` |
| 3 | Chi tiết bảng giá | GET | `/api/catalogs/:id` |
| 4 | Sửa bảng giá | PUT | `/api/catalogs/:id` |
| 5 | Xóa bảng giá | DELETE | `/api/catalogs/:id` |

### Module 7: Quản lý kho (Inventory)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Danh sách tồn kho | GET | `/api/inventories` |
| 2 | Chi tiết tồn kho | GET | `/api/inventories/:id` |
| 3 | Cập nhật số lượng tồn | PUT | `/api/inventories/:id` |
| 4 | Nhập kho | POST | `/api/inventories/receive` |
| 5 | Chuyển kho | POST | `/api/inventories/transfer` |
| 6 | Lịch sử xuất nhập kho | GET | `/api/inventories/:id/history` |
| 7 | Danh sách đơn đặt hàng nhập | GET | `/api/purchase-orders` |
| 8 | Tạo đơn đặt hàng nhập | POST | `/api/purchase-orders` |
| 9 | Danh sách phiếu nhập hàng | GET | `/api/receive-inventories` |
| 10 | Tạo phiếu nhập hàng | POST | `/api/receive-inventories` |
| 11 | Danh sách chuyển kho | GET | `/api/stock-transfers` |
| 12 | Tạo phiếu chuyển kho | POST | `/api/stock-transfers` |

### Database Tables:
```
- products
- collections
- catalogs
- inventories
- inventory_logs
- purchase_orders
- stock_transfers
```

### 📈 Tổng kết Thành viên 2:
- **Số API:** 28
- **Số Tables:** 7

---

## 👤 THÀNH VIÊN 3: Đơn hàng & Khách hàng & Khuyến mại

### Module 8: Đơn hàng (Orders)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Danh sách đơn hàng | GET | `/api/orders` |
| 2 | Tạo đơn hàng | POST | `/api/orders` |
| 3 | Chi tiết đơn hàng | GET | `/api/orders/:id` |
| 4 | Sửa đơn hàng | PUT | `/api/orders/:id` |
| 5 | Xóa đơn hàng | DELETE | `/api/orders/:id` |
| 6 | Lọc theo trạng thái | GET | `/api/orders?status=` |
| 7 | Tìm kiếm đơn hàng | GET | `/api/orders?search=` |
| 8 | Lọc theo ngày | GET | `/api/orders?from=&to=` |
| 9 | Danh sách đơn nháp | GET | `/api/orders?status=draft` |
| 10 | Danh sách đơn chưa hoàn tất | GET | `/api/orders?status=checkout` |
| 11 | Trả hàng | POST | `/api/orders/:id/return` |
| 12 | Cập nhật trạng thái | PATCH | `/api/orders/:id/status` |

### Module 9: Khách hàng (Customers)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Danh sách khách hàng | GET | `/api/customers` |
| 2 | Thêm khách hàng | POST | `/api/customers` |
| 3 | Chi tiết khách hàng | GET | `/api/customers/:id` |
| 4 | Sửa khách hàng | PUT | `/api/customers/:id` |
| 5 | Xóa khách hàng | DELETE | `/api/customers/:id` |
| 6 | Tìm kiếm khách hàng | GET | `/api/customers?search=` |
| 7 | Lọc theo nhóm | GET | `/api/customers?group=` |
| 8 | Danh sách nhóm khách hàng | GET | `/api/customer-groups` |
| 9 | Thêm nhóm khách hàng | POST | `/api/customer-groups` |
| 10 | Sửa nhóm khách hàng | PUT | `/api/customer-groups/:id` |
| 11 | Xóa nhóm khách hàng | DELETE | `/api/customer-groups/:id` |

### Module 10: Khuyến mại (Discounts)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Danh sách khuyến mại | GET | `/api/discounts` |
| 2 | Tạo khuyến mại | POST | `/api/discounts` |
| 3 | Chi tiết khuyến mại | GET | `/api/discounts/:id` |
| 4 | Sửa khuyến mại | PUT | `/api/discounts/:id` |
| 5 | Xóa khuyến mại | DELETE | `/api/discounts/:id` |
| 6 | Kết thúc khuyến mại | PATCH | `/api/discounts/:id/deactivate` |
| 7 | Lọc theo trạng thái | GET | `/api/discounts?status=` |
| 8 | Kiểm tra mã khuyến mại | POST | `/api/discounts/validate` |

### Database Tables:
```
- orders
- order_items
- order_returns
- customers
- customer_groups
- discounts
- discount_rules
```

### 📈 Tổng kết Thành viên 3:
- **Số API:** 31
- **Số Tables:** 7


---

## 👤 THÀNH VIÊN 4: Nhà cung cấp & Vận chuyển & Sổ quỹ & Báo cáo

### Module 11: Nhà cung cấp (Suppliers)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Danh sách nhà cung cấp | GET | `/api/suppliers` |
| 2 | Thêm nhà cung cấp | POST | `/api/suppliers` |
| 3 | Chi tiết nhà cung cấp | GET | `/api/suppliers/:id` |
| 4 | Sửa nhà cung cấp | PUT | `/api/suppliers/:id` |
| 5 | Xóa nhà cung cấp | DELETE | `/api/suppliers/:id` |
| 6 | Danh sách trả hàng NCC | GET | `/api/supplier-returns` |
| 7 | Tạo phiếu trả hàng NCC | POST | `/api/supplier-returns` |

### Module 12: Vận chuyển (Shipments)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Danh sách vận đơn | GET | `/api/shipments` |
| 2 | Tạo vận đơn | POST | `/api/shipments` |
| 3 | Chi tiết vận đơn | GET | `/api/shipments/:id` |
| 4 | Sửa vận đơn | PUT | `/api/shipments/:id` |
| 5 | Xóa vận đơn | DELETE | `/api/shipments/:id` |
| 6 | Lọc theo trạng thái | GET | `/api/shipments?status=` |
| 7 | Lọc theo đối tác GH | GET | `/api/shipments?carrier=` |
| 8 | Import vận đơn | POST | `/api/shipments/import` |
| 9 | Export vận đơn | GET | `/api/shipments/export` |
| 10 | Báo cáo vận chuyển | GET | `/api/shipments/reports` |

### Module 13: Sổ quỹ (Cashbook/Transactions)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Danh sách giao dịch | GET | `/api/transactions` |
| 2 | Thêm phiếu thu/chi | POST | `/api/transactions` |
| 3 | Chi tiết giao dịch | GET | `/api/transactions/:id` |
| 4 | Sửa giao dịch | PUT | `/api/transactions/:id` |
| 5 | Xóa giao dịch | DELETE | `/api/transactions/:id` |
| 6 | Lọc theo loại (thu/chi) | GET | `/api/transactions?type=` |
| 7 | Lọc theo ngày | GET | `/api/transactions?from=&to=` |
| 8 | Thống kê tồn quỹ | GET | `/api/transactions/summary` |

### Module 14: Báo cáo (Reports)
| STT | Chức năng | Method | Endpoint |
|-----|-----------|--------|----------|
| 1 | Tổng quan dashboard | GET | `/api/reports/overview` |
| 2 | Biểu đồ doanh thu | GET | `/api/reports/revenue-chart` |
| 3 | Top sản phẩm bán chạy | GET | `/api/reports/top-products` |
| 4 | Phân loại kênh bán hàng | GET | `/api/reports/sales-channels` |
| 5 | Top khách hàng chi tiêu | GET | `/api/reports/top-customers` |
| 6 | Sản phẩm sắp hết hàng | GET | `/api/reports/low-stock` |
| 7 | Báo cáo doanh thu theo ngày | GET | `/api/reports/daily-revenue` |
| 8 | Danh sách báo cáo | GET | `/api/reports` |

### Database Tables:
```
- suppliers
- supplier_returns
- shipments
- transactions
```

### 📈 Tổng kết Thành viên 4:
- **Số API:** 33
- **Số Tables:** 4


---

## 📊 BẢNG TỔNG KẾT PHÂN CÔNG

| Thành viên | Modules | Số API | Số Tables 
|------------|---------|--------|-----------|
| **TV1** | Auth, Profile, Staff | 15 | 4 | 
| **TV2** | Products, Collections, Catalogs, Inventory | 28 | 7 | 
| **TV3** | Orders, Customers, Discounts | 31 | 7 | 
| **TV4** | Suppliers, Shipments, Cashbook, Reports | 33 | 4 | 
| **TỔNG** | **14 modules** | **107 APIs** | **22 tables** | |

---

## 🗄️ DATABASE SCHEMA TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION                          │
├─────────────────────────────────────────────────────────────┤
│ users, roles, permissions, staff                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTS & INVENTORY                    │
├─────────────────────────────────────────────────────────────┤
│ products, collections, catalogs                             │
│ inventories, inventory_logs                                 │
│ purchase_orders, stock_transfers                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     ORDERS & CUSTOMERS                      │
├─────────────────────────────────────────────────────────────┤
│ orders, order_items, order_returns                          │
│ customers, customer_groups                                  │
│ discounts, discount_rules                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     OPERATIONS                              │
├─────────────────────────────────────────────────────────────┤
│ suppliers, supplier_returns                                 │
│ shipments                                                   │
│ transactions                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST HOÀN THÀNH

### Giai đoạn 1: Setup (Tuần 1)
- [ ] Thiết kế Database Schema chi tiết
- [ ] Setup project Backend (chọn framework)
- [ ] Setup kết nối Database
- [ ] Tạo cấu trúc thư mục

### Giai đoạn 2: Development (Tuần 2-4)
- [ ] TV1: Hoàn thành Auth + Users + Staff
- [ ] TV2: Hoàn thành Products + Inventory
- [ ] TV3: Hoàn thành Orders + Customers + Discounts
- [ ] TV4: Hoàn thành Suppliers + Shipments + Cashbook + Reports

### Giai đoạn 3: Integration (Tuần 5)
- [ ] Kết nối Frontend với Backend
- [ ] Testing các API
- [ ] Fix bugs

### Giai đoạn 4: Hoàn thiện (Tuần 6)
- [ ] Viết báo cáo
- [ ] Chuẩn bị demo
- [ ] Deploy (nếu cần)

---

## 📝 GHI CHÚ

- Tất cả API đều cần xác thực JWT (trừ login/register)
- Response format thống nhất: `{ success: true, data: {...}, message: "..." }`
- Error format: `{ success: false, error: {...}, message: "..." }`
- Pagination: `?page=1&limit=10`
- Sort: `?sortBy=createdAt&order=desc`
Đang hiển thị PHAN_CONG_CONG_VIEC.md.