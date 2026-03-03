-- =====================================================
-- SUPERMARKET MANAGEMENT SYSTEM - INCREMENTAL DATA GENERATOR
-- Version: 2.0 | Date: 25/02/2026
-- Author: Data Engineering Team
-- =====================================================


-- TỔNG QUAN KIẾN TRÚC DATA ENGINEERING
-- =====================================
-- File này mô phỏng quy trình INCREMENTAL LOAD trong production:
-- 1. Dữ liệu được sinh THEO NGÀY (không truncate)
-- 2. Mỗi lần chạy = 1 ngày nghiệp vụ
-- 3. Mô phỏng các vấn đề data quality thực tế:
--    - NULL values (khách lẻ, missing data)
--    - Outliers (đơn sỉ, flash sale)
--    - Long-tail distribution (nhiều đơn nhỏ, ít đơn lớn)
-- 4. SCD Type 1 cho dimension changes
--
-- CÁCH SỬ DỤNG:
-- =====================================
-- 1. Chạy 1 ngày cụ thể:
--    SELECT generate_daily_data('2026-01-15');
--
-- 2. Backfill nhiều ngày:
--    SELECT backfill_daily_data('2026-01-01', '2026-01-31');
--
-- 3. Chỉ sinh orders:
--    SELECT generate_daily_orders('2026-01-15', NULL);
--
-- 4. Ngày có khuyến mãi (200-300 đơn):
--    SELECT generate_daily_orders('2026-01-15', 250);
--
-- =====================================================

-- =========================
-- HELPER FUNCTIONS
-- =========================

