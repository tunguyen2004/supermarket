-- =====================================================
-- MIGRATION TỔNG HỢP - Chạy 1 lần cho database cũ
-- Date: 2026-01-21
-- =====================================================
-- File này dùng cho những ai đã có database cũ và cần update
-- Nếu pull mới về và chạy docker-compose up lần đầu thì KHÔNG CẦN chạy file này
-- vì schema.sql đã bao gồm tất cả các cột mới

-- =====================================================
-- 1. MIGRATION: Login Security
-- =====================================================
ALTER TABLE dim_users
ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_locked_until ON dim_users(locked_until);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON dim_users(is_active);

-- =====================================================
-- 2. MIGRATION: User Profile Fields
-- =====================================================
ALTER TABLE dim_users 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS address TEXT;

-- =====================================================
-- 3. MIGRATION: Avatar
-- =====================================================
ALTER TABLE dim_users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT NULL;

-- =====================================================
-- DONE - Verify
-- =====================================================
-- Kiểm tra các cột đã được thêm
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'dim_users'
ORDER BY ordinal_position;

-- =====================================================
-- 4. SEED DATA: Thêm thương hiệu, đơn vị, danh mục
-- =====================================================

-- Thêm các thương hiệu mới (nếu chưa có)
INSERT INTO subdim_brands (code, name, origin_country, description) VALUES
('ACECOOK', 'Acecook', 'Vietnam', 'Mì ăn liền và thực phẩm'),
('AJINOMOTO', 'Ajinomoto', 'Japan', 'Gia vị và bột ngọt'),
('TUONGAN', 'Tường An', 'Vietnam', 'Dầu ăn'),
('NAMFISH', 'Nam Ngư', 'Vietnam', 'Nước mắm'),
('ORION', 'Orion', 'Korea', 'Bánh kẹo'),
('NESTCAFE', 'Nescafe', 'Switzerland', 'Cà phê'),
('PEPSI', 'PepsiCo', 'USA', 'Nước giải khát'),
('UNILEVER', 'Unilever', 'UK', 'Hàng tiêu dùng')
ON CONFLICT (code) DO NOTHING;

-- Thêm đơn vị tính mới
INSERT INTO subdim_units (code, name, base_unit) VALUES
('KG', 'Kilogram', FALSE),
('LOC', 'Lốc', FALSE),
('GOI', 'Gói', TRUE),
('CHAI', 'Chai', TRUE),
('LON', 'Lon', TRUE),
('HOP', 'Hộp', TRUE),
('VE', 'Vỉ', FALSE)
ON CONFLICT (code) DO NOTHING;

-- Thêm danh mục sản phẩm chi tiết
INSERT INTO subdim_categories (code, name, parent_id, level, path) VALUES
('INSTANT', 'Mì ăn liền', 1, 1, '/1/3'),
('SEASONING', 'Gia vị', 1, 1, '/1/4'),
('OIL', 'Dầu ăn', 1, 1, '/1/5'),
('SAUCE', 'Nước chấm', 1, 1, '/1/6'),
('SNACK', 'Bánh kẹo', 1, 1, '/1/7'),
('COFFEE', 'Cà phê', 2, 1, '/2/8'),
('SOFTDRINK', 'Nước ngọt', 2, 1, '/2/9'),
('DAIRY', 'Sữa & Sản phẩm từ sữa', 1, 1, '/1/10'),
('EGGS', 'Trứng', 1, 1, '/1/11'),
('DETERGENT', 'Chất tẩy rửa', NULL, 0, '/12')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 5. SEED DATA: 10 sản phẩm mới với đầy đủ thông tin
-- =====================================================

-- Lấy ID của các subdimension (sử dụng subquery)
-- Sản phẩm 1: Mì Hảo Hảo tôm chua cay
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, is_active, has_variants)
SELECT 'MI001', 'Mì Hảo Hảo tôm chua cay', 
       c.id, b.id, u.id,
       'Mì ăn liền hương vị tôm chua cay, gói 75g', TRUE, FALSE
