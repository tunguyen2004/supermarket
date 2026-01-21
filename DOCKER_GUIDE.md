

## � Hướng dẫn cho thành viên mới (Pull về lần đầu)

> ✅ **Tin tốt:** Không cần chạy migration thủ công! Tất cả đã được tích hợp vào schema.sql

```bash
# 1. Clone repo
git clone <repo-url>
cd supermarket

# 2. Chạy Docker (tự động tạo database đầy đủ)
docker-compose up -d --build

# 3. Đợi ~30s rồi truy cập
# - Backend: http://localhost:5000
# - Frontend: http://localhost:8080
# - pgAdmin: http://localhost:5050
```

---

## �🔄 Hướng dẫn cập nhật (đã có database cũ)

> ⚠️ **QUAN TRỌNG:** Nếu bạn đã có database từ trước, cần chạy migration 1 LẦN DUY NHẤT để không mất dữ liệu.

### Bước 1: Pull code mới nhất
```bash
git pull origin main
```

### Bước 2: Chạy migration tổng hợp (CHỈ 1 LẦN)

```bash
# Copy file migration vào container
docker cp database/migration_all.sql minimart_postgres:/tmp/

# Chạy migration (1 lệnh duy nhất)
docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/migration_all.sql
```

### Bước 3: Rebuild backend
```bash
docker-compose up -d --build backend
```

---

## ⚡ Reset hoàn toàn (Cách nhanh nhất - XÓA HẾT DỮ LIỆU)

Nếu không cần giữ dữ liệu cũ, đây là cách đơn giản nhất:

```bash
# Xóa sạch containers và volumes
docker-compose down -v

# Build lại từ đầu (database sẽ tự động được tạo mới)
docker-compose up -d --build
```

---

## 🛠️ Các lệnh Docker thường dùng

### Quản lý containers

```bash
# Khởi động tất cả containers
docker-compose up -d

# Dừng tất cả containers
docker-compose down

# Restart một container cụ thể
docker-compose restart backend
docker-compose restart frontend
docker-compose restart postgres

# Xem logs
docker-compose logs -f              # Tất cả
docker-compose logs -f backend      # Chỉ backend
docker-compose logs -f postgres     # Chỉ postgres
```

### Quản lý database

```bash
# Truy cập PostgreSQL shell
docker exec -it minimart_postgres psql -U admin -d minimart_db

# Chạy một file SQL
docker exec -i minimart_postgres psql -U admin -d minimart_db -f /path/to/file.sql

# Backup database
docker exec minimart_postgres pg_dump -U admin minimart_db > backup.sql

# Restore database
docker exec -i minimart_postgres psql -U admin -d minimart_db < backup.sql
```