-- Function: Sinh số ngẫu nhiên theo phân phối Normal (Gaussian)
-- Mục đích: Dữ liệu thực tế tuân theo phân phối chuông, không phải uniform
CREATE OR REPLACE FUNCTION random_normal(
    p_mean DECIMAL,
    p_stddev DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    v_u1 DECIMAL;
    v_u2 DECIMAL;
    v_z0 DECIMAL;
BEGIN
    -- Box-Muller transform để sinh số theo phân phối Normal
    v_u1 := RANDOM();
    v_u2 := RANDOM();
    
    -- Tránh log(0)
    IF v_u1 < 0.0001 THEN v_u1 := 0.0001; END IF;
    
    v_z0 := SQRT(-2.0 * LN(v_u1)) * COS(2.0 * PI() * v_u2);
    
    RETURN p_mean + (v_z0 * p_stddev);
END;
$$ LANGUAGE plpgsql;

-- Function: Sinh số ngẫu nhiên theo phân phối Pareto (Long-tail)
-- Mục đích: Mô phỏng 80/20 rule - nhiều đơn nhỏ, ít đơn lớn
CREATE OR REPLACE FUNCTION random_pareto(
    p_min DECIMAL,     -- Giá trị tối thiểu
    p_alpha DECIMAL    -- Shape parameter (thường 1.5-3)
) RETURNS DECIMAL AS $$
BEGIN
    -- Pareto distribution: x = min / u^(1/alpha)
    -- Alpha càng lớn = tail càng ngắn
    RETURN p_min / POWER(RANDOM() + 0.0001, 1.0 / p_alpha);
END;
$$ LANGUAGE plpgsql;

-- Function: Quyết định có event đặc biệt trong ngày không
-- Mục đích: Mô phỏng ngày khuyến mãi, lễ, cuối tuần
CREATE OR REPLACE FUNCTION is_special_day(
    p_date DATE
) RETURNS TABLE (
    is_weekend BOOLEAN,
    is_promo_day BOOLEAN,
    is_holiday BOOLEAN,
    volume_multiplier DECIMAL
) AS $$
DECLARE
    v_dow INT;
    v_day INT;
    v_month INT;
    v_is_weekend BOOLEAN;
    v_is_promo BOOLEAN;
    v_is_holiday BOOLEAN;
    v_multiplier DECIMAL := 1.0;
BEGIN
    v_dow := EXTRACT(DOW FROM p_date);
    v_day := EXTRACT(DAY FROM p_date);
    v_month := EXTRACT(MONTH FROM p_date);
    
    -- Weekend check
    v_is_weekend := v_dow IN (0, 6);
    IF v_is_weekend THEN
        v_multiplier := v_multiplier * 1.5;
    END IF;
    
    -- Ngày khuyến mãi: 1, 15, cuối tháng, hoặc random 5%
    v_is_promo := v_day IN (1, 15, 28, 29, 30, 31) OR RANDOM() < 0.05;
    IF v_is_promo THEN
        v_multiplier := v_multiplier * CASE 
            WHEN v_day = 1 THEN 3.0      -- Đầu tháng sale lớn
            WHEN v_day = 15 THEN 2.5     -- Giữa tháng
            WHEN v_day >= 28 THEN 2.0    -- Cuối tháng
            ELSE 1.8                      -- Random promo
        END;
    END IF;
    
    -- Ngày lễ Việt Nam (simplified)
    v_is_holiday := (v_month = 1 AND v_day IN (1, 2)) OR          -- Tết Dương
                    (v_month = 4 AND v_day = 30) OR                -- 30/4
                    (v_month = 5 AND v_day = 1) OR                 -- 1/5
                    (v_month = 9 AND v_day = 2);                   -- 2/9
    IF v_is_holiday THEN
        v_multiplier := v_multiplier * 0.3; -- Lễ thường đóng cửa hoặc ít khách
    END IF;
    
    RETURN QUERY SELECT v_is_weekend, v_is_promo, v_is_holiday, v_multiplier;
END;
$$ LANGUAGE plpgsql;

-- Function: Chọn customer với xác suất có trọng số
-- Mục đích: Khách VIP mua nhiều hơn khách thường
CREATE OR REPLACE FUNCTION weighted_random_customer(
    p_city_id INT DEFAULT NULL
) RETURNS INT AS $$
DECLARE
    v_customer_id INT;
    v_rand DECIMAL;
BEGIN
    v_rand := RANDOM();
    
    -- 30% đơn hàng không có customer (khách lẻ) - DATA QUALITY ISSUE
    IF v_rand < 0.30 THEN
        RETURN NULL;
    END IF;
    
    -- Chọn customer với trọng số theo customer_group
    -- VIP (10%) > Gold (15%) > Silver (20%) > Bronze (25%) > Normal (30%)
    SELECT id INTO v_customer_id
    FROM dim_customers
    WHERE (p_city_id IS NULL OR city_id = p_city_id)
    ORDER BY 
        CASE customer_group_id
            WHEN 1 THEN RANDOM() * 0.1   -- VIP: ưu tiên cao nhất
            WHEN 2 THEN RANDOM() * 0.3   -- Gold
            WHEN 3 THEN RANDOM() * 0.5   -- Silver
            WHEN 4 THEN RANDOM() * 0.7   -- Bronze
            ELSE RANDOM()                 -- Normal
        END
    LIMIT 1;
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Chọn sản phẩm với xác suất theo popularity
-- Mục đích: Một số sản phẩm bán chạy hơn (mì gói, nước ngọt)
CREATE OR REPLACE FUNCTION weighted_random_variant() RETURNS INT AS $$
DECLARE
    v_variant_id INT;
BEGIN
    -- Sản phẩm FMCG (mì, nước ngọt, sữa) chiếm 60% doanh số
    SELECT pv.id INTO v_variant_id
    FROM dim_product_variants pv
    JOIN dim_products p ON p.id = pv.product_id
    WHERE pv.is_active = TRUE
    ORDER BY 
        CASE 
            WHEN p.category_id IN (11, 12, 14) THEN RANDOM() * 0.4  -- Mì, nước ngọt, sữa: hot
            WHEN p.category_id IN (13, 15, 16) THEN RANDOM() * 0.6  -- Nước ép, sữa chua, snack
            WHEN p.category_id IN (18, 19, 20) THEN RANDOM() * 0.8  -- Gia vị, gia dụng
            ELSE RANDOM()
        END
    LIMIT 1;
    
    RETURN v_variant_id;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- CORE GENERATOR FUNCTIONS
-- =========================

-- Function: Sinh orders cho 1 ngày
-- Tham số:
--   p_date: Ngày cần sinh data
--   p_expected_orders: Số đơn mong muốn (NULL = tự động tính theo ngày)
CREATE OR REPLACE FUNCTION generate_daily_orders(
    p_date DATE,
    p_expected_orders INT DEFAULT NULL
) RETURNS TABLE (
    orders_created INT,
    items_created INT,
    total_revenue DECIMAL,
    avg_order_value DECIMAL
) AS $$
DECLARE
    v_special_day RECORD;
    v_base_orders INT;
    v_actual_orders INT;
    v_order_count INT := 0;
    v_item_count INT := 0;
    v_total_revenue DECIMAL := 0;
    
    -- Order variables
    v_order_id INT;
    v_order_code VARCHAR(50);
    v_customer_id INT;
    v_store_id INT;
    v_staff_id INT;
    v_order_status VARCHAR(30);
    v_payment_status VARCHAR(30);
    v_payment_method VARCHAR(30);
    v_subtotal DECIMAL;
    v_discount DECIMAL;
    
    -- Item variables
    v_num_items INT;
    v_variant_id INT;
    v_quantity DECIMAL;
    v_unit_price DECIMAL;
    v_item_discount DECIMAL;
    
    -- Loop counter
    i INT;
    j INT;
    
    -- Tracking để tránh duplicate variants trong 1 order
    v_used_variants INT[];
BEGIN
    -- Kiểm tra ngày có trong dim_time không
    IF NOT EXISTS (SELECT 1 FROM dim_time WHERE date_key = p_date) THEN
        RAISE EXCEPTION 'Date % not found in dim_time. Please extend time dimension.', p_date;
    END IF;
    
    -- Lấy thông tin ngày đặc biệt
    SELECT * INTO v_special_day FROM is_special_day(p_date);
    
    -- Tính số đơn hàng base
    -- Ngày thường: 15-25 đơn/cửa hàng, có 4 cửa hàng bán lẻ
    v_base_orders := CASE 
        WHEN p_expected_orders IS NOT NULL THEN p_expected_orders
        ELSE FLOOR(random_normal(500, 100) ) -- 4 stores, ~80 orders/day base
    END;
    
    -- Apply multiplier cho ngày đặc biệt
    v_actual_orders := GREATEST(
        10, 
        LEAST(800, FLOOR(v_base_orders * v_special_day.volume_multiplier))
    );
    
    RAISE NOTICE '📅 Date: % | Weekend: % | Promo: % | Target orders: %',
        p_date, v_special_day.is_weekend, v_special_day.is_promo_day, v_actual_orders;
    
    -- =========================
    -- SINH TỪNG ĐƠN HÀNG
    -- =========================
    FOR i IN 1..v_actual_orders LOOP
        -- Tạo order_code unique: POS-YYYYMMDD-XXXXX (giống POS frontend)
        v_order_code := 'POS-' || TO_CHAR(p_date, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 5, '0');
        
        -- Kiểm tra duplicate (idempotent)
        IF EXISTS (SELECT 1 FROM fact_orders WHERE order_code = v_order_code) THEN
            CONTINUE;
        END IF;
        
        -- Chọn store (1-4, không bao gồm kho)
        v_store_id := FLOOR(RANDOM() * 4 + 1)::INT;
        
        -- Chọn staff theo store
        v_staff_id := v_store_id + 1; -- staff_hn1=2, staff_hn2=3, ...
        
        -- Chọn customer (có thể NULL - khách lẻ)
        v_customer_id := weighted_random_customer();
        
        -- Xác định status và payment
        -- 90% completed, 5% pending, 5% cancelled
        IF RANDOM() < 0.90 THEN
            v_order_status := 'completed';
            v_payment_status := 'paid';
        ELSIF RANDOM() < 0.50 THEN
            v_order_status := 'pending';
            v_payment_status := 'unpaid';
        ELSE
            v_order_status := 'cancelled';
            v_payment_status := 'unpaid';
        END IF;
        
        -- Payment method (DATA QUALITY: 5% NULL - thiếu thông tin)
        IF RANDOM() < 0.05 THEN
            v_payment_method := NULL;  -- DATA QUALITY ISSUE
        ELSIF RANDOM() < 0.60 THEN
            v_payment_method := 'cash';
        ELSIF RANDOM() < 0.90 THEN
            v_payment_method := 'card';
        ELSE
            v_payment_method := 'transfer';
        END IF;
        
        -- Tạo order
        INSERT INTO fact_orders (
            order_code, date_key, customer_id, store_id,
            status, payment_status, subtotal, discount_amount, final_amount,
            payment_method, created_by, created_at
        ) VALUES (
            v_order_code, p_date, v_customer_id, v_store_id,
            v_order_status, v_payment_status, 0, 0, 0,
            v_payment_method, v_staff_id,
            p_date + (INTERVAL '1 second' * FLOOR(RANDOM() * 50400 + 25200)) -- 7:00:00-21:00:00 (giây ngẫu nhiên)
        ) RETURNING id INTO v_order_id;
        
        v_order_count := v_order_count + 1;
        
        -- =========================
        -- SINH ORDER ITEMS
        -- =========================
        -- Số items per order: Pareto distribution (nhiều đơn 1-3 items, ít đơn nhiều items)
        -- OUTLIER: 2% đơn là đơn sỉ (10-50 items)
        IF RANDOM() < 0.02 THEN
            v_num_items := FLOOR(RANDOM() * 40 + 10)::INT;  -- OUTLIER: Đơn sỉ
        ELSE
            v_num_items := GREATEST(1, LEAST(10, FLOOR(random_pareto(1, 2.5))))::INT;
        END IF;
        
        v_subtotal := 0;
        v_used_variants := ARRAY[]::INT[];
        
        FOR j IN 1..v_num_items LOOP
            -- Chọn variant (tránh trùng trong 1 order)
            LOOP
                v_variant_id := weighted_random_variant();
                EXIT WHEN NOT (v_variant_id = ANY(v_used_variants));
            END LOOP;
            v_used_variants := array_append(v_used_variants, v_variant_id);
            
            -- Lấy giá sản phẩm
            SELECT selling_price INTO v_unit_price
            FROM dim_product_variants
            WHERE id = v_variant_id;
            
            -- Số lượng: Pareto distribution
            -- OUTLIER: 3% mua số lượng lớn (10-100)
            IF RANDOM() < 0.03 THEN
                v_quantity := FLOOR(RANDOM() * 90 + 10);  -- OUTLIER: Mua sỉ
            ELSE
                v_quantity := GREATEST(1, LEAST(10, FLOOR(random_pareto(1, 3))))::INT;
            END IF;
            
            -- Discount per item (chỉ khi có promo)
            IF v_special_day.is_promo_day AND RANDOM() < 0.30 THEN
                v_item_discount := FLOOR(v_unit_price * v_quantity * 0.05 * RANDOM());
            ELSE
                v_item_discount := 0;
            END IF;
            
            -- Insert order item
            INSERT INTO fact_order_items (
                order_id, variant_id, quantity, unit_price, discount_per_item
            ) VALUES (
                v_order_id, v_variant_id, v_quantity, v_unit_price, v_item_discount
            );
            
            v_item_count := v_item_count + 1;
            v_subtotal := v_subtotal + (v_quantity * v_unit_price) - v_item_discount;
        END LOOP;
        
        -- Tính discount tổng đơn
        -- Áp dụng cho customer có group, và đơn đủ điều kiện
        v_discount := 0;
        IF v_customer_id IS NOT NULL THEN
            SELECT COALESCE(
                CASE 
                    WHEN v_subtotal >= cg.min_purchase_amount 
                    THEN FLOOR(v_subtotal * cg.discount_percentage / 100)
                    ELSE 0
                END, 0
            ) INTO v_discount
            FROM dim_customers c
            JOIN subdim_customer_groups cg ON c.customer_group_id = cg.id
            WHERE c.id = v_customer_id;
        END IF;
        
        -- Update order totals
        UPDATE fact_orders
        SET subtotal = v_subtotal,
            discount_amount = v_discount,
            final_amount = v_subtotal - v_discount
        WHERE id = v_order_id;
        
        -- Accumulate revenue
        IF v_order_status = 'completed' THEN
            v_total_revenue := v_total_revenue + (v_subtotal - v_discount);
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Orders created: % | Items: % | Revenue: %',
        v_order_count, v_item_count, v_total_revenue;
    
    RETURN QUERY SELECT 
        v_order_count,
        v_item_count,
        v_total_revenue,
        CASE WHEN v_order_count > 0 
            THEN v_total_revenue / v_order_count 
            ELSE 0 
        END;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- INVENTORY TRANSACTIONS
-- =========================

-- Function: Sinh inventory transactions cho 1 ngày
-- Bao gồm: nhập hàng, xuất hàng (từ orders), điều chỉnh, hàng hỏng
CREATE OR REPLACE FUNCTION generate_daily_inventory_transactions(
    p_date DATE
) RETURNS TABLE (
    imports_created INT,
    exports_created INT,
    adjustments_created INT,
    damages_created INT
) AS $$
DECLARE
    v_imports INT := 0;
    v_exports INT := 0;
    v_adjustments INT := 0;
    v_damages INT := 0;
    
    v_trans_code VARCHAR(100);
    v_trans_type_id INT;
    v_store_id INT;
    v_variant_id INT;
    v_quantity DECIMAL;
    v_balance_before DECIMAL;
    v_balance_after DECIMAL;
    v_unit_cost DECIMAL;
    v_staff_id INT;
    v_reference_code VARCHAR(100);
    
    -- Cursors
    r_order RECORD;
    r_item RECORD;
    r_low_stock RECORD;
    
    -- Counters
    v_seq INT := 0;
BEGIN
    -- =========================
    -- 1. EXPORT từ completed orders
    -- =========================
    -- Ghi nhận xuất kho cho mỗi order item
    v_trans_type_id := 2; -- EXPORT
    
    FOR r_order IN 
        SELECT id, order_code, store_id, created_by
        FROM fact_orders
        WHERE date_key = p_date 
        AND status = 'completed'
    LOOP
        FOR r_item IN
            SELECT oi.variant_id, oi.quantity, pv.cost_price
            FROM fact_order_items oi
            JOIN dim_product_variants pv ON pv.id = oi.variant_id
            WHERE oi.order_id = r_order.id
        LOOP
            v_seq := v_seq + 1;
            v_trans_code := 'EXP-' || TO_CHAR(p_date, 'YYYYMMDD') || '-' || LPAD(v_seq::TEXT, 5, '0');
            
            -- Lấy tồn kho hiện tại
            SELECT COALESCE(quantity_on_hand, 0) INTO v_balance_before
            FROM fact_inventory_stocks
            WHERE store_id = r_order.store_id AND variant_id = r_item.variant_id;
            
            IF v_balance_before IS NULL THEN
                v_balance_before := 0;
            END IF;
            
            v_balance_after := v_balance_before - r_item.quantity;
            
            -- Insert transaction (có thể âm - thiếu hàng)
            INSERT INTO fact_inventory_transactions (
                transaction_code, date_key, transaction_type_id,
                store_id, variant_id, quantity_change,
                balance_before, balance_after, unit_cost,
                reference_type, reference_id, created_by
            ) VALUES (
                v_trans_code, p_date, v_trans_type_id,
                r_order.store_id, r_item.variant_id, -r_item.quantity,
                v_balance_before, v_balance_after, r_item.cost_price,
                'order', r_order.id, r_order.created_by
            );
            
            -- Cập nhật tồn kho
            INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand)
            VALUES (r_order.store_id, r_item.variant_id, -r_item.quantity)
            ON CONFLICT (store_id, variant_id) 
            DO UPDATE SET 
                quantity_on_hand = fact_inventory_stocks.quantity_on_hand - r_item.quantity,
                last_updated = CURRENT_TIMESTAMP;
            
            v_exports := v_exports + 1;
        END LOOP;
    END LOOP;
    
    -- =========================
    -- 2. IMPORT để bổ sung hàng thấp
    -- =========================
    -- Mỗi ngày, check các sản phẩm dưới min_stock và nhập thêm
    v_trans_type_id := 1; -- IMPORT
    v_staff_id := 6; -- staff_wh (warehouse staff)
    
    FOR r_low_stock IN
        SELECT fis.store_id, fis.variant_id, fis.quantity_on_hand, 
               fis.min_stock_level, fis.max_stock_level, pv.cost_price
        FROM fact_inventory_stocks fis
        JOIN dim_product_variants pv ON pv.id = fis.variant_id
        WHERE fis.quantity_on_hand < fis.min_stock_level
        AND fis.store_id != 5  -- Không import vào kho (kho là nguồn)
        ORDER BY RANDOM()
        LIMIT 30  -- Giới hạn 30 sản phẩm/ngày
    LOOP
        -- Chỉ 70% được bổ sung (mô phỏng delay nhập hàng)
        IF RANDOM() < 0.70 THEN
            v_seq := v_seq + 1;
            v_trans_code := 'IMP-' || TO_CHAR(p_date, 'YYYYMMDD') || '-' || LPAD(v_seq::TEXT, 5, '0');
            
            -- Nhập đến 80% max_stock
            v_quantity := GREATEST(
                r_low_stock.min_stock_level,
                r_low_stock.max_stock_level * 0.8 - r_low_stock.quantity_on_hand
            );
            
            v_balance_before := r_low_stock.quantity_on_hand;
            v_balance_after := v_balance_before + v_quantity;
            
            -- DATA QUALITY: 10% không có reference_code
            IF RANDOM() < 0.10 THEN
                v_reference_code := NULL;
            ELSE
                v_reference_code := 'PO-' || TO_CHAR(p_date, 'YYYYMMDD') || '-' || LPAD(v_imports::TEXT, 3, '0');
            END IF;
            
            INSERT INTO fact_inventory_transactions (
                transaction_code, date_key, transaction_type_id,
                store_id, variant_id, quantity_change,
                balance_before, balance_after, unit_cost,
                reference_type, created_by, notes
            ) VALUES (
                v_trans_code, p_date, v_trans_type_id,
                r_low_stock.store_id, r_low_stock.variant_id, v_quantity,
                v_balance_before, v_balance_after, r_low_stock.cost_price,
                CASE WHEN v_reference_code IS NOT NULL THEN 'purchase_order' ELSE NULL END,
                v_staff_id,
                CASE WHEN v_reference_code IS NULL THEN 'Auto-replenishment - PO pending' ELSE NULL END
            );
            
            -- Cập nhật tồn kho
            UPDATE fact_inventory_stocks
            SET quantity_on_hand = v_balance_after,
                last_updated = CURRENT_TIMESTAMP
            WHERE store_id = r_low_stock.store_id 
            AND variant_id = r_low_stock.variant_id;
            
            v_imports := v_imports + 1;
        END IF;
    END LOOP;
    
    -- =========================
    -- 3. ADJUSTMENTS (Điều chỉnh kiểm kê)
    -- =========================
    -- Mỗi ngày có 1-3 điều chỉnh ngẫu nhiên
    v_trans_type_id := 4; -- ADJUSTMENT
    
    FOR i IN 1..FLOOR(RANDOM() * 3 + 1)::INT LOOP
        v_seq := v_seq + 1;
        v_trans_code := 'ADJ-' || TO_CHAR(p_date, 'YYYYMMDD') || '-' || LPAD(v_seq::TEXT, 5, '0');
        
        -- Random store và variant
        SELECT store_id, variant_id, quantity_on_hand INTO v_store_id, v_variant_id, v_balance_before
        FROM fact_inventory_stocks
        WHERE store_id != 5
        ORDER BY RANDOM()
        LIMIT 1;
        
        -- Adjustment: -10 đến +10
        v_quantity := FLOOR(RANDOM() * 21 - 10);
        v_balance_after := v_balance_before + v_quantity;
        
        SELECT cost_price INTO v_unit_cost
        FROM dim_product_variants WHERE id = v_variant_id;
        
        INSERT INTO fact_inventory_transactions (
            transaction_code, date_key, transaction_type_id,
            store_id, variant_id, quantity_change,
            balance_before, balance_after, unit_cost,
            created_by, notes
        ) VALUES (
            v_trans_code, p_date, v_trans_type_id,
            v_store_id, v_variant_id, v_quantity,
            v_balance_before, v_balance_after, v_unit_cost,
            2, 'Kiểm kê hàng ngày'
        );
        
        UPDATE fact_inventory_stocks
        SET quantity_on_hand = v_balance_after,
            last_updated = CURRENT_TIMESTAMP
        WHERE store_id = v_store_id AND variant_id = v_variant_id;
        
        v_adjustments := v_adjustments + 1;
    END LOOP;
    
    -- =========================
    -- 4. DAMAGES (Hàng hỏng)
    -- =========================
    -- 5% chance có hàng hỏng mỗi ngày
    v_trans_type_id := 7; -- DAMAGE
    
    IF RANDOM() < 0.05 THEN
        FOR i IN 1..FLOOR(RANDOM() * 3 + 1)::INT LOOP
            v_seq := v_seq + 1;
            v_trans_code := 'DMG-' || TO_CHAR(p_date, 'YYYYMMDD') || '-' || LPAD(v_seq::TEXT, 5, '0');
            
            -- Thường là sản phẩm tươi sống hoặc sữa
            SELECT fis.store_id, fis.variant_id, fis.quantity_on_hand, pv.cost_price
            INTO v_store_id, v_variant_id, v_balance_before, v_unit_cost
            FROM fact_inventory_stocks fis
            JOIN dim_product_variants pv ON pv.id = fis.variant_id
            JOIN dim_products p ON p.id = pv.product_id
            WHERE p.category_id IN (14, 15, 6) -- Sữa, sữa chua, tươi sống
            AND fis.quantity_on_hand > 5
            ORDER BY RANDOM()
            LIMIT 1;
            
            IF v_store_id IS NOT NULL THEN
                v_quantity := FLOOR(RANDOM() * 5 + 1);
                v_balance_after := v_balance_before - v_quantity;
                
                INSERT INTO fact_inventory_transactions (
                    transaction_code, date_key, transaction_type_id,
                    store_id, variant_id, quantity_change,
                    balance_before, balance_after, unit_cost,
                    created_by, notes
                ) VALUES (
                    v_trans_code, p_date, v_trans_type_id,
                    v_store_id, v_variant_id, -v_quantity,
                    v_balance_before, v_balance_after, v_unit_cost,
                    2, 'Sản phẩm hư hỏng/hết hạn'
                );
                
                UPDATE fact_inventory_stocks
                SET quantity_on_hand = v_balance_after,
                    last_updated = CURRENT_TIMESTAMP
                WHERE store_id = v_store_id AND variant_id = v_variant_id;
                
                v_damages := v_damages + 1;
            END IF;
        END LOOP;
    END IF;
    
    RAISE NOTICE '📦 Inventory: Imports: % | Exports: % | Adjustments: % | Damages: %',
        v_imports, v_exports, v_adjustments, v_damages;
    
    RETURN QUERY SELECT v_imports, v_exports, v_adjustments, v_damages;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- SHIPMENT GENERATION