FROM subdim_categories c, subdim_brands b, subdim_units u
WHERE c.code = 'INSTANT' AND b.code = 'ACECOOK' AND u.code = 'GOI'
ON CONFLICT (code) DO NOTHING;

-- Sản phẩm 2: Bột ngọt Ajinomoto
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, is_active, has_variants)
SELECT 'GV001', 'Bột ngọt Ajinomoto 400g', 
       c.id, b.id, u.id,
       'Bột ngọt cao cấp, túi 400g', TRUE, FALSE
FROM subdim_categories c, subdim_brands b, subdim_units u
WHERE c.code = 'SEASONING' AND b.code = 'AJINOMOTO' AND u.code = 'GOI'
ON CONFLICT (code) DO NOTHING;

-- Sản phẩm 3: Dầu ăn Tường An
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, is_active, has_variants)
SELECT 'DA001', 'Dầu ăn Tường An 1L', 
       c.id, b.id, u.id,
       'Dầu ăn thực vật cao cấp, chai 1 lít', TRUE, FALSE
FROM subdim_categories c, subdim_brands b, subdim_units u
WHERE c.code = 'OIL' AND b.code = 'TUONGAN' AND u.code = 'CHAI'
ON CONFLICT (code) DO NOTHING;

-- Sản phẩm 4: Nước mắm Nam Ngư
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, is_active, has_variants)
SELECT 'NM001', 'Nước mắm Nam Ngư 500ml', 
       c.id, b.id, u.id,
       'Nước mắm đậm đà, chai 500ml', TRUE, FALSE
FROM subdim_categories c, subdim_brands b, subdim_units u
WHERE c.code = 'SAUCE' AND b.code = 'NAMFISH' AND u.code = 'CHAI'
ON CONFLICT (code) DO NOTHING;

-- Sản phẩm 5: Bánh Chocopie
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, is_active, has_variants)
SELECT 'BK001', 'Bánh Chocopie hộp 12 cái', 
       c.id, b.id, u.id,
       'Bánh phủ socola nhân marshmallow, hộp 12 cái', TRUE, FALSE
FROM subdim_categories c, subdim_brands b, subdim_units u
WHERE c.code = 'SNACK' AND b.code = 'ORION' AND u.code = 'HOP'
ON CONFLICT (code) DO NOTHING;

-- Sản phẩm 6: Cà phê Nescafe 3in1
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, is_active, has_variants)
SELECT 'CF001', 'Cà phê Nescafe 3in1 hộp 20 gói', 
       c.id, b.id, u.id,
       'Cà phê hòa tan 3 trong 1, hộp 20 gói x 17g', TRUE, FALSE
FROM subdim_categories c, subdim_brands b, subdim_units u
WHERE c.code = 'COFFEE' AND b.code = 'NESTCAFE' AND u.code = 'HOP'
ON CONFLICT (code) DO NOTHING;

-- Sản phẩm 7: Pepsi lon
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, is_active, has_variants)
SELECT 'NG001', 'Pepsi lon 330ml', 
       c.id, b.id, u.id,
       'Nước ngọt có gas, lon 330ml', TRUE, FALSE
FROM subdim_categories c, subdim_brands b, subdim_units u
WHERE c.code = 'SOFTDRINK' AND b.code = 'PEPSI' AND u.code = 'LON'
ON CONFLICT (code) DO NOTHING;

-- Sản phẩm 8: Sữa đặc Vinamilk
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, is_active, has_variants)
SELECT 'SD001', 'Sữa đặc Vinamilk Ông Thọ 380g', 
       c.id, b.id, u.id,
       'Sữa đặc có đường, lon 380g', TRUE, FALSE
FROM subdim_categories c, subdim_brands b, subdim_units u
WHERE c.code = 'DAIRY' AND b.code = 'VINAMILK' AND u.code = 'LON'
ON CONFLICT (code) DO NOTHING;

