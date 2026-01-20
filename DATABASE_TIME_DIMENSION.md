# 📚 DIM_TIME Insert Documentation

> **Quick Start:** [DIM_TIME_INSERT_QUICK_START.md](DIM_TIME_INSERT_QUICK_START.md)  
> **Full Guide:** [database/DIM_TIME_GUIDE.md](database/DIM_TIME_GUIDE.md)

---

## 🎯 Overview

### Bảng `dim_time` là gì?

Bảng **DIM_TIME** (Time Dimension) là bảng chiều dùng cho phân tích doanh số theo thời gian:

```
Thời gian          | Phân tích
───────────────────┼────────────────────────────────
Ngày (Day)         | Bán hàng theo ngày
Tuần (Week)        | Trend bán hàng tuần
Tháng (Month)      | Doanh số tháng
Quý (Quarter)      | KPI quý
Năm (Year)         | Báo cáo năm
Weekend/Holiday    | Ngày đặc biệt
```

### Dữ liệu hiện có

- **Từ:** 19/01/2026
- **Đến:** 18/01/2028
- **Tổng:** 730 ngày (2 năm)
- **Weekends:** 208 ngày
- **Holidays:** 8 ngày (lễ Việt Nam)

---

## 🚀 Cách sử dụng

### ✨ Tự động (Khuyến nghị) - Docker Compose

Docker-compose đã được cập nhật. Khi chạy:

```bash
docker-compose up -d
```

Quy trình tự động:
1. **Khởi động PostgreSQL** (10-15s)
2. **Tạo bảng** từ `schema.sql`
3. **Insert seed data** từ `seed.sql`
4. **Insert dim_time** từ `insert_dim_time_only.sql` ⭐ **TỰ ĐỘNG**

Không cần làm gì thêm! ✨

### ✔️ Kiểm tra kết quả

```bash
# Kiểm tra dữ liệu đã insert
docker-compose exec -T postgres psql -U admin -d minimart_db -c "SELECT COUNT(*) FROM dim_time;"

# Output mong đợi: 730
```

### 🔧 Manual (nếu cần chạy lại)

```bash
# Copy file vào container
docker cp database/insert_dim_time_only.sql minimart_postgres:/tmp/

# Chạy
docker-compose exec -T postgres psql -U admin -d minimart_db -f /tmp/insert_dim_time_only.sql
```

---

## 📊 Cấu trúc dữ liệu

### Cột trong bảng

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `date_key` | DATE | Ngày (Khóa chính) |
| `day_of_week` | INT | Thứ (1=Thứ 2, 7=Chủ nhật) |
| `day_name` | VARCHAR | Tên thứ (Monday, Tuesday...) |
| `week_of_year` | INT | Tuần trong năm |
| `month` | INT | Tháng (1-12) |
| `month_name` | VARCHAR | Tên tháng |
| `quarter` | INT | Quý (1-4) |
| `year` | INT | Năm |
| `is_weekend` | BOOLEAN | Có phải weekend? |
| `is_holiday` | BOOLEAN | Có phải ngày lễ? |
| `holiday_name` | VARCHAR | Tên ngày lễ |

### Ví dụ dữ liệu

```sql
date_key  | day_of_week | day_name  | week | month | month_name | quarter | year | weekend | holiday | holiday_name
-----------|-------------|-----------|------|-------|------------|---------|------|---------|---------|-----
2026-01-19 |      1      | Monday    |  4   |   1   | January    |    1    | 2026 | false   | false   | NULL
2026-01-24 |      6      | Saturday  |  4   |   1   | January    |    1    | 2026 | true    | false   | NULL
2026-04-30 |      4      | Thursday  | 18   |   4   | April      |    2    | 2026 | false   | true    | Ngày Giải phóng (30/4)
```

---

## 💡 Query Examples

### 1. Lấy tất cả ngày lễ

```sql
SELECT date_key, day_name, holiday_name 
FROM dim_time 
WHERE is_holiday = TRUE
ORDER BY date_key;
```

**Kết quả:**
```
  date_key  | day_name  | holiday_name
────────────┼───────────┼──────────────────────
 2026-04-30 | Thursday  | Ngày Giải phóng (30/4)
 2026-05-01 | Friday    | Ngày Quốc tế Lao động
 2026-09-02 | Wednesday | Ngày Quốc khánh Việt Nam
 2027-01-01 | Friday    | Tết Dương lịch
```