-- =========================

-- Function: Sinh shipments cho 1 ngày
-- Bao gồm: tạo shipments mới cho completed orders + cập nhật trạng thái shipments đang vận chuyển
-- ~30% completed orders có customer sẽ được giao hàng (còn lại mua tại cửa hàng)
CREATE OR REPLACE FUNCTION generate_daily_shipments(
    p_date DATE
) RETURNS TABLE (
    new_shipments INT,
    updated_shipments INT,
    delivered_shipments INT
) AS $$
DECLARE
    v_new INT := 0;
    v_updated INT := 0;
    v_delivered INT := 0;
    
    -- Shipment variables
    v_shipment_id BIGINT;
    v_shipment_code VARCHAR(100);
    v_tracking_code VARCHAR(100);
    v_carrier_id INT;
    v_new_status_id INT;
    v_shipping_fee DECIMAL;
    v_cod_amount DECIMAL;
    v_insurance_fee DECIMAL;
    v_weight DECIMAL;
    v_estimated_days INT;
    v_seq INT := 0;
    
    -- Store info
    v_store_name VARCHAR(200);
    v_store_phone VARCHAR(20);
    v_store_address TEXT;
    
    -- Cursors
    r_order RECORD;
    r_shipment RECORD;
    
    -- Random data arrays
    v_districts TEXT[] := ARRAY[
        'Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Bình Thạnh',
        'Gò Vấp', 'Thủ Đức', 'Hoàng Mai', 'Cầu Giấy', 'Thanh Xuân',
        'Hai Bà Trưng', 'Long Biên', 'Tân Bình', 'Phú Nhuận', 'Bình Tân'
    ];
    v_wards TEXT[] := ARRAY[
        'Phường 1', 'Phường 3', 'Phường 5', 'Phường 7', 'Phường 10',
        'Phường 12', 'Phường An Phú', 'Phường Tân Định', 'Phường Bến Nghé',
        'Phường Đa Kao'
    ];
    v_streets TEXT[] := ARRAY[
        'Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Pasteur',
        'Nguyễn Thị Minh Khai', 'Điện Biên Phủ', 'Cách Mạng Tháng 8',
        'Phạm Ngọc Thạch', 'Lý Tự Trọng', 'Trần Phú', 'Nguyễn Trãi'
    ];
