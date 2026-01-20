# Role-Based Access Control (RBAC) Documentation

## Hệ thống phân quyền rõ ràng

Hệ thống đã được cập nhật với middleware phân quyền rõ ràng. Chỉ những user với role phù hợp mới có thể truy cập các API nhất định.

**Lưu ý:** Để tìm hiểu thêm về tracking online/offline status, xem file `ONLINE_STATUS_GUIDE.md`

---

## Các Role (Vai Trò)

### 1. **Admin (role_id = 1)**
- **Mô tả**: Toàn quyền quản lý hệ thống
- **Quyền hạn**:
  - ✅ Quản lý nhân viên (thêm, sửa, xóa, phân quyền)
  - ✅ Quản lý sản phẩm (tạo, sửa, xóa, import/export)
  - ✅ Quản lý danh mục (tạo, sửa, xóa)
  - ✅ Quản lý đơn hàng
  - ✅ Xem báo cáo chi tiết
  - ✅ Quản lý cài đặt hệ thống

### 2. **Manager (role_id = 3)**
- **Mô tả**: Quản lý cấp trung
- **Quyền hạn**:
  - ❌ Không thể quản lý nhân viên
  - ✅ Quản lý sản phẩm (tạo, sửa, xóa, import/export)
  - ✅ Quản lý danh mục (tạo, sửa, xóa)
  - ✅ Quản lý tất cả đơn hàng
  - ✅ Xem báo cáo chi tiết

### 3. **Staff (role_id = 2)**
- **Mô tả**: Nhân viên thường - quyền cơ bản
- **Quyền hạn**:
  - ❌ Không thể quản lý nhân viên
  - ❌ Không thể tạo/sửa/xóa sản phẩm
  - ❌ Không thể tạo/sửa/xóa danh mục
  - ✅ Có thể xem danh sách sản phẩm
  - ✅ Có thể xem danh mục
  - ✅ Có thể tạo đơn hàng
  - ✅ Có thể xem đơn hàng của mình

---

## API Quyền Hạn

### ❌ Chỉ ADMIN có thể truy cập

```
GET    /api/staff               - Danh sách nhân viên
POST   /api/staff               - Thêm nhân viên mới
GET    /api/staff/:id           - Chi tiết nhân viên
PUT    /api/staff/:id           - Cập nhật nhân viên
DELETE /api/staff/:id           - Xóa nhân viên
PUT    /api/staff/:id/role      - Phân quyền nhân viên
```

**Lỗi khi truy cập không có quyền:**
```json
{
  "status": "ERROR",
  "message": "Forbidden: Admin access required",
  "requiredRole": "Admin",
  "userRole": "Staff"
}
```

---

### ❌ Chỉ MANAGER hoặc ADMIN có thể truy cập

#### Quản lý Sản phẩm
```
POST   /api/products             - Thêm sản phẩm mới
PUT    /api/products/:id         - Cập nhật sản phẩm
DELETE /api/products/:id         - Xóa sản phẩm
POST   /api/products/import      - Import sản phẩm từ CSV
PATCH  /api/products/bulk-status - Thay đổi trạng thái hàng loạt
```

#### Quản lý Danh mục
```
POST   /api/collections          - Thêm danh mục mới
PUT    /api/collections/:id      - Cập nhật danh mục
DELETE /api/collections/:id      - Xóa danh mục
```

**Lỗi khi truy cập không có quyền:**
```json
{
  "status": "ERROR",
  "message": "Forbidden: Manager or Admin access required",
  "requiredRole": "Manager or Admin",
  "userRole": "Staff"
}
```

---

### ✅ TẤT CẢ ROLE có thể truy cập (sau khi đăng nhập)

```
GET    /api/products            - Danh sách sản phẩm
GET    /api/products/:id        - Chi tiết sản phẩm
GET    /api/products/export     - Export sản phẩm
GET    /api/brands              - Danh sách thương hiệu
GET    /api/units               - Danh sách đơn vị tính

GET    /api/collections         - Danh sách danh mục
GET    /api/collections/tree    - Cấu trúc cây danh mục
GET    /api/collections/:id     - Chi tiết danh mục

GET    /api/auth/me             - Thông tin user hiện tại
POST   /api/auth/logout         - Đăng xuất
POST   /api/auth/refresh        - Làm mới token

GET    /api/users/profile       - Xem profile cá nhân
PUT    /api/users/profile       - Cập nhật profile
PUT    /api/users/change-password - Đổi mật khẩu
POST   /api/users/avatar        - Upload ảnh đại diện
```

---

## Cách Hoạt Động

### 1. **Đăng nhập**
Khi user đăng nhập, backend trả về token JWT chứa `role_id`:

