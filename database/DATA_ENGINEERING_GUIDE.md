# 📚 Hướng Dẫn Chi Tiết: Incremental Data Loading cho Data Engineer# Incremental Data Generator - Data Engineering Guide



## Mục lục## 📋 Tổng quan

1. [Tổng quan về Incremental Loading](#1-tổng-quan-về-incremental-loading)

2. [So sánh với cách truyền thống](#2-so-sánh-với-cách-truyền-thống)Đây là hệ thống sinh dữ liệu **INCREMENTAL** cho Supermarket Management System, được thiết kế để mô phỏng quy trình Data Engineering trong production.

3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)

4. [Chi tiết từng bước xử lý](#4-chi-tiết-từng-bước-xử-lý)### Điểm khác biệt so với seed truyền thống

5. [Data Quality và các vấn đề thực tế](#5-data-quality-và-các-vấn-đề-thực-tế)

6. [Slowly Changing Dimensions (SCD)](#6-slowly-changing-dimensions-scd)| Seed Truyền Thống | Incremental Generator |

7. [Thực hành với hệ thống](#7-thực-hành-với-hệ-thống)|-------------------|----------------------|

| TRUNCATE + INSERT ALL | Append-only, không xóa data |

---| Chạy 1 lần | Chạy theo ngày |

| Data tĩnh | Data tăng dần theo thời gian |

## 1. Tổng quan về Incremental Loading| Random đều | Phân phối thực tế (Pareto, Normal) |

| Không có outliers | Có outliers, NULL values, anomalies |

### 1.1 Incremental Loading là gì?

## 🏗️ Kiến trúc

**Incremental Loading** (Tải dữ liệu tăng dần) là kỹ thuật chỉ tải **dữ liệu MỚI hoặc THAY ĐỔI** vào hệ thống, thay vì tải lại toàn bộ dữ liệu mỗi lần.

```

```┌─────────────────────────────────────────────────────────────┐

+------------------------------------------------------------------+│                    MASTER FUNCTION                          │

|                    FULL LOAD (Truyền thống)                      |│                generate_daily_data(date)                    │

+------------------------------------------------------------------+└─────────────────┬───────────────────────────────────────────┘

|  Ngày 1: Xóa hết -> Load 1000 records                            |                  │

|  Ngày 2: Xóa hết -> Load 1050 records (cả cũ + mới)              |    ┌─────────────┼─────────────┬─────────────┐

|  Ngày 3: Xóa hết -> Load 1100 records (cả cũ + mới)              |    ▼             ▼             ▼             ▼

|                                                                  |┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐

|  [X] Tốn thời gian, tài nguyên                                   |│ Orders  │ │Inventory │ │ Customer │ │  Price   │

|  [X] Có thể mất dữ liệu nếu lỗi giữa chừng                       |│Generator│ │ Trans.   │ │  Tiers   │ │ Changes  │

+------------------------------------------------------------------+└─────────┘ └──────────┘ └──────────┘ └──────────┘

    │             │             │             │

+------------------------------------------------------------------+    ▼             ▼             ▼             ▼

|                  INCREMENTAL LOAD (Hiện đại)                     |┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐

+------------------------------------------------------------------+│  fact_  │ │  fact_   │ │   dim_   │ │   dim_   │

|  Ngày 1: Load 1000 records (initial load)                        |│ orders  │ │inventory_│ │customers │ │ product_ │

|  Ngày 2: Chỉ load 50 records MỚI -> Tổng: 1050                   |│         │ │  trans   │ │          │ │ variants │

|  Ngày 3: Chỉ load 50 records MỚI -> Tổng: 1100                   |└─────────┘ └──────────┘ └──────────┘ └──────────┘

|                                                                  |```

|  [V] Nhanh hơn nhiều                                             |

|  [V] Ít rủi ro, có thể retry từng ngày                           |## 📊 Data Quality Issues (Được mô phỏng)

+------------------------------------------------------------------+

```### 1. NULL Values

- **30% orders** không có `customer_id` (khách lẻ - walk-in)

### 1.2 Tại sao dùng Incremental Loading?- **5% orders** thiếu `payment_method`

- **10% inventory transactions** không có `reference_code`

| Tiêu chí | Full Load | Incremental Load |

|----------|-----------|------------------|### 2. Outliers

| Thời gian xử lý | Lâu (load tất cả) | Nhanh (chỉ load mới) |- **2% orders** là đơn sỉ (10-50 items/order)

| Tài nguyên | Tốn nhiều CPU/RAM | Tiết kiệm |- **3% line items** có số lượng lớn (10-100 units)

| Downtime | Có thể có | Không |- **Ngày Flash Sale**: volume tăng 400-600%

| Khả năng retry | Khó (phải chạy lại toàn bộ) | Dễ (retry từng ngày) |

| Lịch sử dữ liệu | Có thể mất | Giữ nguyên |### 3. Phân phối dữ liệu

| Phù hợp với | Bảng nhỏ, ít thay đổi | Bảng lớn, thay đổi hàng ngày |- **Order volume**: Normal distribution (μ=80, σ=20)

- **Items per order**: Pareto distribution (α=2.5)

### 1.3 Trong dự án Supermarket- **Quantity per item**: Pareto distribution (α=3.0)

- **Customer selection**: Weighted by tier (VIP mua nhiều hơn)

```

Mỗi ngày siêu thị có:## 🔧 Cách sử dụng

├── 50-300 đơn hàng mới (fact_orders)

├── 150-900 sản phẩm bán ra (fact_order_items)### Cài đặt

├── 50-500 giao dịch kho (fact_inventory_transactions)

└── Cập nhật tồn kho (fact_inventory_stocks)```sql

-- 1. Chạy schema (nếu chưa có)

-> Incremental load phù hợp vì dữ liệu tăng liên tục theo ngày\i schema.sql

```

-- 2. Chạy seed ban đầu (dimensions)

---\i seed.sql



## 2. So sánh với cách truyền thống-- 3. Cài đặt generator functions

\i incremental_data_generator.sql

### 2.1 Cách truyền thống (seed.sql)```



```sql### Sinh data cho 1 ngày

-- Cách cũ: TRUNCATE + INSERT tất cả

TRUNCATE TABLE fact_orders CASCADE;```sql

-- Sinh data tự động (volume theo ngày trong tuần)

INSERT INTO fact_orders (order_code, date_key, customer_id, ...)SELECT * FROM generate_daily_data('2026-02-01');

VALUES 

    ('DH001', '2026-01-01', 1, ...),-- Sinh với số lượng orders cố định

    ('DH002', '2026-01-01', 2, ...),SELECT * FROM generate_daily_orders('2026-02-01', 150);

    -- ... hàng nghìn dòng```

    ('DH999', '2026-01-15', 50, ...);

```### Backfill nhiều ngày



**Vấn đề:**```sql

- [X] Dữ liệu cố định, không thay đổi theo thời gian-- Backfill 1 tháng

- [X] Không mô phỏng được tình huống thực tếSELECT * FROM backfill_daily_data('2026-02-01', '2026-02-28');

- [X] Mỗi lần chạy lại -> mất hết dữ liệu cũ

-- Backfill cả năm (chạy vào ban đêm)

### 2.2 Cách Incremental (incremental_data_generator.sql)SELECT * FROM backfill_daily_data('2026-01-01', '2026-12-31', TRUE);

```

```sql

-- Cách mới: APPEND dữ liệu mới### Mô phỏng sự kiện đặc biệt

-- Không xóa gì cả, chỉ thêm

```sql

-- Ngày 2026-01-28:-- Flash Sale (Black Friday, 11/11, etc.)

SELECT * FROM generate_daily_data('2026-01-28');SELECT * FROM generate_flash_sale_day('2026-11-27', 5.0);

-- -> Thêm ~80 orders mới cho ngày 28/01

-- Ngày có sự cố hệ thống (data loss)

-- Ngày 2026-01-29:SELECT * FROM generate_incident_day('2026-03-15', 0.25);

SELECT * FROM generate_daily_data('2026-01-29');```

-- -> Thêm ~80 orders mới cho ngày 29/01

-- -> Dữ liệu ngày 28 vẫn còn nguyên!### Monitoring & Data Quality

```

```sql

**Lợi ích:**-- Xem summary 1 ngày

- [V] Dữ liệu tăng dần giống productionSELECT * FROM get_daily_summary('2026-02-01');

- [V] Có lịch sử theo thời gian

- [V] Có thể phân tích xu hướng, so sánh các ngày-- Check data quality issues

SELECT * FROM check_data_quality('2026-02-01');

---SELECT * FROM check_data_quality();  -- Toàn bộ

```

## 3. Kiến trúc hệ thống

## 📈 Output mẫu

### 3.1 Sơ đồ tổng quan

### generate_daily_data()

``````

                         +-------------------------------------+📅 Date: 2026-02-01 | Weekend: FALSE | Promo: FALSE | Target orders: 82

                         |         DAILY SCHEDULER            |✅ Orders created: 82 | Items: 234 | Revenue: 15,432,000

                         |   (chạy lúc 00:05 mỗi ngày)        |📦 Inventory: Imports: 12 | Exports: 234 | Adjustments: 2 | Damages: 0

                         +-----------------+-------------------+```

                                           |

                                           v### check_data_quality()

+-------------------------------------------------------------------------+```

|                        generate_daily_data(p_date)                      |issue_type                          | issue_count | severity

|                           MASTER FUNCTION                               |------------------------------------|-------------|----------

+-------+-----------------------+-----------------------+-----------------+Orders missing payment_method       | 15          | MEDIUM

        |                       |                       |Walk-in orders (no customer)        | 248         | INFO

        v                       v                       vInventory trans missing reference   | 8           | LOW

+---------------+       +---------------+       +-----------------------+Negative inventory                  | 3           | HIGH

|  STEP 1       |       |  STEP 2       |       |  STEP 3 & 4           |High value orders (>10M)            | 5           | INFO

|  Orders       |       |  Inventory    |       |  Dimension Updates    |```

|  Generator    |       |  Transactions |       |  (SCD Type 1)         |

+-------+-------+       +-------+-------+       +-----------+-----------+## 🗓️ Schedule Job (Production)

        |                       |                           |

        v                       v                           v### PostgreSQL pg_cron

+---------------+       +---------------+       +-----------------------+

| fact_orders   |       | fact_inv_     |       | dim_customers         |```sql

| fact_order_   |       | transactions  |       | dim_product_variants  |-- Cài đặt pg_cron extension

| items         |       | fact_inv_     |       |                       |CREATE EXTENSION pg_cron;

|               |       | stocks        |       |                       |

+---------------+       +---------------+       +-----------------------+-- Schedule job chạy lúc 00:05 mỗi ngày

```SELECT cron.schedule(

    'daily-data-gen',

### 3.2 Các bảng liên quan    '5 0 * * *',

    $$SELECT generate_daily_data(CURRENT_DATE - 1)$$

```sql);

-- FACT TABLES (Dữ liệu giao dịch - tăng mỗi ngày)```

fact_orders              -- Đơn hàng

fact_order_items         -- Chi tiết đơn hàng  ### Windows Task Scheduler

fact_inventory_transactions  -- Giao dịch kho (nhập/xuất/điều chỉnh)

fact_inventory_stocks    -- Tồn kho hiện tại (cập nhật)```powershell

# Tạo script PowerShell

-- DIMENSION TABLES (Dữ liệu tham chiếu - ít thay đổi)$sql = "SELECT generate_daily_data(CURRENT_DATE - 1);"

dim_customers           -- Khách hàng (SCD: nâng hạng)psql -U postgres -d supermarket -c $sql

dim_product_variants    -- Sản phẩm (SCD: giá thay đổi)

dim_stores             -- Cửa hàng# Lên lịch chạy hàng ngày

dim_time               -- Thời gianschtasks /create /tn "SupermarketDataGen" /tr "powershell.exe C:\scripts\daily_gen.ps1" /sc daily /st 00:05

``````



---## 🎯 Best Practices



## 4. Chi tiết từng bước xử lý### 1. Idempotent Operations

- Mỗi `order_code` chứa ngày: `DH20260201xxxx`

### 4.1 STEP 1: Sinh đơn hàng (generate_daily_orders)- Có check duplicate trước khi insert

- Có thể chạy lại cùng ngày mà không bị trùng

#### 4.1.1 Xác định số lượng đơn hàng

### 2. Transaction Safety

```sql- Mỗi ngày được xử lý trong 1 transaction

-- Bước 1: Kiểm tra ngày đặc biệt- Nếu fail, có thể retry từ ngày đó

SELECT * FROM is_special_day('2026-01-29');

### 3. Monitoring

-- Kết quả:- Chạy `check_data_quality()` hàng tuần

-- is_weekend | is_promo_day | is_holiday | volume_multiplier- Alert khi có negative inventory

-- FALSE      | FALSE        | FALSE      | 1.0- Track daily volume trends

```

## 📁 File Structure

**Logic xác định số đơn:**

```

```database/

Base orders = random_normal(20, 5) x 4 cửa hàng├── schema.sql                      # Database schema

            = khoảng 80 đơn/ngày (dao động 60-100)├── seed.sql                        # Initial dimensions & static data

├── incremental_data_generator.sql  # Generator functions

Nếu Weekend (Thứ 7, CN):├── backfill_q1_2026.sql           # Backfill script Q1 2026

    orders = base x 1.5 = khoảng 120 đơn└── DATA_ENGINEERING_GUIDE.md       # This file

```

Nếu Ngày khuyến mãi (1, 15, cuối tháng):

    orders = base x 2.0~3.0 = khoảng 160-240 đơn## 🔍 Advanced: Customization



Nếu Cả weekend + promo:### Thêm product mới vào weighted selection

    orders = base x 1.5 x 2.5 = khoảng 300 đơn

``````sql

-- Sửa function weighted_random_variant()

#### 4.1.2 Tạo mã đơn hàng (Idempotent)-- Thêm category_id vào danh sách "hot"

WHEN p.category_id IN (11, 12, 14, NEW_CATEGORY_ID) THEN RANDOM() * 0.4

```sql```

-- Mã đơn hàng = DH + YYYYMMDD + sequence

-- Ví dụ: DH202601290001, DH202601290002, ...### Thay đổi customer selection weights



v_order_code := 'DH' || TO_CHAR(p_date, 'YYYYMMDD') || LPAD(i::TEXT, 4, '0');```sql

-- Sửa function weighted_random_customer()

-- Kiểm tra duplicate trước khi insert-- Điều chỉnh probability cho walk-in

IF EXISTS (SELECT 1 FROM fact_orders WHERE order_code = v_order_code) THENIF v_rand < 0.20 THEN  -- Giảm từ 30% xuống 20%

    CONTINUE;  -- Bỏ qua nếu đã tồn tại    RETURN NULL;

END IF;END IF;

``````



**Tại sao quan trọng?**### Thêm ngày lễ mới

- Nếu script bị lỗi giữa chừng và chạy lại -> không bị duplicate

- Mỗi order_code là UNIQUE cho ngày đó```sql

- Có thể trace được đơn hàng thuộc ngày nào-- Sửa function is_special_day()

v_is_holiday := v_is_holiday OR 

#### 4.1.3 Chọn khách hàng (Weighted Random)    (v_month = 12 AND v_day IN (24, 25));  -- Christmas

```

```sql

-- 30% đơn hàng KHÔNG có customer_id (khách lẻ/walk-in)## 📞 Support

IF RANDOM() < 0.30 THEN

    RETURN NULL;  -- DATA QUALITY ISSUE: NULL customerNếu gặp vấn đề:

END IF;1. Check `dim_time` có đủ ngày cần generate

2. Verify inventory stocks > 0 cho các products

-- 70% còn lại: chọn customer với trọng số3. Kiểm tra sequences không bị conflict

-- VIP được chọn nhiều hơn vì họ mua thường xuyên

ORDER BY ---

    CASE customer_group_id*Được thiết kế bởi Data Engineering Team*

        WHEN 1 THEN RANDOM() * 0.1   -- VIP: 10% random -> được chọn nhiều*Version 1.0 | January 2026*

        WHEN 2 THEN RANDOM() * 0.3   -- Gold: 30%
        WHEN 3 THEN RANDOM() * 0.5   -- Silver: 50%
        WHEN 4 THEN RANDOM() * 0.7   -- Bronze: 70%
        ELSE RANDOM()                 -- Normal: 100%
    END
```

**Giải thích:**
```
Random * 0.1 cho ra số từ 0.00 đến 0.10
Random * 1.0 cho ra số từ 0.00 đến 1.00

ORDER BY ASC (nhỏ nhất lên đầu):
-> VIP (0.00-0.10) thường nhỏ nhất -> được chọn nhiều
-> Normal (0.00-1.00) có thể lớn -> ít được chọn
```

#### 4.1.4 Sinh chi tiết đơn hàng (Order Items)

```sql
-- Số items per order: Phân phối Pareto (Long-tail)
-- Nhiều đơn 1-3 items, ít đơn nhiều items

v_num_items := random_pareto(1, 2.5);

-- 2% là đơn sỉ (OUTLIER): 10-50 items
IF RANDOM() < 0.02 THEN
    v_num_items := FLOOR(RANDOM() * 40 + 10);
END IF;
```

**Phân phối Pareto (80/20 rule):**
```
                      |
Số đơn hàng           |####################################
                      |##################
                      |#############
                      |########
                      |######
                      |####
                      |##
                      |#
                      +--------------------------------------
                        1   2   3   4   5   6   7   8   9  10+
                                  Số items/đơn

80% đơn hàng có 1-3 items
15% đơn hàng có 4-6 items
5% đơn hàng có 7+ items
```

#### 4.1.5 Tính tổng đơn hàng

```sql
-- Subtotal = Tổng (quantity x unit_price) của tất cả items
-- Discount = Giảm giá theo customer_group (nếu đủ điều kiện)
-- Final = Subtotal - Discount

UPDATE fact_orders
SET subtotal = v_subtotal,
    discount_amount = v_discount,
    final_amount = v_subtotal - v_discount
WHERE id = v_order_id;
```

### 4.2 STEP 2: Sinh giao dịch kho (generate_daily_inventory_transactions)

#### 4.2.1 EXPORT - Xuất kho (từ orders)

```sql
-- Mỗi order item completed -> tạo 1 giao dịch xuất kho

FOR r_order IN 
    SELECT * FROM fact_orders 
    WHERE date_key = p_date AND status = 'completed'
LOOP
    FOR r_item IN
        SELECT * FROM fact_order_items WHERE order_id = r_order.id
    LOOP
        -- Tạo transaction EXPORT
        INSERT INTO fact_inventory_transactions (
            transaction_type_id = 2,  -- EXPORT
            quantity_change = -r_item.quantity,  -- Số âm = xuất
            ...
        );
        
        -- Cập nhật tồn kho
        UPDATE fact_inventory_stocks
        SET quantity_on_hand = quantity_on_hand - r_item.quantity;
    END LOOP;
END LOOP;
```

**Luồng dữ liệu:**
```
fact_orders (completed)
    |
    +-- Order #1: 3 items
    |   +-- Item A: qty=2 -> EXP20260129-00001
    |   +-- Item B: qty=1 -> EXP20260129-00002
    |   +-- Item C: qty=5 -> EXP20260129-00003
    |
    +-- Order #2: 2 items
    |   +-- Item A: qty=3 -> EXP20260129-00004
    |   +-- Item D: qty=1 -> EXP20260129-00005
    |
    +-- ... (tiếp tục cho tất cả orders)
```

#### 4.2.2 IMPORT - Nhập kho (bổ sung hàng)

```sql
-- Mỗi ngày, check sản phẩm dưới min_stock -> nhập thêm

FOR r_low_stock IN
    SELECT * FROM fact_inventory_stocks
    WHERE quantity_on_hand < min_stock_level
LOOP
    -- 70% được bổ sung (30% delay - mô phỏng thực tế)
    IF RANDOM() < 0.70 THEN
        -- Nhập đến 80% max_stock
        v_quantity := max_stock_level * 0.8 - quantity_on_hand;
        
        INSERT INTO fact_inventory_transactions (
            transaction_type_id = 1,  -- IMPORT
            quantity_change = v_quantity,  -- Số dương = nhập
            ...
        );
    END IF;
END LOOP;
```

#### 4.2.3 ADJUSTMENT - Điều chỉnh kiểm kê

```sql
-- Mỗi ngày có 1-3 điều chỉnh ngẫu nhiên
-- (Thực tế: kiểm kê phát hiện chênh lệch)

v_quantity := FLOOR(RANDOM() * 21 - 10);  -- -10 đến +10

INSERT INTO fact_inventory_transactions (
    transaction_type_id = 4,  -- ADJUSTMENT
    quantity_change = v_quantity,
    notes = 'Kiểm kê hàng ngày'
);
```

#### 4.2.4 DAMAGE - Hàng hỏng

```sql
-- 5% chance có hàng hỏng mỗi ngày
-- Thường là sản phẩm tươi sống, sữa

IF RANDOM() < 0.05 THEN
    -- Chọn sản phẩm category sữa/tươi sống
    SELECT * FROM fact_inventory_stocks fis
    JOIN dim_products p ON ...
    WHERE p.category_id IN (14, 15, 6);  -- Sữa, sữa chua, tươi sống
    
    INSERT INTO fact_inventory_transactions (
        transaction_type_id = 7,  -- DAMAGE
        quantity_change = -v_quantity,
        notes = 'Sản phẩm hư hỏng/hết hạn'
    );
END IF;
```

### 4.3 STEP 3 & 4: Cập nhật Dimensions

#### 4.3.1 Nâng hạng khách hàng (Chủ nhật)

```sql
-- Chỉ chạy vào Chủ nhật
IF EXTRACT(DOW FROM p_date) = 0 THEN
    
    -- Cập nhật Lifetime Value
    UPDATE dim_customers c
    SET total_lifetime_value = (
        SELECT SUM(final_amount) FROM fact_orders
        WHERE customer_id = c.id AND status = 'completed'
    );
    
    -- Xác định hạng mới dựa trên LTV
    v_new_group_id := CASE
        WHEN total_lifetime_value >= 5,000,000 THEN 1  -- VIP
        WHEN total_lifetime_value >= 2,000,000 THEN 2  -- Gold
        WHEN total_lifetime_value >= 1,000,000 THEN 3  -- Silver
        WHEN total_lifetime_value >= 500,000 THEN 4    -- Bronze
        ELSE 5                                          -- Normal
    END;
    
    -- Update nếu thay đổi (SCD Type 1)
    UPDATE dim_customers
    SET customer_group_id = v_new_group_id
    WHERE id = v_customer_id;
    
END IF;
```

#### 4.3.2 Thay đổi giá (Ngày 1 và 15)

```sql
-- Chỉ chạy ngày 1 hoặc 15 hàng tháng
IF EXTRACT(DAY FROM p_date) IN (1, 15) THEN
    
    -- Random 3% sản phẩm thay đổi giá
    -- Thay đổi -5% đến +10%
    v_price_change_pct := (RANDOM() * 0.15 - 0.05);
    
    UPDATE dim_product_variants
    SET selling_price = selling_price * (1 + v_price_change_pct)
    WHERE id IN (SELECT id ORDER BY RANDOM() LIMIT 3%);
    
END IF;
```

---

## 5. Data Quality và các vấn đề thực tế

### 5.1 NULL Values (Dữ liệu thiếu)

| Trường | Tỉ lệ NULL | Lý do thực tế |
|--------|------------|---------------|
| `customer_id` | 30% | Khách lẻ không đăng ký thành viên |
| `payment_method` | 5% | Nhân viên quên nhập |
| `reference_type` (inventory) | 10% | Nhập hàng gấp chưa có PO |

```sql
-- Ví dụ: Check NULL values
SELECT 
    COUNT(*) FILTER (WHERE customer_id IS NULL) AS null_customer,
    COUNT(*) FILTER (WHERE payment_method IS NULL) AS null_payment
FROM fact_orders;
```

### 5.2 Outliers (Giá trị bất thường)

```
+------------------------------------------------------------------+
|                    PHÂN PHỐI GIÁ TRỊ ĐƠN HÀNG                    |
+------------------------------------------------------------------+
|                                                                  |
|  ########################################  < 500K (60%)          |
|  ######################                    500K-1M (25%)         |
|  #########                                 1M-2M (10%)           |
|  ###                                       2M-5M (4%)            |
|  #                                         > 5M (1%) <- OUTLIER  |
|                                                                  |
|  Outliers:                                                       |
|  - Đơn sỉ: 10-50 items, giá trị 5-20 triệu                      |
|  - Đơn VIP: Mua số lượng lớn sản phẩm đắt tiền                  |
|                                                                  |
+------------------------------------------------------------------+
```

### 5.3 Data Quality Check

```sql
-- Kiểm tra data quality
SELECT * FROM check_data_quality('2026-01-29');

-- Kết quả:
-- issue_type                        | issue_count | severity
-- ----------------------------------|-------------|----------
-- Orders missing payment_method     | 4           | MEDIUM
-- Walk-in orders (no customer)      | 25          | INFO
-- Inventory trans missing reference | 2           | LOW
-- Negative inventory                | 3           | HIGH
-- High value orders (>10M)          | 1           | INFO
```

---

## 6. Slowly Changing Dimensions (SCD)

### 6.1 SCD là gì?

Dimension data thỉnh thoảng thay đổi. Có 3 cách xử lý:

```
+------------------------------------------------------------------+
|                        SCD TYPE 1                                |
|                    (Ghi đè - Overwrite)                          |
+------------------------------------------------------------------+
|  TRƯỚC:                                                          |
|  customer_id=1, name='Nguyễn Văn A', group='Silver'             |
|                                                                  |
|  SAU KHI UPDATE:                                                 |
|  customer_id=1, name='Nguyễn Văn A', group='Gold'  <- Ghi đè    |
|                                                                  |
|  [V] Đơn giản                                                    |
|  [X] Mất lịch sử (không biết trước đó là Silver)                |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|                        SCD TYPE 2                                |
|                 (Thêm row mới - Add new row)                     |
+------------------------------------------------------------------+
|  TRƯỚC:                                                          |
|  id=1, customer_id=1, group='Silver', valid_from='2025-01-01',  |
|        valid_to='9999-12-31', is_current=TRUE                    |
|                                                                  |
|  SAU KHI UPDATE:                                                 |
|  id=1, customer_id=1, group='Silver', valid_from='2025-01-01',  |
|        valid_to='2026-01-29', is_current=FALSE  <- Close row cũ |
|  id=2, customer_id=1, group='Gold', valid_from='2026-01-29',    |
|        valid_to='9999-12-31', is_current=TRUE   <- Thêm row mới |
|                                                                  |
|  [V] Giữ toàn bộ lịch sử                                         |
|  [X] Phức tạp hơn, bảng lớn hơn                                  |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|                        SCD TYPE 3                                |
|              (Thêm cột - Add new column)                         |
+------------------------------------------------------------------+
|  TRƯỚC:                                                          |
|  customer_id=1, current_group='Silver', previous_group=NULL      |
|                                                                  |
|  SAU KHI UPDATE:                                                 |
|  customer_id=1, current_group='Gold', previous_group='Silver'   |
|                                                                  |
|  [V] Giữ được 1 level lịch sử                                    |
|  [X] Chỉ giữ được 1 giá trị cũ                                   |
+------------------------------------------------------------------+
```

### 6.2 Trong dự án này (SCD Type 1)

Chúng ta dùng **SCD Type 1** vì:
- Đơn giản, phù hợp cho mục đích học tập
- Không cần phân tích lịch sử quá sâu
- Các thay đổi (nâng hạng, giá) không cần track chi tiết

```sql
-- Ví dụ: Update customer tier (SCD Type 1)
UPDATE dim_customers
SET customer_group_id = v_new_group_id  -- Ghi đè trực tiếp
WHERE id = v_customer_id;

-- Ví dụ: Update giá sản phẩm (SCD Type 1)
UPDATE dim_product_variants
SET selling_price = v_new_price  -- Ghi đè trực tiếp
WHERE id = v_variant_id;
```

---

## 7. Thực hành với hệ thống

### 7.1 Quy trình hàng ngày

```
+------------------------------------------------------------------+
|                    QUY TRÌNH HÀNG NGÀY                           |
+------------------------------------------------------------------+
|                                                                  |
|  00:05  +-------------------------------------+                  |
|    |    |  Daily Scheduler chạy               |                  |
|    |    |  generate_daily_data(CURRENT_DATE-1)|                  |
|    |    +-------------------------------------+                  |
|    |                     |                                       |
|    |                     v                                       |
|  00:06  +-------------------------------------+                  |
|    |    |  Sinh 50-100 orders                 |                  |
|    |    |  + 150-300 order items              |                  |
|    |    +-------------------------------------+                  |
|    |                     |                                       |
|    |                     v                                       |
|  00:10  +-------------------------------------+                  |
|    |    |  Sinh inventory transactions        |                  |
|    |    |  + Cập nhật stock levels            |                  |
|    |    +-------------------------------------+                  |
|    |                     |                                       |
|    |                     v                                       |
|  00:12  +-------------------------------------+                  |
|    |    |  Update dimensions (nếu cần)        |                  |
|    |    |  Customer tiers, Product prices     |                  |
|    |    +-------------------------------------+                  |
|    |                     |                                       |
|    v                     v                                       |
|  00:15  +-------------------------------------+                  |
|         |  HOÀN THÀNH                         |                  |
|         |  Log kết quả, gửi alert nếu lỗi     |                  |
|         +-------------------------------------+                  |
|                                                                  |
+------------------------------------------------------------------+
```

### 7.2 Commands thực hành

```powershell
# 1. Sinh data cho ngày hôm nay
.\scripts\generate-today.ps1

# 2. Xem kết quả
docker exec -i minimart_postgres psql -U admin -d minimart_db -c "
    SELECT * FROM get_daily_summary(CURRENT_DATE);
"

# 3. Check data quality
.\scripts\check-quality.ps1

# 4. Xem trend 7 ngày gần nhất
docker exec -i minimart_postgres psql -U admin -d minimart_db -c "
    SELECT 
        date_key,
        COUNT(*) AS orders,
        SUM(final_amount) AS revenue,
        AVG(final_amount) AS avg_order_value
    FROM fact_orders
    WHERE date_key >= CURRENT_DATE - 7
    GROUP BY date_key
    ORDER BY date_key;
"
```

### 7.3 Bài tập thực hành

#### Bài 1: Phân tích NULL values
```sql
-- Đếm tỉ lệ NULL theo từng trường
SELECT 
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE customer_id IS NULL) AS null_customer,
    COUNT(*) FILTER (WHERE payment_method IS NULL) AS null_payment,
    ROUND(100.0 * COUNT(*) FILTER (WHERE customer_id IS NULL) / COUNT(*), 2) AS pct_null_customer
FROM fact_orders;
```

#### Bài 2: Tìm outliers
```sql
-- Tìm đơn hàng giá trị cao bất thường
SELECT 
    order_code, date_key, final_amount,
    (SELECT AVG(final_amount) FROM fact_orders) AS avg_all,
    final_amount / (SELECT AVG(final_amount) FROM fact_orders) AS times_avg
FROM fact_orders
WHERE final_amount > (SELECT AVG(final_amount) * 5 FROM fact_orders)
ORDER BY final_amount DESC;
```

#### Bài 3: Phân tích Pareto
```sql
-- Kiểm tra 80/20 rule: 20% sản phẩm chiếm 80% doanh số?
WITH product_sales AS (
    SELECT 
        pv.id,
        p.name,
        SUM(oi.quantity * oi.unit_price) AS total_sales
    FROM fact_order_items oi
    JOIN dim_product_variants pv ON pv.id = oi.variant_id
    JOIN dim_products p ON p.id = pv.product_id
    GROUP BY pv.id, p.name
),
ranked AS (
    SELECT 
        *,
        SUM(total_sales) OVER (ORDER BY total_sales DESC) AS cumulative_sales,
        SUM(total_sales) OVER () AS grand_total,
        ROW_NUMBER() OVER (ORDER BY total_sales DESC) AS rank,
        COUNT(*) OVER () AS total_products
    FROM product_sales
)
SELECT 
    rank,
    name,
    total_sales,
    ROUND(100.0 * cumulative_sales / grand_total, 2) AS cumulative_pct,
    ROUND(100.0 * rank / total_products, 2) AS product_pct
FROM ranked
WHERE ROUND(100.0 * rank / total_products, 2) <= 25;  -- Top 25% products
```

---

## Tóm tắt

1. **Incremental Loading** = Chỉ load dữ liệu mới, không xóa dữ liệu cũ
2. **Idempotent** = Chạy nhiều lần cho kết quả giống nhau (không duplicate)
3. **Data Quality Issues** = NULL values, outliers, missing data (mô phỏng thực tế)
4. **SCD Type 1** = Ghi đè dimension khi có thay đổi
5. **Daily Process** = Orders -> Inventory -> Dimension Updates

---

*Tài liệu được viết cho mục đích học tập Data Engineering*
*Version 1.0 | January 2026*