BEGIN
    -- =========================
    -- 1. TẠO SHIPMENTS MỚI cho completed orders
    -- =========================
    FOR r_order IN
        SELECT o.id, o.order_code, o.store_id, o.customer_id, o.final_amount,
               o.created_by, o.created_at,
               c.full_name AS cust_name, c.phone AS cust_phone,
               c.address AS cust_address, c.city_id AS cust_city_id
        FROM fact_orders o
        JOIN dim_customers c ON c.id = o.customer_id
        WHERE o.date_key = p_date
        AND o.status = 'completed'
        AND o.customer_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM fact_shipments s WHERE s.order_id = o.id
        )
        ORDER BY RANDOM()
    LOOP
        -- ~30% completed orders có customer tạo shipment (còn lại mua tại quầy)
        IF RANDOM() > 0.30 THEN
            CONTINUE;
        END IF;
        
        v_seq := v_seq + 1;
        v_shipment_code := 'SHP-' || TO_CHAR(p_date, 'YYYYMMDD') || '-' || LPAD(v_seq::TEXT, 5, '0');
        
        -- Kiểm tra duplicate (idempotent)
        IF EXISTS (SELECT 1 FROM fact_shipments WHERE shipment_code = v_shipment_code) THEN
            CONTINUE;
        END IF;
        
        -- Chọn carrier (2-6, không dùng INTERNAL cho delivery)
        v_carrier_id := FLOOR(RANDOM() * 5 + 2)::INT;
        
        -- Tạo tracking code: carrier prefix + date + random
        v_tracking_code := (
            SELECT code FROM dim_carriers WHERE id = v_carrier_id
        ) || TO_CHAR(p_date, 'YYMMDD') || LPAD(FLOOR(RANDOM() * 999999 + 1)::TEXT, 6, '0');
        
        -- Package weight: 0.5-15kg (Pareto distribution - nhiều gói nhỏ)
        v_weight := GREATEST(0.5, LEAST(15, random_pareto(0.5, 2.0)));
        
        -- Shipping fee: dựa trên weight + distance factor
        v_shipping_fee := FLOOR(15000 + v_weight * 3000 + RANDOM() * 20000);
        
        -- COD: 60% đơn thu hộ, 40% đã thanh toán
        IF RANDOM() < 0.60 THEN
            v_cod_amount := r_order.final_amount;
        ELSE
            v_cod_amount := 0;
        END IF;
        
        -- Insurance: đơn > 2 triệu tính phí bảo hiểm 0.5%
        IF r_order.final_amount > 2000000 THEN
            v_insurance_fee := FLOOR(r_order.final_amount * 0.005);
        ELSE
            v_insurance_fee := 0;
        END IF;
        
        -- Estimated delivery: 1-5 ngày (nội thành nhanh hơn)
        v_estimated_days := FLOOR(RANDOM() * 4 + 1)::INT +
            CASE WHEN r_order.cust_city_id IN (1, 2) THEN 0 ELSE 1 END;
        
        -- Lấy thông tin store gửi hàng
        SELECT name, phone, address INTO v_store_name, v_store_phone, v_store_address
        FROM dim_stores WHERE id = r_order.store_id;
        
        -- Insert shipment (status = 1 pending)
        INSERT INTO fact_shipments (
            shipment_code, order_id, carrier_id, tracking_code, status_id,
            sender_store_id, sender_name, sender_phone, sender_address,
            recipient_name, recipient_phone, recipient_address,
            recipient_city_id, recipient_district, recipient_ward,
            package_weight,
            shipping_fee, cod_amount, insurance_fee, total_fee,
            estimated_delivery_date,
            created_by, created_at
        ) VALUES (
            v_shipment_code, r_order.id, v_carrier_id, v_tracking_code,
            1, -- pending
            r_order.store_id, v_store_name, v_store_phone, v_store_address,
            r_order.cust_name,
            r_order.cust_phone,
            COALESCE(
                r_order.cust_address,
                'Số ' || FLOOR(RANDOM() * 200 + 1)::TEXT || ' ' ||
                v_streets[FLOOR(RANDOM() * 12 + 1)::INT] || ', ' ||
                v_districts[FLOOR(RANDOM() * 15 + 1)::INT]
            ),
            r_order.cust_city_id,
            v_districts[FLOOR(RANDOM() * 15 + 1)::INT],
            v_wards[FLOOR(RANDOM() * 10 + 1)::INT],
            ROUND(v_weight::NUMERIC, 2),
            v_shipping_fee, v_cod_amount, v_insurance_fee,
            v_shipping_fee + v_insurance_fee,
            p_date + v_estimated_days,
            r_order.created_by,
            r_order.created_at + INTERVAL '30 minutes'
        ) RETURNING id INTO v_shipment_id;
        
        -- Tạo tracking history - trạng thái đầu tiên
        INSERT INTO fact_shipment_tracking (
            shipment_id, status_id, location, description, tracked_at, created_by
        ) VALUES (
            v_shipment_id, 1,
            v_store_name,
            'Đơn hàng mới tạo, chờ xử lý',
            r_order.created_at + INTERVAL '30 minutes',
            r_order.created_by
        );
        
        v_new := v_new + 1;
    END LOOP;
    
    -- =========================
    -- 2. CẬP NHẬT TRẠNG THÁI shipments đang xử lý
    -- =========================
    -- Mỗi ngày, shipments chưa hoàn thành tiến 1-2 trạng thái
    FOR r_shipment IN
        SELECT s.id, s.status_id, s.carrier_id, s.sender_store_id,
               s.recipient_city_id, s.recipient_district,
               s.recipient_name, s.estimated_delivery_date
        FROM fact_shipments s
        WHERE s.status_id < 7  -- Chưa delivered
        AND s.status_id NOT IN (8, 9, 10) -- Không phải failed/returned/cancelled
        AND s.created_at::date < p_date   -- Không update shipment vừa tạo hôm nay
    LOOP
        -- Tiến 1-2 bước, max đến 7 (delivered)
        v_new_status_id := LEAST(7, r_shipment.status_id + FLOOR(RANDOM() * 2 + 1)::INT);
        
        -- 3% chance giao thất bại khi đang giao (status >= 5)
        IF r_shipment.status_id >= 5 AND RANDOM() < 0.03 THEN
            v_new_status_id := 8; -- failed
        END IF;
        
        -- 2% chance bị hủy khi chưa lấy hàng (status <= 3)
        IF r_shipment.status_id <= 3 AND RANDOM() < 0.02 THEN
            v_new_status_id := 10; -- cancelled
        END IF;
        
        -- Update shipment status + timestamps
        UPDATE fact_shipments
        SET status_id = v_new_status_id,
            picked_at = CASE
                WHEN v_new_status_id >= 4 AND picked_at IS NULL
                THEN p_date + INTERVAL '9 hours'
                ELSE picked_at
            END,
            delivered_at = CASE
                WHEN v_new_status_id = 7
                THEN p_date + INTERVAL '14 hours' + (RANDOM() * INTERVAL '4 hours')
                ELSE delivered_at
            END,
            actual_delivery_date = CASE
                WHEN v_new_status_id = 7 THEN p_date
                ELSE actual_delivery_date
            END,
            updated_at = p_date + INTERVAL '12 hours'
        WHERE id = r_shipment.id;
        
        -- Tạo tracking history cho trạng thái mới
        INSERT INTO fact_shipment_tracking (
            shipment_id, status_id, location, description, tracked_at, created_by
        ) VALUES (
            r_shipment.id,
            v_new_status_id,
            CASE v_new_status_id
                WHEN 2 THEN (SELECT name FROM dim_stores WHERE id = r_shipment.sender_store_id)
                WHEN 3 THEN 'Kho phân loại'
                WHEN 4 THEN 'Kho phân loại'
                WHEN 5 THEN 'Trung tâm trung chuyển'
                WHEN 6 THEN COALESCE(
                    (SELECT name FROM subdim_cities WHERE id = r_shipment.recipient_city_id),
                    'Bưu cục đích'
                )
                WHEN 7 THEN COALESCE(r_shipment.recipient_district, 'Địa chỉ giao')
                WHEN 8 THEN COALESCE(r_shipment.recipient_district, 'Địa chỉ giao')
                WHEN 10 THEN (SELECT name FROM dim_stores WHERE id = r_shipment.sender_store_id)
                ELSE 'Đang xử lý'
            END,
            CASE v_new_status_id
                WHEN 2 THEN 'Đã xác nhận đơn, chuẩn bị hàng'
                WHEN 3 THEN 'Shipper đang đến lấy hàng'
                WHEN 4 THEN 'Đã lấy hàng, đưa vào kho phân loại'
                WHEN 5 THEN 'Đang vận chuyển đến bưu cục đích'
                WHEN 6 THEN 'Đang giao hàng cho ' || r_shipment.recipient_name
                WHEN 7 THEN 'Giao hàng thành công'
                WHEN 8 THEN 'Giao hàng thất bại - không liên lạc được khách'
                WHEN 10 THEN 'Đơn hàng đã bị hủy'
                ELSE 'Cập nhật trạng thái'
            END,
            p_date + INTERVAL '8 hours' + (RANDOM() * INTERVAL '10 hours'),
            NULL
        );
        
        v_updated := v_updated + 1;
        IF v_new_status_id = 7 THEN
            v_delivered := v_delivered + 1;
        END IF;
    END LOOP;
    
    IF v_new > 0 OR v_updated > 0 THEN
        RAISE NOTICE '🚚 Shipments: % new | % updated | % delivered',
            v_new, v_updated, v_delivered;
    END IF;
    
    RETURN QUERY SELECT v_new, v_updated, v_delivered;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- DIMENSION UPDATES (SCD Type 1)