-- Sản phẩm 9: Trứng gà 10 quả
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, is_active, has_variants)
SELECT 'TR001', 'Trứng gà ta vỉ 10 quả', 
       c.id, b.id, u.id,
       'Trứng gà tươi sạch, vỉ 10 quả', TRUE, FALSE
FROM subdim_categories c, subdim_brands b, subdim_units u
WHERE c.code = 'EGGS' AND b.code = 'VINAMILK' AND u.code = 'VE'
ON CONFLICT (code) DO NOTHING;

-- Sản phẩm 10: Nước rửa chén Sunlight
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, is_active, has_variants)
SELECT 'TR002', 'Nước rửa chén Sunlight 750ml', 
       c.id, b.id, u.id,
       'Nước rửa chén diệt khuẩn, chai 750ml', TRUE, FALSE
FROM subdim_categories c, subdim_brands b, subdim_units u
WHERE c.code = 'DETERGENT' AND b.code = 'UNILEVER' AND u.code = 'CHAI'
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 6. SEED DATA: Product Variants (SKU, Barcode, Giá)
-- =====================================================

-- Variant cho sản phẩm MI001 - Mì Hảo Hảo
INSERT INTO dim_product_variants (product_id, sku, barcode, variant_name, cost_price, selling_price, is_active)
SELECT p.id, 'MI001-SKU', '8934563138165', 'Gói 75g', 3000, 5000, TRUE
FROM dim_products p WHERE p.code = 'MI001'
ON CONFLICT (sku) DO NOTHING;

-- Variant cho sản phẩm GV001 - Bột ngọt
INSERT INTO dim_product_variants (product_id, sku, barcode, variant_name, cost_price, selling_price, is_active)
SELECT p.id, 'GV001-SKU', '8934563138172', 'Túi 400g', 25000, 38000, TRUE
FROM dim_products p WHERE p.code = 'GV001'
ON CONFLICT (sku) DO NOTHING;

-- Variant cho sản phẩm DA001 - Dầu ăn
INSERT INTO dim_product_variants (product_id, sku, barcode, variant_name, cost_price, selling_price, is_active)
SELECT p.id, 'DA001-SKU', '8934563138189', 'Chai 1L', 35000, 52000, TRUE
FROM dim_products p WHERE p.code = 'DA001'
ON CONFLICT (sku) DO NOTHING;

-- Variant cho sản phẩm NM001 - Nước mắm
INSERT INTO dim_product_variants (product_id, sku, barcode, variant_name, cost_price, selling_price, is_active)
SELECT p.id, 'NM001-SKU', '8934563138196', 'Chai 500ml', 18000, 28000, TRUE
FROM dim_products p WHERE p.code = 'NM001'
ON CONFLICT (sku) DO NOTHING;

-- Variant cho sản phẩm BK001 - Bánh Chocopie
INSERT INTO dim_product_variants (product_id, sku, barcode, variant_name, cost_price, selling_price, is_active)
SELECT p.id, 'BK001-SKU', '8934563138203', 'Hộp 12 cái', 42000, 65000, TRUE
FROM dim_products p WHERE p.code = 'BK001'
ON CONFLICT (sku) DO NOTHING;

-- Variant cho sản phẩm CF001 - Cà phê
INSERT INTO dim_product_variants (product_id, sku, barcode, variant_name, cost_price, selling_price, is_active)
SELECT p.id, 'CF001-SKU', '8934563138210', 'Hộp 20 gói', 55000, 85000, TRUE
FROM dim_products p WHERE p.code = 'CF001'
ON CONFLICT (sku) DO NOTHING;

-- Variant cho sản phẩm NG001 - Pepsi
INSERT INTO dim_product_variants (product_id, sku, barcode, variant_name, cost_price, selling_price, is_active)
SELECT p.id, 'NG001-SKU', '8934563138227', 'Lon 330ml', 7000, 12000, TRUE
FROM dim_products p WHERE p.code = 'NG001'
ON CONFLICT (sku) DO NOTHING;

