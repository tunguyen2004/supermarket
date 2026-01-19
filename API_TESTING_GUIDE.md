# 📚 Hướng dẫn Test API Supermarket Management System

## 🎯 Mục đích

Tài liệu này hướng dẫn cách test các API endpoint của hệ thống quản lý siêu thị.

---

## 🔐 Account để test

| Field | Giá trị |
|-------|--------|
| **Username** | `admin` |
| **Password** | `1` |




✨ Bạn có thể dùng account này để test API!
```

### 2️⃣ Khởi động Server

```bash
cd backend
npm run dev
```

**Output mong đợi:**
```
✅ Database connected successfully
🚀 Server running on port 5000
```

Server chạy trên: **http://localhost:5000**

---

## 📖 API Endpoints

### **Module 1: Authentication (Xác thực)**

#### 1️⃣ Đăng nhập - `POST /api/auth/login`

**Mô tả:** Đăng nhập bằng username và password

**URL:** `POST http://localhost:5000/api/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "1"
}
```

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@supermarket.com",
    "full_name": "Administrator",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBzdXBlcm1hcmtldC5jb20iLCJpYXQiOjE2MzAwMDAwMDAsImV4cCI6MTYzMDYwMDAwMH0.signature"
  }
}
```

**Test với Postman:**
1. Method: `POST`
2. URL: `http://localhost:5000/api/auth/login`
3. Tab `Headers`:
   - Key: `Content-Type`
   - Value: `application/json`
4. Tab `Body` → `raw` → `JSON`:
   ```json
   {
     "username": "admin",
     "password": "1"
   }
   ```
5. Click `Send`

**Test với PowerShell:**
```powershell
$body = @{username="admin"; password="1"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**💾 Lưu token từ response để dùng ở các request tiếp theo**

---

#### 2️⃣ Lấy thông tin user đang đăng nhập - `GET /api/auth/me`

**Mô tả:** Lấy thông tin của user hiện tại (phải đã login)

**URL:** `GET http://localhost:5000/api/auth/me`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "User info retrieved",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@supermarket.com",
    "full_name": "Administrator",
    "created_at": "2026-01-19T10:30:00.000Z"
  }
}
```

**Test với Postman:**
1. Method: `GET`
2. URL: `http://localhost:5000/api/auth/me`
3. Tab `Headers` → Thêm:
   - Key: `Authorization`
   - Value: `Bearer <token_từ_login>`
4. Click `Send`

**Test với PowerShell:**
```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
$headers = @{"Authorization" = "Bearer $token"}
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/me" `
  -Method GET `
  -Headers $headers
```

---

#### 3️⃣ Đăng xuất - `POST /api/auth/logout`

**Mô tả:** Đăng xuất (phía client xóa token)

**URL:** `POST http://localhost:5000/api/auth/logout`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
```

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Logout successful. Please remove token on client side"
}
```

**Test với PowerShell:**
```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
$headers = @{"Authorization" = "Bearer $token"}
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/logout" `
  -Method POST `
  -Headers $headers
```

---

#### 4️⃣ Refresh Token - `POST /api/auth/refresh`

**Mô tả:** Làm mới token khi hết hạn

**URL:** `POST http://localhost:5000/api/auth/refresh`

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "wasExpired": false
  }
}
```

---

### **Module 2: Quản lý Nhân viên (Staff)**

#### 1️⃣ Danh sách nhân viên - `GET /api/staff`

**Mô tả:** Lấy danh sách tất cả nhân viên (có phân trang)

**URL:** `GET http://localhost:5000/api/staff?limit=10&offset=0`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
```

**Query Parameters:**
- `limit` (optional): Số bản ghi mỗi trang (default: 10, max: 100)
- `offset` (optional): Bắt đầu từ bản ghi số mấy (default: 0)

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Staff list retrieved successfully",
  "data": [
    {
      "id": 2,
      "username": "staff1",
      "email": "staff1@supermarket.com",
      "full_name": "Staff Member 1",
      "phone": "0912345678",
      "is_active": true,
      "created_at": "2026-01-19T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "pages": 1
  }
}
```