-- =========================

-- Function: Cập nhật customer group dựa trên spending (nâng/hạ hạng)
CREATE OR REPLACE FUNCTION update_customer_tiers(
    p_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    upgraded INT,
    downgraded INT
) AS $$
DECLARE
    v_upgraded INT := 0;
    v_downgraded INT := 0;
    r_customer RECORD;
    v_new_group_id INT;
    v_current_ltv DECIMAL;
BEGIN
    -- Cập nhật lifetime value trước
    UPDATE dim_customers c
    SET total_lifetime_value = COALESCE(
        (SELECT SUM(final_amount) 
         FROM fact_orders 
         WHERE customer_id = c.id 
         AND status = 'completed'),
        0
    );
    
    -- Kiểm tra và update tier cho từng customer
    FOR r_customer IN 
        SELECT c.id, c.customer_group_id, c.total_lifetime_value
        FROM dim_customers c
        WHERE c.total_lifetime_value > 0
    LOOP
        v_current_ltv := r_customer.total_lifetime_value;
        
        -- Xác định group mới dựa trên LTV
        v_new_group_id := CASE
            WHEN v_current_ltv >= 5000000 THEN 1  -- VIP
            WHEN v_current_ltv >= 2000000 THEN 2  -- Gold
            WHEN v_current_ltv >= 1000000 THEN 3  -- Silver
            WHEN v_current_ltv >= 500000 THEN 4   -- Bronze
            ELSE 5                                 -- Normal
        END;
        
        IF v_new_group_id < r_customer.customer_group_id THEN
            -- Nâng hạng
            UPDATE dim_customers
            SET customer_group_id = v_new_group_id
            WHERE id = r_customer.id;
            v_upgraded := v_upgraded + 1;
        ELSIF v_new_group_id > r_customer.customer_group_id THEN
            -- Hạ hạng (hiếm khi xảy ra trong thực tế)
            -- Chỉ apply 10% chance để giữ khách
            IF RANDOM() < 0.10 THEN
                UPDATE dim_customers
                SET customer_group_id = v_new_group_id
                WHERE id = r_customer.id;
                v_downgraded := v_downgraded + 1;
            END IF;
        END IF;
    END LOOP;
    
    RAISE NOTICE '👥 Customer tiers updated: % upgraded, % downgraded', v_upgraded, v_downgraded;
    
    RETURN QUERY SELECT v_upgraded, v_downgraded;