-- Variant cho sản phẩm SD001 - Sữa đặc
INSERT INTO dim_product_variants (product_id, sku, barcode, variant_name, cost_price, selling_price, is_active)
SELECT p.id, 'SD001-SKU', '8934563138234', 'Lon 380g', 22000, 32000, TRUE
FROM dim_products p WHERE p.code = 'SD001'
ON CONFLICT (sku) DO NOTHING;

-- Variant cho sản phẩm TR001 - Trứng
INSERT INTO dim_product_variants (product_id, sku, barcode, variant_name, cost_price, selling_price, is_active)
SELECT p.id, 'TR001-SKU', '8934563138241', 'Vỉ 10 quả', 28000, 38000, TRUE
FROM dim_products p WHERE p.code = 'TR001'
ON CONFLICT (sku) DO NOTHING;

-- Variant cho sản phẩm TR002 - Nước rửa chén
INSERT INTO dim_product_variants (product_id, sku, barcode, variant_name, cost_price, selling_price, is_active)
SELECT p.id, 'TR002-SKU', '8934563138258', 'Chai 750ml', 20000, 32000, TRUE
FROM dim_products p WHERE p.code = 'TR002'
ON CONFLICT (sku) DO NOTHING;

-- =====================================================
-- 7. SEED DATA: Inventory Stocks (Tồn kho)
-- =====================================================

-- Thêm tồn kho cho 10 sản phẩm mới tại Store 1 (MiniMart Hà Nội)
INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 1, v.id, 
       CASE 
           WHEN v.sku = 'MI001-SKU' THEN 15   -- Sắp hết
           WHEN v.sku = 'GV001-SKU' THEN 8    -- Sắp hết
           WHEN v.sku = 'TR001-SKU' THEN 0    -- Hết hàng
           ELSE FLOOR(RANDOM() * 100 + 50)    -- Random 50-150
       END,
       20, 200
FROM dim_product_variants v
WHERE v.sku IN ('MI001-SKU', 'GV001-SKU', 'DA001-SKU', 'NM001-SKU', 'BK001-SKU', 
                'CF001-SKU', 'NG001-SKU', 'SD001-SKU', 'TR001-SKU', 'TR002-SKU')
ON CONFLICT (store_id, variant_id) DO NOTHING;

-- Thêm tồn kho tại Store 2 (MiniMart Hồ Chí Minh)
INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 2, v.id, 
       FLOOR(RANDOM() * 150 + 100),  -- Random 100-250
       30, 300
FROM dim_product_variants v
WHERE v.sku IN ('MI001-SKU', 'GV001-SKU', 'DA001-SKU', 'NM001-SKU', 'BK001-SKU', 
                'CF001-SKU', 'NG001-SKU', 'SD001-SKU', 'TR001-SKU', 'TR002-SKU')
ON CONFLICT (store_id, variant_id) DO NOTHING;

-- =====================================================
-- 8. VERIFY: Kiểm tra dữ liệu đã tạo
-- =====================================================
SELECT 'Brands:' as info, COUNT(*) as count FROM subdim_brands
UNION ALL
SELECT 'Categories:', COUNT(*) FROM subdim_categories
UNION ALL
SELECT 'Units:', COUNT(*) FROM subdim_units
UNION ALL
SELECT 'Products:', COUNT(*) FROM dim_products
UNION ALL
SELECT 'Variants:', COUNT(*) FROM dim_product_variants
UNION ALL
SELECT 'Inventory:', COUNT(*) FROM fact_inventory_stocks;

-- Chi tiết sản phẩm với giá
SELECT 
    p.code,
    p.name as product_name,
    c.name as category,
    b.name as brand,
    u.name as unit,
    v.selling_price,
    s.quantity_on_hand as stock
