# 🗄️ Database — Supermarket Management System

PostgreSQL 14+ | Snowflake Schema | 36 tables

## 📁 Cấu trúc folder

```
database/
├── README.md                        # 📖 File này
│
├── init/                            # 🔵 Docker auto-init (chạy khi tạo DB mới)
│   ├── 01_schema.sql                #    DDL: tables, indexes, constraints, triggers, views
│   ├── 02_seed.sql                  #    DML: dữ liệu khởi tạo (dimensions)
│   ├── 03_functions.sql             #    Functions: helper + data generators
│   └── 04_catchup.sql               #    Catchup: sinh data đến ngày hiện tại
│
├── scripts/                         # 🔧 Utility scripts
│   ├── backup.sql                   #    Hướng dẫn backup/restore
│   ├── health_check.sql             #    Kiểm tra sức khỏe database
│   └── reset.sql                    #    Reset toàn bộ data
│
└── docs/                            # 📚 Documentation
    ├── DATA_ENGINEERING_GUIDE.md     #    Hướng dẫn incremental data loading
    └── SCHEMA_DESIGN.md             #    Giải thích thiết kế schema
```

## 🚀 Quick Start

### Khởi tạo database (tự động với Docker)
```bash
docker compose up -d postgres
# Docker tự chạy: 01_schema → 02_seed → 03_functions → 04_catchup
```

### Sinh data cho ngày hôm nay
```powershell
.\scripts\generate-today.ps1

# Hoặc trực tiếp
docker exec -i minimart_postgres psql -U admin -d minimart_db -c "SELECT * FROM generate_daily_data(CURRENT_DATE);"
```

### Backfill data cho nhiều ngày
```powershell
.\scripts\backfill-data.ps1 -StartDate "2026-01-01" -EndDate "2026-01-31"

# Hoặc trực tiếp
docker exec -i minimart_postgres psql -U admin -d minimart_db -c "SELECT * FROM backfill_daily_data('2025-01-01', '2026-01-31');"
```

### Bắt kịp data đến hôm nay
```powershell
.\scripts\catchup-data.ps1
```

### Kiểm tra sức khỏe database
```bash
docker cp database/scripts/health_check.sql minimart_postgres:/tmp/
docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/health_check.sql
```
docker cp database/init/02_seed.sql minimart_postgres:/tmp/
docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/02_seed.sql
### Reset database
```bash
docker cp database/scripts/reset.sql minimart_postgres:/tmp/
docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/reset.sql
# Sau đó chạy lại seed + catchup
```

## 📊 Thống kê Database

| Layer           | Số bảng | Ví dụ                                     |
| --------------- | ------- | ----------------------------------------- |
| Sub-dimensions  | 13      | regions, cities, categories, brands...    |
| Main dimensions | 11      | stores, products, customers, users...     |
| Fact tables     | 11      | orders, inventory, cashbook, shipments... |
| Views           | 1       | vw_daily_cashbook_summary                 |
| **Tổng**        | **36**  |                                           |

### Seed Data
| Entity     | Số lượng                   |
| ---------- | -------------------------- |
| Regions    | 3 (Bắc/Trung/Nam)          |
| Cities     | 63 tỉnh/thành              |
| Categories | 24 (hierarchy)             |
| Brands     | 24                         |
| Stores     | 5 (4 retail + 1 warehouse) |
| Suppliers  | 8                          |
| Customers  | 100                        |
| Products   | 49                         |
| Users      | 6 (password: `1`)          |

### Generated Data (per day)
| Metric                 | Giá trị      |
| ---------------------- | ------------ |
| Orders                 | 50-300/ngày  |
| Order items            | 150-900/ngày |
| Inventory transactions | 50-500/ngày  |
| Shipments              | 5-30/ngày    |

## 🏪 Tổng quan dữ liệu thực tế (2026)

| Entity                | Số lượng seed ban đầu | Sau backfill 1 năm             |
| --------------------- | --------------------- | ------------------------------ |
| Regions               | 3                     | 3                              |
| Cities                | 63                    | 63                             |
| Categories            | 24                    | 24                             |
| Brands                | 24                    | 24                             |
| Stores                | 5                     | 5                              |
| Suppliers             | 20                    | 20                             |
| Customers             | 500                   | ~500 (có thể tăng do sinh mới) |
| Products              | 49                    | 49                             |
| Product Variants      | 49                    | 49                             |
| Users                 | 6                     | 6                              |
| Orders                | 0                     | ~41,000                        |
| Order Items           | 0                     | ~77,000                        |
| Inventory Stocks      | 245                   | tăng động (theo phát sinh)     |
| Shipments             | 0                     | hàng chục nghìn                |
| Cashbook Transactions | 1                     | hàng nghìn                     |
| Discounts             | 3                     | 3                              |
| Time Dimension        | 1096 ngày             | 1096 ngày                      |

- **Seed**: Chạy `02_seed.sql` sẽ có đủ dimension, 500 khách, 20 NCC, 49 sản phẩm, tồn kho, users, ...
- **Backfill**: Chạy `backfill_daily_data('2025-01-01','2026-01-01')` sẽ sinh ~41,000 đơn, ~77,000 sản phẩm bán, shipment, cashbook, ...
- **Tất cả code, pattern, logic đều chuẩn backend thực tế.**

## 🔐 Kết nối

| Tool                     | Host        | Port   | Database      | User    | Password   |
| ------------------------ | ----------- | ------ | ------------- | ------- | ---------- |
| **App/DBeaver Desktop**  | `localhost` | `5432` | `minimart_db` | `admin` | `admin123` |
| **CloudBeaver (Docker)** | `postgres`  | `5432` | `minimart_db` | `admin` | `admin123` |

## 📝 Thay đổi Schema

Khi cần thay đổi schema, sửa trực tiếp trong `init/01_schema.sql` rồi reset DB:

```bash
# Reset và tái tạo DB
docker compose down -v
docker compose up -d postgres
# Docker tự chạy: 01_schema → 02_seed → 03_functions → 04_catchup
```

## 📚 Tài liệu chi tiết

- [Schema Design Guide](docs/SCHEMA_DESIGN.md) — Giải thích thiết kế, naming convention, ER diagram
- [Data Engineering Guide](docs/DATA_ENGINEERING_GUIDE.md) — Incremental loading, data quality, SCD