END;
$$ LANGUAGE plpgsql;

-- Function: Điều chỉnh giá sản phẩm (price changes)
-- Mô phỏng: mỗi tháng có 2-5% sản phẩm thay đổi giá
CREATE OR REPLACE FUNCTION apply_price_changes(
    p_date DATE DEFAULT CURRENT_DATE
) RETURNS INT AS $$
DECLARE
    v_changes INT := 0;
    r_variant RECORD;
    v_price_change_pct DECIMAL;
BEGIN
    -- Chỉ apply vào ngày đầu tháng hoặc giữa tháng
    IF EXTRACT(DAY FROM p_date) NOT IN (1, 15) THEN
        RETURN 0;
    END IF;
    
    -- Random 2-5% sản phẩm có thay đổi giá
    FOR r_variant IN
        SELECT id, selling_price, cost_price
        FROM dim_product_variants
        WHERE is_active = TRUE
        ORDER BY RANDOM()
        LIMIT (SELECT COUNT(*) * 0.03 FROM dim_product_variants)
    LOOP
        -- Thay đổi giá -5% đến +10%
        v_price_change_pct := (RANDOM() * 0.15 - 0.05);
        
        UPDATE dim_product_variants
        SET selling_price = GREATEST(
            cost_price * 1.1,  -- Đảm bảo margin tối thiểu 10%
            FLOOR(selling_price * (1 + v_price_change_pct))
        )
        WHERE id = r_variant.id;
        
        v_changes := v_changes + 1;
    END LOOP;
    
    IF v_changes > 0 THEN
        RAISE NOTICE '💰 Price changes applied: % products', v_changes;
    END IF;
    
    RETURN v_changes;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- MASTER FUNCTION: Sinh tất cả data cho 1 ngày