FROM dim_products p
JOIN subdim_categories c ON p.category_id = c.id
LEFT JOIN subdim_brands b ON p.brand_id = b.id
JOIN subdim_units u ON p.unit_id = u.id
JOIN dim_product_variants v ON v.product_id = p.id
LEFT JOIN fact_inventory_stocks s ON s.variant_id = v.id AND s.store_id = 1
ORDER BY p.id;

-- =====================================================
-- 9. SEED DATA: Thêm khách hàng (dim_customers)
-- =====================================================
-- Lưu ý: dim_time đã được tạo từ file insert_dim_time_only.sql

-- Thêm nhóm khách hàng nếu chưa có
INSERT INTO subdim_customer_groups (code, name, discount_percentage, min_purchase_amount) VALUES
('REGULAR', 'Khách hàng thường', 0, 0),
('SILVER', 'Khách hàng bạc', 3, 1000000),
('GOLD', 'Khách hàng vàng', 5, 5000000),
('PLATINUM', 'Khách hàng kim cương', 10, 20000000)
ON CONFLICT (code) DO NOTHING;

-- Thêm 10 khách hàng
INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender, total_lifetime_value)
SELECT 'KH001', 'Nguyễn Văn An', '0901234567', 'nguyenvanan@gmail.com', 
       g.id, c.id, '123 Lê Lợi, Quận 1', '1990-05-15', 'male', 15600000
FROM subdim_customer_groups g, subdim_cities c
WHERE g.code = 'GOLD' AND c.code = 'HN'
ON CONFLICT (code) DO NOTHING;

INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender, total_lifetime_value)
SELECT 'KH002', 'Trần Thị Bình', '0912345678', 'tranthibinh@gmail.com', 
       g.id, c.id, '456 Nguyễn Huệ, Quận 1', '1985-08-20', 'female', 8250000
FROM subdim_customer_groups g, subdim_cities c
WHERE g.code = 'SILVER' AND c.code = 'HCM'
ON CONFLICT (code) DO NOTHING;

INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender, total_lifetime_value)
SELECT 'KH003', 'Lê Văn Cường', '0923456789', 'levancuong@gmail.com', 
       g.id, c.id, '789 Trần Hưng Đạo, Quận 5', '1992-03-10', 'male', 5400000
FROM subdim_customer_groups g, subdim_cities c
WHERE g.code = 'SILVER' AND c.code = 'HN'
ON CONFLICT (code) DO NOTHING;

INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender, total_lifetime_value)
SELECT 'KH004', 'Phạm Thị Dung', '0934567890', 'phamthidung@gmail.com', 
       g.id, c.id, '321 Hai Bà Trưng, Quận 3', '1988-11-25', 'female', 3200000
FROM subdim_customer_groups g, subdim_cities c
WHERE g.code = 'REGULAR' AND c.code = 'HCM'
ON CONFLICT (code) DO NOTHING;

INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender, total_lifetime_value)
SELECT 'KH005', 'Hoàng Văn Em', '0945678901', 'hoangvanem@gmail.com', 
       g.id, c.id, '654 Lý Thường Kiệt, Quận 10', '1995-07-08', 'male', 2100000
FROM subdim_customer_groups g, subdim_cities c
WHERE g.code = 'REGULAR' AND c.code = 'HN'
ON CONFLICT (code) DO NOTHING;

INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender, total_lifetime_value)
SELECT 'KH006', 'Đỗ Ngọc Giang', '0956789012', 'dongocgiang@gmail.com', 
       g.id, c.id, '987 Đinh Tiên Hoàng, Quận Bình Thạnh', '1991-12-30', 'male', 4800000
FROM subdim_customer_groups g, subdim_cities c
WHERE g.code = 'SILVER' AND c.code = 'HCM'
ON CONFLICT (code) DO NOTHING;

INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender, total_lifetime_value)
SELECT 'KH007', 'Vũ Thị Hương', '0967890123', 'vuthihuong@gmail.com', 
       g.id, c.id, '147 Cách Mạng Tháng 8, Quận 3', '1993-04-18', 'female', 1500000
FROM subdim_customer_groups g, subdim_cities c
WHERE g.code = 'REGULAR' AND c.code = 'HN'
ON CONFLICT (code) DO NOTHING;

INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender, total_lifetime_value)
SELECT 'KH008', 'Bùi Văn Khoa', '0978901234', 'buivankhoa@gmail.com', 
       g.id, c.id, '258 Võ Văn Tần, Quận 3', '1987-09-05', 'male', 6700000
FROM subdim_customer_groups g, subdim_cities c
WHERE g.code = 'GOLD' AND c.code = 'HCM'
ON CONFLICT (code) DO NOTHING;

INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender, total_lifetime_value)
SELECT 'KH009', 'Ngô Thị Lan', '0989012345', 'ngothilan@gmail.com', 
       g.id, c.id, '369 Nguyễn Thị Minh Khai, Quận 1', '1994-01-22', 'female', 900000
FROM subdim_customer_groups g, subdim_cities c
WHERE g.code = 'REGULAR' AND c.code = 'HN'
ON CONFLICT (code) DO NOTHING;

INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender, total_lifetime_value)
SELECT 'KH010', 'Đinh Văn Minh', '0990123456', 'dinhvanminh@gmail.com', 
       g.id, c.id, '741 Phan Xích Long, Quận Phú Nhuận', '1989-06-14', 'male', 12500000
FROM subdim_customer_groups g, subdim_cities c
WHERE g.code = 'GOLD' AND c.code = 'HCM'
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 10. SEED DATA: Thêm 10 đơn hàng (fact_orders)
-- =====================================================

-- Đơn hàng 1: Khách VIP mua nhiều
INSERT INTO fact_orders (order_code, date_key, customer_id, store_id, status, payment_status, subtotal, discount_amount, tax_amount, shipping_fee, final_amount, payment_method, created_by, created_at)
SELECT 'DH001', '2026-01-15', c.id, 1, 'completed', 'paid', 525000, 26250, 0, 0, 498750, 'cash', 1, '2026-01-15 09:30:00'
FROM dim_customers c WHERE c.code = 'KH001'
ON CONFLICT (order_code) DO NOTHING;

-- Đơn hàng 2: Khách thường
INSERT INTO fact_orders (order_code, date_key, customer_id, store_id, status, payment_status, subtotal, discount_amount, tax_amount, shipping_fee, final_amount, payment_method, created_by, created_at)
SELECT 'DH002', '2026-01-16', c.id, 1, 'completed', 'paid', 185000, 0, 0, 0, 185000, 'transfer', 1, '2026-01-16 10:15:00'
FROM dim_customers c WHERE c.code = 'KH002'
ON CONFLICT (order_code) DO NOTHING;

-- Đơn hàng 3: Đơn đang xử lý
INSERT INTO fact_orders (order_code, date_key, customer_id, store_id, status, payment_status, subtotal, discount_amount, tax_amount, shipping_fee, final_amount, payment_method, created_by, created_at)
SELECT 'DH003', '2026-01-17', c.id, 1, 'processing', 'pending', 320000, 9600, 0, 15000, 325400, 'cod', 1, '2026-01-17 14:20:00'
FROM dim_customers c WHERE c.code = 'KH003'
ON CONFLICT (order_code) DO NOTHING;

-- Đơn hàng 4: Đơn đã hủy
INSERT INTO fact_orders (order_code, date_key, customer_id, store_id, status, payment_status, subtotal, discount_amount, tax_amount, shipping_fee, final_amount, payment_method, created_by, created_at)
SELECT 'DH004', '2026-01-18', c.id, 2, 'cancelled', 'refunded', 150000, 0, 0, 0, 0, 'cash', 1, '2026-01-18 11:45:00'
FROM dim_customers c WHERE c.code = 'KH004'
ON CONFLICT (order_code) DO NOTHING;