**Test với Postman:**
1. Method: `GET`
2. URL: `http://localhost:5000/api/staff?limit=10&offset=0`
3. Tab `Headers` → `Authorization: Bearer <token>`
4. Click `Send`

**Test với PowerShell:**
```powershell
$token = "..."
$headers = @{"Authorization" = "Bearer $token"}
Invoke-WebRequest -Uri "http://localhost:5000/api/staff?limit=10&offset=0" `
  -Method GET `
  -Headers $headers
```

---

#### 2️⃣ Thêm nhân viên - `POST /api/staff`

**Mô tả:** Tạo nhân viên mới

**URL:** `POST http://localhost:5000/api/staff`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "staff1",
  "email": "staff1@supermarket.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0912345678",
  "password": "password123",
  "role_id": 2
}
```

**Lưu ý:**
- `username`: Duy nhất, không được trùng
- `email`: Duy nhất, không được trùng
- `password`: Tối thiểu 6 ký tự
- `role_id`: 1=Admin, 2=Staff, 3=Manager (hoặc xem subdim_roles)

**Response (Success - 201):**
```json
{
  "status": "OK",
  "message": "Staff added successfully",
  "data": {
    "id": 2,
    "username": "staff1",
    "email": "staff1@supermarket.com",
    "full_name": "Nguyễn Văn A",
    "phone": "0912345678",
    "is_active": true,
    "created_at": "2026-01-19T11:00:00.000Z"
  }
}
```

**Test với Postman:**
1. Method: `POST`
2. URL: `http://localhost:5000/api/staff`
3. Tab `Headers` → `Authorization: Bearer <token>`
4. Tab `Body` → `raw` → `JSON`
5. Nhập JSON request
6. Click `Send`

**Test với PowerShell:**
```powershell
$token = "..."
$headers = @{"Authorization" = "Bearer $token"}
$body = @{
  username = "staff1"
  email = "staff1@supermarket.com"
  full_name = "Nguyễn Văn A"
  phone = "0912345678"
  password = "password123"
  role_id = 2
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/staff" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body $body
```

---

#### 3️⃣ Chi tiết nhân viên - `GET /api/staff/:id`

**Mô tả:** Lấy thông tin chi tiết của một nhân viên

**URL:** `GET http://localhost:5000/api/staff/2`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
```

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Staff detail retrieved successfully",
  "data": {
    "id": 2,
    "username": "staff1",
    "email": "staff1@supermarket.com",
    "full_name": "Nguyễn Văn A",
    "phone": "0912345678",
    "is_active": true,
    "created_at": "2026-01-19T11:00:00.000Z"
  }
}
```

---

#### 4️⃣ Cập nhật thông tin nhân viên - `PUT /api/staff/:id`

**Mô tả:** Cập nhật tên hoặc số điện thoại

**URL:** `PUT http://localhost:5000/api/staff/2`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "Nguyễn Văn B",
  "phone": "0987654321"
}
```

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Staff updated successfully",
  "data": {
    "id": 2,
    "username": "staff1",
    "email": "staff1@supermarket.com",
    "full_name": "Nguyễn Văn B",
    "phone": "0987654321",
    "is_active": true
  }
}
```

---

#### 5️⃣ Xóa nhân viên - `DELETE /api/staff/:id`

**Mô tả:** Xóa một nhân viên

**URL:** `DELETE http://localhost:5000/api/staff/2`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
```

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Staff deleted successfully"
}
```

---

#### 6️⃣ Phân quyền nhân viên - `PUT /api/staff/:id/role`

**Mô tả:** Thay đổi role của nhân viên

**URL:** `PUT http://localhost:5000/api/staff/2/role`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "role_id": 3
}
```

**Các role_id có sẵn:**
```
1 = Admin
2 = Staff
3 = Manager
```

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Staff role updated successfully",
  "data": {
    "id": 2,
    "username": "staff1",
    "email": "staff1@supermarket.com",
    "full_name": "Nguyễn Văn B",
    "role_id": 3,
    "is_active": true
  }
}
```

---

### **Module 3: Quản lý Profile**

#### 1️⃣ Xem profile - `GET /api/users/profile`

**URL:** `GET http://localhost:5000/api/users/profile`

**Headers:** `Authorization: Bearer <YOUR_TOKEN>`