-- =========================
CREATE OR REPLACE FUNCTION generate_daily_data(
    p_date DATE,
    p_expected_orders INT DEFAULT NULL
) RETURNS TABLE (
    date_processed DATE,
    orders_created INT,
    items_created INT,
    inventory_transactions INT,
    dimension_updates INT,
    total_revenue DECIMAL
) AS $$
DECLARE
    v_order_result RECORD;
    v_inv_result RECORD;
    v_dim_upgraded INT := 0;
    v_dim_downgraded INT := 0;
    v_price_changes INT := 0;
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE '🚀 STARTING DAILY DATA GENERATION FOR: %', p_date;
    RAISE NOTICE '==============================================';
    
    -- 1. Sinh Orders
    SELECT * INTO v_order_result FROM generate_daily_orders(p_date, p_expected_orders);
    
    -- 2. Sinh Inventory Transactions
    SELECT * INTO v_inv_result FROM generate_daily_inventory_transactions(p_date);
    
    -- 3. Sinh Shipments (tạo mới + cập nhật trạng thái)
    PERFORM generate_daily_shipments(p_date);
    
    -- 4. Update Customer Tiers (chỉ cuối tuần)
    IF EXTRACT(DOW FROM p_date) = 0 THEN
        SELECT upgraded, downgraded INTO v_dim_upgraded, v_dim_downgraded 
        FROM update_customer_tiers(p_date);
    END IF;
    
    -- 5. Price Changes (ngày 1 hoặc 15)
    v_price_changes := apply_price_changes(p_date);
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ COMPLETED DAILY DATA GENERATION FOR: %', p_date;
    RAISE NOTICE '==============================================';
    
    RETURN QUERY SELECT 
        p_date,
        v_order_result.orders_created,
        v_order_result.items_created,
        v_inv_result.imports_created + v_inv_result.exports_created + 
            v_inv_result.adjustments_created + v_inv_result.damages_created,
        COALESCE(v_dim_upgraded, 0) + COALESCE(v_dim_downgraded, 0) + v_price_changes,
        v_order_result.total_revenue;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- BACKFILL FUNCTION: Sinh data cho nhiều ngày
-- =========================
CREATE OR REPLACE FUNCTION backfill_daily_data(
    p_start_date DATE,
    p_end_date DATE,
    p_with_progress BOOLEAN DEFAULT TRUE
) RETURNS TABLE (
    total_days INT,
    total_orders INT,
    total_items INT,
    total_revenue DECIMAL,
    avg_orders_per_day DECIMAL
) AS $$
DECLARE
    v_current_date DATE;
    v_day_count INT := 0;
    v_total_orders INT := 0;
    v_total_items INT := 0;
    v_total_revenue DECIMAL := 0;
    v_result RECORD;
BEGIN
    RAISE NOTICE '📊 STARTING BACKFILL: % to %', p_start_date, p_end_date;
    RAISE NOTICE '   Expected days: %', p_end_date - p_start_date + 1;
    RAISE NOTICE '----------------------------------------------';
    
    v_current_date := p_start_date;
    
    WHILE v_current_date <= p_end_date LOOP
        -- Sinh data cho ngày hiện tại
        SELECT * INTO v_result FROM generate_daily_data(v_current_date);
        
        -- Cộng dồn kết quả
        v_day_count := v_day_count + 1;
        v_total_orders := v_total_orders + v_result.orders_created;
        v_total_items := v_total_items + v_result.items_created;
        v_total_revenue := v_total_revenue + v_result.total_revenue;
        
        -- Progress report
        IF p_with_progress AND (v_day_count % 7 = 0) THEN
            RAISE NOTICE '   Progress: % days completed, % orders so far', 
                v_day_count, v_total_orders;
        END IF;
        
        v_current_date := v_current_date + 1;
    END LOOP;
    
    RAISE NOTICE '----------------------------------------------';
    RAISE NOTICE '📊 BACKFILL COMPLETED';
    RAISE NOTICE '   Total days: %', v_day_count;
    RAISE NOTICE '   Total orders: %', v_total_orders;
    RAISE NOTICE '   Total items: %', v_total_items;
    RAISE NOTICE '   Total revenue: %', v_total_revenue;
    RAISE NOTICE '   Avg orders/day: %', ROUND(v_total_orders::DECIMAL / v_day_count, 2);
    
    RETURN QUERY SELECT 
        v_day_count,
        v_total_orders,
        v_total_items,
        v_total_revenue,
        ROUND(v_total_orders::DECIMAL / v_day_count, 2);
END;
$$ LANGUAGE plpgsql;

-- =========================
-- SPECIAL EVENT FUNCTIONS
-- =========================

-- Function: Sinh data cho ngày Flash Sale (OUTLIER scenario)
CREATE OR REPLACE FUNCTION generate_flash_sale_day(
    p_date DATE,
    p_sale_multiplier DECIMAL DEFAULT 5.0
) RETURNS TABLE (
    orders_created INT,
    items_created INT,
    total_revenue DECIMAL
) AS $$
DECLARE
    v_base_orders INT;
    v_result RECORD;
BEGIN
    RAISE NOTICE '🔥 FLASH SALE DAY: % (Multiplier: %x)', p_date, p_sale_multiplier;
    
    -- Base orders * multiplier
    v_base_orders := FLOOR(80 * p_sale_multiplier)::INT;
    
    SELECT * INTO v_result FROM generate_daily_orders(p_date, v_base_orders);
    
    -- Update inventory
    PERFORM generate_daily_inventory_transactions(p_date);
    
    RETURN QUERY SELECT 
        v_result.orders_created,
        v_result.items_created,
        v_result.total_revenue;
END;
$$ LANGUAGE plpgsql;

-- Function: Mô phỏng ngày có sự cố (DATA QUALITY scenario)
-- Ví dụ: hệ thống lỗi dẫn đến thiếu dữ liệu
CREATE OR REPLACE FUNCTION generate_incident_day(
    p_date DATE,
    p_missing_rate DECIMAL DEFAULT 0.30  -- 30% data bị thiếu
) RETURNS TABLE (
    orders_created INT,
    orders_with_issues INT,
    data_quality_score DECIMAL
) AS $$
DECLARE
    v_result RECORD;
    v_orders_with_issues INT := 0;
BEGIN
    RAISE NOTICE '⚠️ INCIDENT DAY: % (Missing rate: %)', p_date, p_missing_rate;
    
    -- Sinh orders bình thường
    SELECT * INTO v_result FROM generate_daily_orders(p_date);
    
    -- Xóa một số thông tin để mô phỏng data loss
    UPDATE fact_orders
    SET payment_method = CASE WHEN RANDOM() < p_missing_rate THEN NULL ELSE payment_method END,
        customer_note = CASE WHEN RANDOM() < p_missing_rate THEN 'DATA_RECOVERY_NEEDED' ELSE customer_note END
    WHERE date_key = p_date;
    
    GET DIAGNOSTICS v_orders_with_issues = ROW_COUNT;
    
    RETURN QUERY SELECT 
        v_result.orders_created,
        v_orders_with_issues,
        1.0 - p_missing_rate;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- UTILITY FUNCTIONS
-- =========================

-- Function: Xem summary data theo ngày
CREATE OR REPLACE FUNCTION get_daily_summary(
    p_date DATE
) RETURNS TABLE (
    metric_name VARCHAR,
    metric_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'Total Orders'::VARCHAR, COUNT(*)::DECIMAL FROM fact_orders WHERE date_key = p_date
    UNION ALL
    SELECT 'Completed Orders', COUNT(*) FROM fact_orders WHERE date_key = p_date AND status = 'completed'
    UNION ALL
    SELECT 'Total Revenue', COALESCE(SUM(final_amount), 0) FROM fact_orders WHERE date_key = p_date AND status = 'completed'
    UNION ALL
    SELECT 'Avg Order Value', COALESCE(AVG(final_amount), 0) FROM fact_orders WHERE date_key = p_date AND status = 'completed'
    UNION ALL
    SELECT 'Orders with Customer', COUNT(*) FROM fact_orders WHERE date_key = p_date AND customer_id IS NOT NULL
    UNION ALL
    SELECT 'Walk-in Orders', COUNT(*) FROM fact_orders WHERE date_key = p_date AND customer_id IS NULL
    UNION ALL
    SELECT 'Inventory Transactions', COUNT(*) FROM fact_inventory_transactions WHERE date_key = p_date;
END;
$$ LANGUAGE plpgsql;

-- Function: Kiểm tra data quality
CREATE OR REPLACE FUNCTION check_data_quality(
    p_date DATE DEFAULT NULL
) RETURNS TABLE (
    issue_type VARCHAR,
    issue_count INT,
    severity VARCHAR
) AS $$
BEGIN
    -- Orders không có payment_method
    RETURN QUERY
    SELECT 
        'Orders missing payment_method'::VARCHAR,
        COUNT(*)::INT,
        'MEDIUM'::VARCHAR
    FROM fact_orders 
    WHERE (p_date IS NULL OR date_key = p_date)
    AND payment_method IS NULL;
    
    -- Orders không có customer (valid case)
    RETURN QUERY
    SELECT 
        'Walk-in orders (no customer)'::VARCHAR,
        COUNT(*)::INT,
        'INFO'::VARCHAR
    FROM fact_orders 
    WHERE (p_date IS NULL OR date_key = p_date)
    AND customer_id IS NULL;
    
    -- Inventory transactions không có reference
    RETURN QUERY
    SELECT 
        'Inventory trans missing reference'::VARCHAR,
        COUNT(*)::INT,
        'LOW'::VARCHAR
    FROM fact_inventory_transactions 
    WHERE (p_date IS NULL OR date_key = p_date)
    AND reference_type IS NULL;
    
    -- Tồn kho âm
    RETURN QUERY
    SELECT 
        'Negative inventory'::VARCHAR,
        COUNT(*)::INT,
        'HIGH'::VARCHAR
    FROM fact_inventory_stocks 
    WHERE quantity_on_hand < 0;
    
    -- Đơn hàng có giá trị bất thường (> 10M)
    RETURN QUERY
    SELECT 
        'High value orders (>10M)'::VARCHAR,
        COUNT(*)::INT,
        'INFO'::VARCHAR
    FROM fact_orders 
    WHERE (p_date IS NULL OR date_key = p_date)
    AND final_amount > 10000000;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- INITIALIZATION SCRIPT
-- =========================
-- Chạy script này trước khi bắt đầu backfill

-- Đảm bảo dim_time có đủ ngày
DO $$
BEGIN
    INSERT INTO dim_time (date_key, day_of_week, day_name, week_of_year, month, month_name, quarter, year, is_weekend)
    SELECT 
        d::date,
        EXTRACT(DOW FROM d),
        TO_CHAR(d, 'Day'),
        EXTRACT(WEEK FROM d),
        EXTRACT(MONTH FROM d),
        TO_CHAR(d, 'Month'),
        EXTRACT(QUARTER FROM d),
        EXTRACT(YEAR FROM d),
        EXTRACT(DOW FROM d) IN (0, 6)
    FROM generate_series('2025-01-01'::date, '2030-12-31'::date, '1 day'::interval) d
    ON CONFLICT (date_key) DO NOTHING;
    
    RAISE NOTICE '✅ dim_time extended to 2030';
END $$;

-- =========================
-- EXAMPLE USAGE
-- =========================
/*
-- 1. Sinh data cho 1 ngày cụ thể:
SELECT * FROM generate_daily_data('2026-02-01');

-- 2. Sinh data cho 1 ngày với số lượng orders cố định:
SELECT * FROM generate_daily_orders('2026-02-01', 100);

-- 3. Backfill 1 tháng data (orders + inventory + shipments):
SELECT * FROM backfill_daily_data('2026-02-01', '2026-02-28');

-- 3b. Chỉ sinh shipments cho 1 ngày:
SELECT * FROM generate_daily_shipments('2026-02-01');

-- 4. Mô phỏng Flash Sale (Black Friday):
SELECT * FROM generate_flash_sale_day('2026-11-27', 5.0);

-- 5. Mô phỏng ngày có sự cố hệ thống:
SELECT * FROM generate_incident_day('2026-03-15', 0.25);

-- 6. Xem summary 1 ngày:
SELECT * FROM get_daily_summary('2026-02-01');

-- 7. Check data quality:
SELECT * FROM check_data_quality('2026-02-01');
SELECT * FROM check_data_quality();  -- All time

-- 8. Backfill cả năm (chạy vào ban đêm):
SELECT * FROM backfill_daily_data('2026-01-01', '2026-12-31', TRUE);
*/

-- =========================
-- COMPLETION MESSAGE
-- =========================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ INCREMENTAL DATA GENERATOR INSTALLED SUCCESSFULLY';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Available functions:';
    RAISE NOTICE '  - generate_daily_data(date, expected_orders)';
    RAISE NOTICE '  - generate_daily_orders(date, expected_orders)';
    RAISE NOTICE '  - generate_daily_inventory_transactions(date)';
    RAISE NOTICE '  - generate_daily_shipments(date)';
    RAISE NOTICE '  - backfill_daily_data(start_date, end_date)';
    RAISE NOTICE '  - generate_flash_sale_day(date, multiplier)';
    RAISE NOTICE '  - generate_incident_day(date, missing_rate)';
    RAISE NOTICE '  - get_daily_summary(date)';
    RAISE NOTICE '  - check_data_quality(date)';
    RAISE NOTICE '  - update_customer_tiers(date)';
    RAISE NOTICE '  - apply_price_changes(date)';
    RAISE NOTICE '=====================================================';
END $$;