-- Đơn hàng 5: Đơn lớn từ khách VIP
INSERT INTO fact_orders (order_code, date_key, customer_id, store_id, status, payment_status, subtotal, discount_amount, tax_amount, shipping_fee, final_amount, payment_method, created_by, created_at)
SELECT 'DH005', '2026-01-19', c.id, 1, 'completed', 'paid', 1250000, 62500, 0, 0, 1187500, 'card', 1, '2026-01-19 16:30:00'
FROM dim_customers c WHERE c.code = 'KH001'
ON CONFLICT (order_code) DO NOTHING;

-- Đơn hàng 6: Đơn giao hàng
INSERT INTO fact_orders (order_code, date_key, customer_id, store_id, status, payment_status, subtotal, discount_amount, tax_amount, shipping_fee, final_amount, payment_method, shipping_address, created_by, created_at)
SELECT 'DH006', '2026-01-20', c.id, 1, 'shipping', 'paid', 450000, 13500, 0, 25000, 461500, 'transfer', '987 Đinh Tiên Hoàng, Q. Bình Thạnh', 1, '2026-01-20 08:00:00'
FROM dim_customers c WHERE c.code = 'KH006'
ON CONFLICT (order_code) DO NOTHING;

-- Đơn hàng 7: Đơn hoàn thành - khách mới
INSERT INTO fact_orders (order_code, date_key, customer_id, store_id, status, payment_status, subtotal, discount_amount, tax_amount, shipping_fee, final_amount, payment_method, created_by, created_at)
SELECT 'DH007', '2026-01-21', c.id, 2, 'completed', 'paid', 89000, 0, 0, 0, 89000, 'cash', 1, '2026-01-21 12:10:00'
FROM dim_customers c WHERE c.code = 'KH007'
ON CONFLICT (order_code) DO NOTHING;

-- Đơn hàng 8: Đơn chờ xác nhận
INSERT INTO fact_orders (order_code, date_key, customer_id, store_id, status, payment_status, subtotal, discount_amount, tax_amount, shipping_fee, final_amount, payment_method, created_by, created_at)
SELECT 'DH008', '2026-01-22', c.id, 1, 'pending', 'pending', 675000, 33750, 0, 20000, 661250, 'cod', 1, '2026-01-22 09:45:00'
FROM dim_customers c WHERE c.code = 'KH008'
ON CONFLICT (order_code) DO NOTHING;

-- Đơn hàng 9: Khách vãng lai (không có customer_id)
INSERT INTO fact_orders (order_code, date_key, customer_id, store_id, status, payment_status, subtotal, discount_amount, tax_amount, shipping_fee, final_amount, payment_method, customer_note, created_by, created_at)
VALUES ('DH009', '2026-01-22', NULL, 1, 'completed', 'paid', 52000, 0, 0, 0, 52000, 'cash', 'Khách vãng lai', 1, '2026-01-22 15:20:00')
ON CONFLICT (order_code) DO NOTHING;

-- Đơn hàng 10: Đơn mới nhất hôm nay
INSERT INTO fact_orders (order_code, date_key, customer_id, store_id, status, payment_status, subtotal, discount_amount, tax_amount, shipping_fee, final_amount, payment_method, created_by, created_at)
SELECT 'DH010', '2026-01-23', c.id, 1, 'completed', 'paid', 385000, 19250, 0, 0, 365750, 'card', 1, '2026-01-23 10:00:00'
FROM dim_customers c WHERE c.code = 'KH010'
ON CONFLICT (order_code) DO NOTHING;

-- =====================================================
-- 11. SEED DATA: Chi tiết đơn hàng (fact_order_items)
-- =====================================================

-- Đơn hàng 1: 3 sản phẩm
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 10, 5000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH001' AND v.sku = 'MI001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 5, 38000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH001' AND v.sku = 'GV001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 5, 52000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH001' AND v.sku = 'DA001-SKU'
ON CONFLICT DO NOTHING;