**Response:**
```json
{
  "status": "OK",
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@supermarket.com",
    "full_name": "Administrator",
    "phone": null,
    "is_active": true,
    "created_at": "2026-01-19T10:30:00.000Z"
  }
}
```

---

#### 2️⃣ Cập nhật profile - `PUT /api/users/profile`

**URL:** `PUT http://localhost:5000/api/users/profile`

**Headers:** `Authorization: Bearer <YOUR_TOKEN>`

**Request Body:**
```json
{
  "full_name": "Admin Supermarket",
  "phone": "0987654321"
}
```

**Response:**
```json
{
  "status": "OK",
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@supermarket.com",
    "full_name": "Admin Supermarket",
    "phone": "0987654321",
    "is_active": true
  }
}
```

---

#### 3️⃣ Đổi mật khẩu - `PUT /api/users/change-password`

**URL:** `PUT http://localhost:5000/api/users/change-password`

**Headers:** `Authorization: Bearer <YOUR_TOKEN>`

**Request Body:**
```json
{
  "oldPassword": "1",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "status": "OK",
  "message": "Password changed successfully"
}
```

---

## 📊 Complete Test Flow

### Flow 1: Authentication

```
1. POST /api/auth/login
   ↓ (Lấy token)
   
2. GET /api/auth/me
   ↓ (Kiểm tra login thành công)
   
3. POST /api/auth/logout
   ↓ (Xóa token ở client)
```

### Flow 2: Staff Management

```
1. GET /api/staff (Lấy danh sách)
   ↓
2. POST /api/staff (Thêm mới)
   ↓
3. GET /api/staff/2 (Chi tiết)
   ↓
4. PUT /api/staff/2 (Cập nhật)
   ↓
5. PUT /api/staff/2/role (Phân quyền)
   ↓
6. DELETE /api/staff/2 (Xóa)
```

### Flow 3: Profile Management

```
1. GET /api/users/profile (Xem)
   ↓
2. PUT /api/users/profile (Cập nhật)
   ↓
3. PUT /api/users/change-password (Đổi mật khẩu)
```

---

## 📋 Postman Collection

### Cách import:

1. Mở Postman
2. Click `File` → `Import`
3. Chọn file `Supermarket_API.postman_collection.json`
4. Các endpoint sẽ được import tự động

### Setup variables:

1. Click vào ⚙️ (Environment/Variables)
2. Tạo variable `base_url` = `http://localhost:5000`
3. Tạo variable `token` = (để trống, sẽ update sau login)

---

## ⚠️ Lỗi thường gặp & Cách fix

| Lỗi | Nguyên nhân | Cách fix |
|-----|-----------|---------|
| 400 Bad Request | Input thiếu hoặc format sai | Kiểm tra request body & headers |
| 401 Unauthorized | Token không hợp lệ/hết hạn | Đăng nhập lại để lấy token mới |
| 404 Not Found | Staff/User không tồn tại | Kiểm tra ID có tồn tại trong DB |
| 500 Internal Error | Lỗi server | Kiểm tra logs & database connection |

---

## 🔍 Debug Tips

### Xem logs server:
```bash
cd backend
npm run dev
# Logs sẽ in ra console
```

### Kiểm tra database:
```bash
psql -U admin -d minimart_db

# Xem users
SELECT * FROM dim_users;

# Xem roles
SELECT * FROM subdim_roles;
```

### Format JSON response đẹp:
Dùng tools online như: https://jsonformatter.org

---

## 📚 Tài liệu tham khảo

- Express.js: https://expressjs.com
- PostgreSQL: https://www.postgresql.org/docs
- JWT: https://jwt.io
- Postman: https://learning.postman.com
- bcryptjs: https://www.npmjs.com/package/bcryptjs

---

## ✅ Checklist chuẩn bị

- [ ] Tạo admin account: `node create-admin.js`
- [ ] Server chạy: `npm run dev`
- [ ] Database kết nối: Check logs "Database connected"
- [ ] Test login endpoint
- [ ] Lấy token thành công
- [ ] Test staff endpoints
- [ ] Test profile endpoints

---

**Created:** 19/01/2026  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing
