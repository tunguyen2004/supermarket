# 🛒 Supermarket Management System

Hệ thống quản lý siêu thị mini - Dự án môn Mã nguồn mở

## 🚀 Chạy dự án với Docker

### Yêu cầu
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã cài đặt và đang chạy

### Bước 1: Clone dự án
```bash
git clone https://github.com/tunguyen2004/supermarket.git
cd supermarket
```

### Bước 2: Chạy Docker Compose
```bash
docker-compose up -d --build
```

Đợi khoảng 1-2 phút để các services khởi động.

### Bước 3: Truy cập

| Service | URL | Mô tả |
|---------|-----|-------|
| Frontend | http://localhost:8080 | Giao diện web |
| Backend API | http://localhost:5000 | REST API |
| pgAdmin | http://localhost:5050 | Quản lý Database |

### Tài khoản đăng nhập

**Web/API:**
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |

**pgAdmin:**
| Email | Password |
|-------|----------|
| admin@minimart.com | admin123 |

---

## 📋 Kiểm tra trạng thái

```bash
# Xem các container đang chạy
docker-compose ps

# Xem logs
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🛑 Dừng dự án

```bash
# Dừng tất cả services
docker-compose down

# Dừng và xóa cả database (reset data)
docker-compose down -v
```

---

## 📚 API Documentation

Xem chi tiết tại: [API_DOCS.md](./API_DOCS.md)

### Tóm tắt API:

| Module | Số API | Endpoint gốc |
|--------|--------|--------------|
| Products (Module 4) | 10 | `/api/products` |
| Collections (Module 5) | 6 | `/api/collections` |

---

## 🔧 Troubleshooting

### Lỗi port đã được sử dụng
```bash
# Kiểm tra port
netstat -ano | findstr :5000
netstat -ano | findstr :8080

# Dừng process đang dùng port (thay PID)
taskkill /PID <PID> /F
```

### Reset lại toàn bộ
```bash
docker-compose down -v
docker-compose up -d --build
```

---

## 👥 Nhóm phát triển

| Thành viên | Module |
|------------|--------|
| ... | Module 1-3: Auth, Profile, Staff |
| ... | Module 4-5: Products, Collections |
| ... | Module 6-7: ... |
| ... | Module 8-9: ... |

---

## 📁 Cấu trúc dự án

```
supermarket/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── middleware/     # Auth, Upload middleware
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Vue.js 3 + Tailwind
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── database/               # SQL scripts
│   ├── schema.sql
│   └── seed.sql
├── docker-compose.yml      # Docker orchestration
├── API_DOCS.md            # API documentation
└── README.md              # This file
```