```json
{
  "status": "OK",
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Administrator",
    "role_id": 1,
    "role_name": "Admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. **Gửi Request**
Mọi request cần kèm Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -X GET http://localhost:3000/api/products
```

### 3. **Kiểm Tra Quyền**
- **Middleware `verifyToken`**: Xác minh token hợp lệ
- **Middleware `requireAdmin`**: Kiểm tra role_id === 1
- **Middleware `requireManagerOrAdmin`**: Kiểm tra role_id === 1 || role_id === 3

### 4. **Phản Hồi Lỗi Quyền Hạn**
```json
{
  "status": "ERROR",
  "message": "Forbidden: Admin access required",
  "requiredRole": "Admin",
  "userRole": "Staff"
}
HTTP Status: 403 Forbidden
```

---

## Ví Dụ Thực Tế

### Scenario 1: Staff cố gắng thêm nhân viên
```bash
curl -X POST http://localhost:3000/api/staff \
  -H "Authorization: Bearer staff_token" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "new@example.com",
    "full_name": "New User",
    "password": "password123",
    "role_id": 2
  }'
```

**Kết quả:**
```json
{
  "status": "ERROR",
  "message": "Forbidden: Admin access required",
  "requiredRole": "Admin",
  "userRole": "Staff"
}
```

---

### Scenario 2: Manager tạo sản phẩm mới
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer manager_token" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD-001",
    "name": "New Product",
    "category_id": 1,
    "brand_id": 1,
    "unit_id": 1,
    "selling_price": 100000
  }'
```

**Kết quả:** ✅ Thành công - Manager có quyền

---

### Scenario 3: Admin phân quyền cho staff
```bash
curl -X PUT http://localhost:3000/api/staff/5/role \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "role_id": 3
  }'
```

**Kết quả:** ✅ Thành công - Chỉ Admin có quyền

---

## Cấu Trúc Middleware

### File: `backend/src/middleware/authorize.js`
Chứa các middleware:
- `requireAdmin` - Chỉ Admin (role_id = 1)
- `requireManagerOrAdmin` - Manager hoặc Admin (role_id = 1 || 3)
- `requireRole(allowedRoles)` - Tuỳ chỉnh danh sách role

### File: `backend/src/middleware/auth.js`
- `verifyToken` - Xác minh JWT token và lưu user info vào `req.user`

### File: `backend/src/routes/index.js`
Áp dụng middleware vào các routes

---

## Debugging

### 1. Kiểm tra Role_ID trong Token
```javascript
// Tìm route có issue
// Thêm console.log để debug:
console.log('User role_id:', req.user.role_id);
console.log('Required role:', requiredRole);
```

### 2. Kiểm tra Token Payload
Dùng [jwt.io](https://jwt.io/) để decode token và xem payload:
```json
{
  "id": 1,
  "email": "admin@example.com",
  "role_id": 1,
  "iat": 1705772400,
  "exp": 1706377200
}
```

### 3. Test API với Postman
1. Thực hiện login để lấy token
2. Sao chép token vào Authorization header (Bearer {token})
3. Test các endpoint khác nhau

---

## Danh Sách Kiểm Tra (Checklist)

- [x] Tạo middleware authorize.js
- [x] Cập nhật middleware auth.js kiểm tra role_id
- [x] Thêm requireAdmin cho staff routes
- [x] Thêm requireManagerOrAdmin cho product routes
- [x] Thêm requireManagerOrAdmin cho collection routes
- [x] Cập nhật router index.js để import middleware mới
- [x] Tạo documentation

---

## Mở Rộng Trong Tương Lai

Nếu cần thêm quyền hạn mới:

### 1. Thêm Middleware Mới
```javascript
// Ví dụ: Chỉ cho phép xem báo cáo
const requireReportAccess = (req, res, next) => {
  if (![1, 3].includes(req.user.role_id)) { // Admin, Manager
    return res.status(403).json({ status: 'ERROR', message: 'Forbidden' });
  }
  next();
};
```

### 2. Sử dụng Trong Routes
```javascript
router.get('/reports/sales', verifyToken, requireReportAccess, reportService.getSalesReport);
```

---

## Tổng Kết

✅ **Hệ thống phân quyền đã được thiết lập rõ ràng:**
- Admin có toàn quyền
- Manager có quyền quản lý sản phẩm, danh mục, đơn hàng
- Staff chỉ có quyền cơ bản
- Non-admin không thể truy cập API quản lý nhân viên

🔒 **Bảo mật được tăng cường:**
- Tất cả requests đều phải có token hợp lệ
- Role được kiểm tra ở từng endpoint
- Lỗi quyền hạn trả về HTTP 403 Forbidden