### 2. Tính ngày làm việc trong tháng

```sql
SELECT 
  month,
  month_name,
  COUNT(*) as total_days,
  COUNT(CASE WHEN is_weekend = FALSE AND is_holiday = FALSE THEN 1 END) as working_days
FROM dim_time
WHERE year = 2026 AND month IN (1,2,3)
GROUP BY month, month_name
ORDER BY month;
```

### 3. Thống kê theo quý

```sql
SELECT 
  year, quarter,
  COUNT(CASE WHEN is_weekend = FALSE AND is_holiday = FALSE THEN 1 END) as working_days,
  COUNT(CASE WHEN is_weekend THEN 1 END) as weekend_days,
  COUNT(CASE WHEN is_holiday THEN 1 END) as holiday_days
FROM dim_time
WHERE year IN (2026, 2027, 2028)
GROUP BY year, quarter
ORDER BY year, quarter;
```

### 4. Ngày đầu/cuối tuần

```sql
-- Ngày Thứ 2 (bắt đầu tuần)
SELECT * FROM dim_time 
WHERE year = 2026 AND day_of_week = 1
ORDER BY date_key;

-- Ngày Chủ nhật (cuối tuần)
SELECT * FROM dim_time 
WHERE year = 2026 AND day_of_week = 7
ORDER BY date_key;
```

---

## 📁 Files

### Tài liệu
- **[DIM_TIME_INSERT_QUICK_START.md](DIM_TIME_INSERT_QUICK_START.md)** ← Bắt đầu từ đây
- **[database/DIM_TIME_GUIDE.md](database/DIM_TIME_GUIDE.md)** ← Hướng dẫn đầy đủ

### SQL Scripts
- **[database/insert_dim_time.sql](database/insert_dim_time.sql)** - Đầy đủ (230+ dòng)
- **[database/insert_dim_time_only.sql](database/insert_dim_time_only.sql)** - Tối ưu ⭐
- **[database/seed.sql](database/seed.sql)** - Gộp tất cả seed data

### Cấu hình
- **[docker-compose.yml](docker-compose.yml)** - Đã cập nhật để tự động insert

---

## ✅ Checklist

- [ ] Chạy `docker-compose up -d`
- [ ] Chờ postgres khởi động (10-15s)
- [ ] Kiểm tra: `SELECT COUNT(*) FROM dim_time;` → 730
- [ ] Xem ngày lễ: `SELECT * FROM dim_time WHERE is_holiday = true;`
- [ ] Đọc DIM_TIME_GUIDE.md để hiểu chi tiết

---

## 🎯 Ngày lễ Việt Nam

| Ngày | Năm | Tên |
|------|-----|-----|
| 30/4 | 2026, 2027 | Ngày Giải phóng |
| 1/5 | 2026, 2027 | Ngày Quốc tế Lao động |
| 2/9 | 2026, 2027 | Ngày Quốc khánh |
| 1/1 | 2027, 2028 | Tết Dương lịch |

---

## 🔄 Nếu cần chạy lại

```bash
# Xóa dữ liệu cũ
docker-compose exec -T postgres psql -U admin -d minimart_db -c "DELETE FROM dim_time;"

# Chạy insert lại
docker cp database/insert_dim_time_only.sql minimart_postgres:/tmp/
docker-compose exec -T postgres psql -U admin -d minimart_db -f /tmp/insert_dim_time_only.sql
```

---

## 🐛 Lỗi thường gặp

### "duplicate key value"
```bash
DELETE FROM dim_time WHERE year >= 2026;
```

### "psql: command not found"
```bash
docker-compose exec postgres psql -U admin -d minimart_db
```

### Không thấy dữ liệu
```bash
docker-compose logs postgres | tail -50
```

---

## 📖 Xem tiếp

👉 **[DIM_TIME_INSERT_QUICK_START.md](DIM_TIME_INSERT_QUICK_START.md)** - Bắt đầu nhanh  
👉 **[database/DIM_TIME_GUIDE.md](database/DIM_TIME_GUIDE.md)** - Hướng dẫn đầy đủ

---

**Status:** ✅ Production Ready  
**Last Updated:** 20/01/2026  
**Version:** 1.0.0