-- Đơn hàng 2: 2 sản phẩm
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 5, 28000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH002' AND v.sku = 'NM001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 3, 15000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH002' AND v.sku = 'MI001-SKU'
ON CONFLICT DO NOTHING;

-- Đơn hàng 3: 4 sản phẩm
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 2, 65000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH003' AND v.sku = 'BK001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 1, 85000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH003' AND v.sku = 'CF001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 5, 12000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH003' AND v.sku = 'NG001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 1, 15000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH003' AND v.sku = 'MI001-SKU'
ON CONFLICT DO NOTHING;

-- Đơn hàng 4 (đã hủy): 2 sản phẩm
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 3, 32000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH004' AND v.sku = 'SD001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 2, 27000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH004' AND v.sku = 'NM001-SKU'
ON CONFLICT DO NOTHING;

-- Đơn hàng 5 (đơn lớn VIP): 6 sản phẩm
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 50, 5000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH005' AND v.sku = 'MI001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 10, 52000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH005' AND v.sku = 'DA001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 5, 38000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH005' AND v.sku = 'GV001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 10, 28000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH005' AND v.sku = 'NM001-SKU'
ON CONFLICT DO NOTHING;

-- Đơn hàng 6 (giao hàng): 3 sản phẩm
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 3, 85000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH006' AND v.sku = 'CF001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 5, 32000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH006' AND v.sku = 'SD001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 3, 32000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH006' AND v.sku = 'TR002-SKU'
ON CONFLICT DO NOTHING;

-- Đơn hàng 7 (khách mới): 2 sản phẩm
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 1, 65000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH007' AND v.sku = 'BK001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 2, 12000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH007' AND v.sku = 'NG001-SKU'
ON CONFLICT DO NOTHING;

-- Đơn hàng 8 (chờ xác nhận): 5 sản phẩm
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 20, 5000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH008' AND v.sku = 'MI001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 5, 52000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH008' AND v.sku = 'DA001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 3, 38000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH008' AND v.sku = 'GV001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 2, 65000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH008' AND v.sku = 'BK001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 1, 85000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH008' AND v.sku = 'CF001-SKU'
ON CONFLICT DO NOTHING;

-- Đơn hàng 9 (khách vãng lai): 1 sản phẩm
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 4, 13000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH009' AND v.sku = 'NG001-SKU'
ON CONFLICT DO NOTHING;

-- Đơn hàng 10 (hôm nay): 4 sản phẩm
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 5, 38000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH010' AND v.sku = 'TR001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 2, 52000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH010' AND v.sku = 'DA001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 3, 28000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH010' AND v.sku = 'NM001-SKU'
ON CONFLICT DO NOTHING;
INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
SELECT o.id, v.id, 1, 85000, 0 FROM fact_orders o, dim_product_variants v WHERE o.order_code = 'DH010' AND v.sku = 'CF001-SKU'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 12. VERIFY: Kiểm tra dữ liệu đơn hàng
-- =====================================================
SELECT 'Customers:' as info, COUNT(*) as count FROM dim_customers
UNION ALL
SELECT 'Orders:', COUNT(*) FROM fact_orders
UNION ALL
SELECT 'Order Items:', COUNT(*) FROM fact_order_items
UNION ALL
SELECT 'Time Dimension:', COUNT(*) FROM dim_time;

-- Danh sách đơn hàng chi tiết
SELECT 
    o.order_code,
    c.full_name as customer_name,
    o.date_key,
    o.status,
    o.payment_status,
    o.final_amount,
    o.payment_method,
    COUNT(oi.id) as total_items
FROM fact_orders o
LEFT JOIN dim_customers c ON o.customer_id = c.id
LEFT JOIN fact_order_items oi ON o.id = oi.order_id
GROUP BY o.id, c.full_name
ORDER BY o.created_at DESC;
