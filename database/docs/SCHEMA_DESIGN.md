# 📐 Schema Design Guide — Supermarket Management System

## Tổng quan kiến trúc

Database sử dụng **Snowflake Schema (OLTP-friendly)** với PostgreSQL 14+.

```
┌──────────────────────────────────────────────────────────────────┐
│                     SNOWFLAKE SCHEMA                             │
│                                                                  │
│  LEVEL 3 (Sub-sub)    LEVEL 2 (Sub-dim)    LEVEL 1 (Main dim)   │
│  ┌──────────┐         ┌──────────────┐     ┌─────────────┐      │
│  │ Regions  │────────▶│   Cities     │────▶│   Stores    │      │
│  └──────────┘         └──────────────┘     │   Suppliers │      │
│                       ┌──────────────┐     │   Customers │      │
│                       │ Categories   │────▶│             │      │
│                       │ Brands       │────▶│  Products   │      │
│                       │ Units        │────▶│  Variants   │      │
│                       │ Cust Groups  │────▶│             │      │
│                       │ Roles        │────▶│   Users     │      │
│                       │ Store Types  │────▶│             │      │
│                       │ Trans Types  │     └──────┬──────┘      │
│                       │ Disc Types   │            │              │
│                       │ Cashbook Types│           │              │
│                       │ Pay Methods  │            ▼              │
│                       │ Ship Statuses│     ┌─────────────┐      │
│                       └──────────────┘     │ FACT TABLES │      │
│                                            │  Orders     │      │
│                                            │  Inventory  │      │
│                                            │  Cashbook   │      │
│                                            │  Shipments  │      │
│                                            │  Chat Hist  │      │
│                                            │  Reports    │      │
│                                            └─────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

## Naming Convention

| Prefix | Ý nghĩa | Ví dụ |
|--------|---------|-------|
| `subdim_` | Sub-dimension (lookup/reference tables) | `subdim_regions`, `subdim_brands` |
| `dim_` | Main dimension (entities chính) | `dim_products`, `dim_customers` |
| `fact_` | Fact tables (transactions/events) | `fact_orders`, `fact_inventory_stocks` |
| `vw_` | Views | `vw_daily_cashbook_summary` |

## Các layer

### Level 3: Sub-sub Dimensions (1 bảng)
- `subdim_regions` — Miền Bắc/Trung/Nam

### Level 2: Sub-dimensions (11 bảng)
| Bảng | Mô tả | Records |
|------|--------|---------|
| `subdim_cities` | 63 tỉnh/thành phố | 63 |
| `subdim_categories` | Danh mục sản phẩm (hierarchy) | 24 |
| `subdim_brands` | Thương hiệu | 24 |
| `subdim_units` | Đơn vị tính | 10 |
| `subdim_customer_groups` | Hạng khách hàng (VIP/Gold/Silver/Bronze/Normal) | 5 |
| `subdim_store_types` | Loại cửa hàng | 4 |
| `subdim_transaction_types` | Loại giao dịch kho | 8 |
| `subdim_roles` | Vai trò (Admin/Staff) | 2 |
| `subdim_permissions` | Quyền hạn | 17 |
| `subdim_discount_types` | Loại khuyến mãi | 4 |
| `subdim_cashbook_types` | Loại sổ quỹ | 10 |
| `subdim_payment_methods` | Phương thức thanh toán | 7 |
| `subdim_shipment_statuses` | Trạng thái vận chuyển | 10 |

### Level 1: Main Dimensions (10 bảng)
| Bảng | Mô tả | FK đến |
|------|--------|--------|
| `dim_time` | Lịch 2025-2027 | — |
| `dim_stores` | 5 cửa hàng | store_types, cities |
| `dim_suppliers` | 8 nhà cung cấp | cities |
| `dim_customers` | 100 khách hàng | customer_groups, cities |
| `dim_products` | 49 sản phẩm | categories, brands, units |
| `dim_product_variants` | SKU + giá | products |
| `dim_product_images` | Gallery ảnh | products |
| `dim_users` | 6 users | roles, stores |
| `dim_discounts` | Mã giảm giá | discount_types, users |
| `dim_carriers` | Đơn vị vận chuyển | — |
| `dim_bank_accounts` | Tài khoản ngân hàng | stores, users |

### Fact Tables (9 bảng)
| Bảng | Mô tả | Grain |
|------|--------|-------|
| `fact_orders` | Đơn hàng | 1 row = 1 đơn |
| `fact_order_items` | Chi tiết đơn hàng | 1 row = 1 sản phẩm trong đơn |
| `fact_inventory_stocks` | Tồn kho hiện tại | 1 row = 1 variant × 1 store |
| `fact_inventory_transactions` | Giao dịch kho | 1 row = 1 lần nhập/xuất/điều chỉnh |
| `fact_discount_usages` | Sử dụng mã giảm giá | 1 row = 1 lần dùng mã |
| `fact_cashbook_transactions` | Thu chi sổ quỹ | 1 row = 1 giao dịch |
| `fact_store_balances` | Số dư cửa hàng theo ngày | 1 row = 1 store × 1 ngày |
| `fact_shipments` | Đơn vận chuyển | 1 row = 1 shipment |
| `fact_shipment_tracking` | Lịch sử tracking | 1 row = 1 cập nhật trạng thái |
| `fact_chat_history` | Lịch sử chat AI | 1 row = 1 tin nhắn |
| `fact_submitted_reports` | Báo cáo cuối ngày | 1 row = 1 báo cáo |

## Các quyết định thiết kế

### 1. Tại sao Snowflake thay vì Star Schema?
- Categories có **hierarchy** (parent-child) → cần sub-dimension
- Cities thuộc Regions → 2 cấp
- Giảm data redundancy trong dimension tables

### 2. Tại sao SERIAL thay vì UUID?
- Dễ debug, dễ đọc trong dev
- Performance tốt hơn cho JOIN
- PostgreSQL SERIAL là auto-increment đơn giản

### 3. GENERATED ALWAYS AS (Computed Columns)
```sql
-- fact_inventory_stocks
quantity_available DECIMAL GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED;

-- fact_order_items  
line_subtotal DECIMAL GENERATED ALWAYS AS (quantity * unit_price) STORED;
line_total DECIMAL GENERATED ALWAYS AS ((quantity * unit_price) - discount_per_item) STORED;
```
→ Đảm bảo tính toàn vẹn, không cần tính toán thủ công.

### 4. JSONB cho Submitted Reports
```sql
-- Snapshot data lưu dạng JSONB
revenue_summary JSONB,
by_payment_method JSONB,
top_products JSONB
```
→ Linh hoạt, không cần thay đổi schema khi thêm metrics mới.

### 5. Index Strategy
- **FK columns**: Tự động index qua constraints
- **Search columns**: `code`, `is_active`, `status`
- **Date columns**: `date_key`, `created_at`
- **Composite**: `(store_id, variant_id)` cho inventory

## ER Diagram

Xem ER Diagram đầy đủ trong **CloudBeaver** (http://localhost:8978):
1. Kết nối database
2. Click phải schema `public` → **View Diagram**
