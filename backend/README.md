# Backend API - Supermarket Management System

## 📋 Nội dung

Các API được xây dựng theo 3 module chính:

### Module 1: Authentication (Xác thực)
- ✅ Đăng nhập
- ✅ Đăng xuất  
- ✅ Refresh token
- ✅ Lấy thông tin user đang đăng nhập

### Module 2: Quản lý Profile (Hồ sơ cá nhân)
- ✅ Xem thông tin cá nhân
- ✅ Cập nhật thông tin cá nhân
- ✅ Đổi mật khẩu
- ✅ Upload avatar

### Module 3: Quản lý Nhân viên (Staff)
- ✅ Danh sách nhân viên
- ✅ Thêm nhân viên
- ✅ Chi tiết nhân viên
- ✅ Sửa nhân viên
- ✅ Xóa nhân viên
- ✅ Phân quyền nhân viên

---

## 🚀 Quick Start

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình environment
Tạo file `.env` trong thư mục `backend/` với nội dung:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=supermarket_db
DB_SSL=false

PORT=5000
NODE_ENV=development

JWT_SECRET=your-super-secret-key-change-this-in-production
```

### 3. Khởi động server
```bash
npm run dev
```

Server sẽ chạy trên `http://localhost:5000`

---

## 📁 Cấu trúc thư mục

```
backend/
├── src/
│   ├── index.js                 # Main application file
│   ├── routes/
│   │   └── index.js             # Routes definition
│   ├── services/
│   │   ├── authService.js       # Authentication logic
│   │   ├── profileService.js    # Profile management logic
│   │   └── staffService.js      # Staff management logic
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   └── config/
│       └── database.js          # Database connection config
├── .env                         # Environment variables
├── package.json
└── README.md
```

---

## 🔧 Cài đặt Database

### 1. Tạo database
```bash
createdb -U postgres supermarket_db
```

### 2. Chạy schema
```bash
psql -U postgres -d supermarket_db -f ../database/schema.sql
```

### 3. Chạy seed data (optional)
```bash
psql -U postgres -d supermarket_db -f ../database/seed.sql
```

---

## 📝 Cấu trúc API Response

### Success Response (200, 201)
```json
{
  "status": "OK",
  "message": "Operation successful",
  "data": {
    // Data here
  }
}
```

### Error Response (400, 401, 404, 500)
```json
{
  "status": "ERROR",
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🔐 Authentication

Tất cả các endpoint (trừ login và refresh token) yêu cầu header `Authorization`:

```
Authorization: Bearer <JWT_TOKEN>
```

Token được tạo sau khi đăng nhập thành công, hết hạn sau 7 ngày.

---

## 📚 Hướng dẫn Test

### Sử dụng Postman
1. Import file `Supermarket_API.postman_collection.json`
2. Set variable `base_url` = `http://localhost:5000`
3. Đăng nhập để lấy token
4. Set variable `token` = token từ login response
5. Test các endpoint khác

### Sử dụng cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"123456"}'

# Get user info
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token_here>"
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Server không chạy | Kiểm tra port 5000 có bị chiếm không, restart server |
| Kết nối database failed | Kiểm tra `.env`, PostgreSQL đang chạy không |
| Token invalid | Đăng nhập lại hoặc dùng refresh endpoint |
| CORS error | Đảm bảo frontend URL được add vào CORS whitelist |

---

## 📖 Xem tài liệu chi tiết

Xem file `API_TEST_GUIDE.md` ở thư mục root để xem hướng dẫn chi tiết từng endpoint

---

## 💡 Ghi chú

- Password được hash bằng bcryptjs
- JWT token expires sau 7 ngày
- Các field optional (phone, address) có thể null
- Phân trang mặc định limit=10, offset=0

---

## 🎓 Học thêm

- JWT: https://jwt.io
- Express.js: https://expressjs.com
- PostgreSQL: https://www.postgresql.org/docs
- bcryptjs: https://www.npmjs.com/package/bcryptjs

---

**Created:** 19/01/2026  
**Version:** 1.0.0
