# 📋 Hướng dẫn Docker cho Team Supermarket

## 🆕 Thành viên mới (Clone lần đầu)

### Bước 1: Clone và khởi động

```bash
git clone <repo-url>
cd supermarket
docker-compose up -d --build
```

### Bước 2: Cài đặt Data Generator (chạy 1 lần)

```powershell
# Windows PowerShell
docker cp database/incremental_data_generator.sql minimart_postgres:/tmp/
docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/incremental_data_generator.sql
```

### Bước 3: Sinh data đến ngày hiện tại

```powershell
# Windows PowerShell
.\scripts\catchup-data.ps1
```

```bash
# Linux/Mac
chmod +x scripts/*.sh
./scripts/generate-today.sh
```

**🎉 Xong! Database đã có dữ liệu đến ngày hôm nay.**

---

## 📅 Hàng ngày (Tất cả thành viên)

Mỗi ngày chạy lệnh này để sinh data mới:

```powershell
# Windows
.\scripts\generate-today.ps1
```

```bash
# Linux/Mac
./scripts/generate-today.sh
```

**Output mẫu:**
```
🚀 Supermarket Data Generator
==============================
🚀 Generating data for: 2026-01-29
📅 Date: 2026-01-29 | Weekend: FALSE | Promo: FALSE | Target orders: 78
✅ Orders created: 78 | Items: 215 | Revenue: 12,543,000
📦 Inventory: Imports: 8 | Exports: 215 | Adjustments: 2 | Damages: 0
✅ Done!
```

---

## 🔄 Sau khi nghỉ vài ngày

Nếu bạn nghỉ vài ngày không chạy, dùng lệnh catchup:

```powershell
# Windows
.\scripts\catchup-data.ps1
```

Script sẽ tự động tìm ngày cuối cùng có data và sinh tiếp đến hôm nay.

---

## 📊 Các lệnh hữu ích

### Sinh data cho ngày cụ thể
```powershell
# Backfill từ ngày X đến ngày Y
.\scripts\backfill-data.ps1 -StartDate "2026-01-01" -EndDate "2026-01-31"
```

### Kiểm tra chất lượng dữ liệu
```powershell
.\scripts\check-quality.ps1
```

### Xem data trực tiếp trong database
```powershell
docker exec -it minimart_postgres psql -U admin -d minimart_db

# Trong psql:
SELECT * FROM get_daily_summary('2026-01-29');
SELECT * FROM check_data_quality();
\q
```

---

## � Thành viên cũ (Đã có database)

### Cách 1: Cập nhật giữ data cũ

```powershell
git pull origin main

# Cài đặt/cập nhật generator functions
docker cp database/incremental_data_generator.sql minimart_postgres:/tmp/
docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/incremental_data_generator.sql

# Catchup data đến hôm nay
.\scripts\catchup-data.ps1

# Rebuild backend nếu có thay đổi code
docker-compose up -d --build backend
```

### Cách 2: Reset sạch (nhanh hơn)

```powershell
git pull origin main
docker-compose down -v
docker-compose up -d --build

# Sau đó cài generator và catchup
docker cp database/incremental_data_generator.sql minimart_postgres:/tmp/
docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/incremental_data_generator.sql
.\scripts\catchup-data.ps1
```

---

## 📁 Cấu trúc Scripts

```
scripts/
├── generate-today.ps1   # Sinh data hôm nay (Windows)
├── generate-today.sh    # Sinh data hôm nay (Linux/Mac)
├── catchup-data.ps1     # Bắt kịp data đến hôm nay
├── backfill-data.ps1    # Backfill khoảng thời gian cụ thể
└── check-quality.ps1    # Kiểm tra data quality

database/
├── schema.sql                      # Database schema
├── seed.sql                        # Dữ liệu dimension ban đầu
├── incremental_data_generator.sql  # Functions sinh data
├── daily_runner.sql                # Script chạy hàng ngày
├── catchup_runner.sql              # Script catchup
└── DATA_ENGINEERING_GUIDE.md       # Hướng dẫn chi tiết
```

---

## ❓ FAQ

### Q: Chạy `generate-today.ps1` 2 lần trong ngày có sao không?
**A:** Không sao! Script sẽ skip nếu đã có data cho ngày đó.

### Q: Làm sao biết data đã có đến ngày nào?
**A:** Chạy lệnh:
```powershell
docker exec -i minimart_postgres psql -U admin -d minimart_db -c "SELECT MAX(date_key) FROM fact_orders;"
```

### Q: Muốn sinh data cho ngày Flash Sale (nhiều orders)?
**A:** Dùng SQL trực tiếp:
```powershell
docker exec -i minimart_postgres psql -U admin -d minimart_db -c "SELECT * FROM generate_flash_sale_day('2026-02-14', 5.0);"
```

### Q: Database bị lỗi, muốn reset?
**A:** 
```powershell
docker-compose down -v
docker-compose up -d --build
# Rồi cài lại generator và catchup
```

---

## 🔗 Truy cập hệ thống

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

**Database credentials:**
- User: `admin`
- Password: `admin123`
- Database: `minimart_db`