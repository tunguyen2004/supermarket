-- =====================================================
-- SUPERMARKET MANAGEMENT SYSTEM - SEED DATA
-- Version: 4.1 | Date: 25/02/2026
-- Có thể chạy lại nhiều lần (idempotent)
-- Orders được sinh bằng incremental_data_generator.sql
-- =====================================================
-- CHANGELOG v4.1:
--   [FIX] Cities count trong completion message: 10 → 63
--   [FIX] Phone generation: dùng i làm seed để tránh duplicate
--   [FIX] Store city references: hardcode id → subquery theo code
--   [FIX] Customer supplier city references: hardcode → subquery theo code
--   [FIX] Cashbook transaction: subquery NULL → COALESCE + guard
--   [IMPROVE] Customer group weights: thêm comment rõ ràng về mapping
-- =====================================================

-- =========================
-- CLEAR OLD DATA (nếu có)
-- =========================
DO $$
BEGIN
    -- Truncate fact tables first
    TRUNCATE TABLE fact_shipment_tracking, fact_shipments, fact_store_balances,
                   fact_cashbook_transactions, fact_discount_usages, fact_order_items,
                   fact_orders, fact_inventory_transactions, fact_inventory_stocks CASCADE;
    
    -- Truncate dimension tables
    TRUNCATE TABLE dim_bank_accounts, dim_discounts, dim_carriers, dim_product_variants,
                   dim_product_images, dim_products, dim_users, dim_customers, dim_suppliers,
                   dim_stores, dim_time CASCADE;
    
    -- Truncate sub-dimension tables
    TRUNCATE TABLE role_permissions, subdim_permissions, subdim_roles, subdim_shipment_statuses,
                   subdim_payment_methods, subdim_cashbook_types, subdim_discount_types,
                   subdim_transaction_types, subdim_store_types, subdim_customer_groups,
                   subdim_units, subdim_brands, subdim_categories, subdim_cities, subdim_regions CASCADE;
    
    RAISE NOTICE '✅ Cleared old data';
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE '⚠️ Some tables do not exist yet, skipping truncate';
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Error during truncate: %, skipping', SQLERRM;
END $$;

-- =========================
-- RESET SEQUENCES
-- =========================
DO $$
DECLARE
    seq_name TEXT;
BEGIN
    FOR seq_name IN 
        SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public'
    LOOP
        EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', seq_name);
    END LOOP;
    RAISE NOTICE '✅ Reset all sequences';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Error resetting sequences: %', SQLERRM;
END $$;

-- =========================
-- LEVEL 3: REGIONS
-- =========================
INSERT INTO subdim_regions (code, name, description) VALUES
    ('MB', 'Miền Bắc', 'Các tỉnh thành phía Bắc'),
    ('MT', 'Miền Trung', 'Các tỉnh thành miền Trung'),
    ('MN', 'Miền Nam', 'Các tỉnh thành phía Nam');

-- =========================
-- LEVEL 2: CITIES (63 cities)
-- =========================
INSERT INTO subdim_cities (code, name, region_id) VALUES
    -- Miền Bắc (region_id = 1)
    ('HN',    'Hà Nội',          1),
    ('HP',    'Hải Phòng',       1),
    ('BN',    'Bắc Ninh',        1),
    ('HG',    'Hà Giang',        1),
    ('CB',    'Cao Bằng',        1),
    ('BK',    'Bắc Kạn',         1),
    ('TQ',    'Tuyên Quang',     1),
    ('LC',    'Lào Cai',         1),
    ('DB',    'Điện Biên',       1),
    ('LAC',   'Lai Châu',        1),
    ('SL',    'Sơn La',          1),
    ('YB',    'Yên Bái',         1),
    ('HB',    'Hoà Bình',        1),
    ('TN',    'Thái Nguyên',     1),
    ('LS',    'Lạng Sơn',        1),
    ('QN',    'Quảng Ninh',      1),
    ('BG',    'Bắc Giang',       1),
    ('PT',    'Phú Thọ',         1),
    ('VP',    'Vĩnh Phúc',       1),
    ('HD',    'Hải Dương',       1),
    ('HY',    'Hưng Yên',        1),
    ('TB',    'Thái Bình',       1),
    ('HNA',   'Hà Nam',          1),
    ('ND',    'Nam Định',        1),
    ('NB',    'Ninh Bình',       1),
    -- Miền Trung (region_id = 2)
    ('TH',    'Thanh Hoá',       2),
    ('NA',    'Nghệ An',         2),
    ('HT',    'Hà Tĩnh',        2),
    ('QB',    'Quảng Bình',      2),
    ('QT',    'Quảng Trị',       2),
    ('HUE',   'Thừa Thiên Huế', 2),
    ('DN',    'Đà Nẵng',         2),
    ('QNA',   'Quảng Nam',       2),
    ('QNG',   'Quảng Ngãi',      2),
    ('BDI',   'Bình Định',       2),
    ('PY',    'Phú Yên',         2),
    ('KH',    'Khánh Hoà',       2),
    ('NT',    'Ninh Thuận',      2),
    ('BTH',   'Bình Thuận',      2),
    ('KT',    'Kon Tum',         2),
    ('GL',    'Gia Lai',         2),
    ('DL',    'Đắk Lắk',        2),
    ('DNO',   'Đắk Nông',       2),
    ('LD',    'Lâm Đồng',       2),
    -- Miền Nam (region_id = 3)
    ('HCM',   'TP Hồ Chí Minh', 3),
    ('BD',    'Bình Dương',      3),
    ('CT',    'Cần Thơ',         3),
    ('VT',    'Bà Rịa - Vũng Tàu', 3),
    ('BP',    'Bình Phước',      3),
    ('TNI',   'Tây Ninh',        3),
    ('DNG',   'Đồng Nai',       3),
    ('LA',    'Long An',         3),
    ('TG',    'Tiền Giang',      3),
    ('BT',    'Bến Tre',         3),
    ('TV',    'Trà Vinh',        3),
    ('VL',    'Vĩnh Long',       3),
    ('DT',    'Đồng Tháp',      3),
    ('AG',    'An Giang',        3),
    ('KG',    'Kiên Giang',      3),
    ('HGI',   'Hậu Giang',      3),
    ('STR',   'Sóc Trăng',      3),
    ('BL',    'Bạc Liêu',       3),
    ('CM',    'Cà Mau',          3);

-- =========================
-- CATEGORIES (Hierarchy)
-- =========================
INSERT INTO subdim_categories (code, name, parent_id, level, path) VALUES
    -- Level 0 - Main categories
    ('FOOD', 'Thực phẩm', NULL, 0, '/1'),
    ('DRINK', 'Đồ uống', NULL, 0, '/2'),
    ('SNACK', 'Bánh kẹo', NULL, 0, '/3'),
    ('DAIRY', 'Sữa', NULL, 0, '/4'),
    ('FROZEN', 'Đông lạnh', NULL, 0, '/5'),
    ('FRESH', 'Tươi sống', NULL, 0, '/6'),
    ('SEASONING', 'Gia vị', NULL, 0, '/7'),
    ('HOUSEHOLD', 'Gia dụng', NULL, 0, '/8'),
    ('PERSONAL', 'Cá nhân', NULL, 0, '/9'),
    ('BABY', 'Em bé', NULL, 0, '/10'),
    
    -- Level 1 - Sub categories
    ('INSTANT', 'Mì gói', 1, 1, '/1/11'),
    ('SOFT_DRINK', 'Nước ngọt', 2, 1, '/2/12'),
    ('JUICE', 'Nước ép', 2, 1, '/2/13'),
    ('MILK', 'Sữa tươi', 4, 1, '/4/14'),
    ('YOGURT', 'Sữa chua', 4, 1, '/4/15'),
    ('CHIPS', 'Snack', 3, 1, '/3/16'),
    ('CANDY', 'Kẹo', 3, 1, '/3/17'),
    ('SAUCE', 'Nước mắm/Tương', 7, 1, '/7/18'),
    ('SPICE', 'Gia vị khô', 7, 1, '/7/19'),
    ('DETERGENT', 'Nước giặt', 8, 1, '/8/20'),
    ('SOAP', 'Xà phòng', 9, 1, '/9/21'),
    ('SHAMPOO', 'Dầu gội', 9, 1, '/9/22'),
    ('DIAPER', 'Tã bỉm', 10, 1, '/10/23'),
    ('FORMULA', 'Sữa bột', 10, 1, '/10/24');

-- =========================
-- BRANDS
-- =========================
INSERT INTO subdim_brands (code, name, origin_country, description) VALUES
    ('ACE', 'Acecook', 'Việt Nam', 'Thương hiệu mì ăn liền hàng đầu'),
    ('OMI', 'Omachi', 'Việt Nam', 'Mì cao cấp của Masan'),
    ('ASIA', 'Asia', 'Việt Nam', 'Mì giá rẻ phổ biến'),
    ('COCA', 'Coca-Cola', 'Mỹ', 'Nước giải khát số 1 thế giới'),
    ('PEPSI', 'Pepsi', 'Mỹ', 'Đối thủ cạnh tranh của Coca'),
    ('STING', 'Sting', 'Việt Nam', 'Nước tăng lực'),
    ('REDBULL', 'Red Bull', 'Thái Lan', 'Nước tăng lực quốc tế'),
    ('NUTRI', 'NutiFood', 'Việt Nam', 'Dinh dưỡng cho mọi lứa tuổi'),
    ('VINAMILK', 'Vinamilk', 'Việt Nam', 'Thương hiệu sữa hàng đầu VN'),
    ('TH', 'TH True Milk', 'Việt Nam', 'Sữa tươi sạch organic'),
    ('DUTCH', 'Dutch Lady', 'Hà Lan', 'Sữa nhập khẩu cao cấp'),
    ('OISHI', 'Oishi', 'Thái Lan', 'Snack và bánh kẹo'),
    ('LAYS', 'Lay''s', 'Mỹ', 'Snack khoai tây nổi tiếng'),
    ('POCA', 'Poca', 'Việt Nam', 'Snack Việt Nam'),
    ('CHINCHIN', 'Chin-su', 'Việt Nam', 'Gia vị Masan'),
    ('MAGGII', 'Maggi', 'Thụy Sĩ', 'Gia vị Nestle'),
    ('OMO', 'OMO', 'Việt Nam', 'Nước giặt Unilever'),
    ('ARIEL', 'Ariel', 'Mỹ', 'Nước giặt P&G'),
    ('DOVE', 'Dove', 'Mỹ', 'Chăm sóc cá nhân'),
    ('CLEAR', 'Clear', 'Việt Nam', 'Dầu gội Unilever'),
    ('SUNSILK', 'Sunsilk', 'Việt Nam', 'Dầu gội cho phụ nữ'),
    ('HUGGIES', 'Huggies', 'Mỹ', 'Tã bỉm Kimberly-Clark'),
    ('BOBBY', 'Bobby', 'Việt Nam', 'Tã bỉm Việt Nam'),
    ('NESCAFE', 'Nescafe', 'Thụy Sĩ', 'Cà phê hòa tan Nestle');

-- =========================
-- UNITS
-- =========================
INSERT INTO subdim_units (code, name, base_unit) VALUES
    ('GOI', 'Gói', TRUE),
    ('HOP', 'Hộp', FALSE),
    ('THUNG', 'Thùng', FALSE),
    ('CHAI', 'Chai', FALSE),
    ('LON', 'Lon', FALSE),
    ('KG', 'Kilogram', TRUE),
    ('G', 'Gram', FALSE),
    ('L', 'Lít', TRUE),
    ('ML', 'Mililít', FALSE),
    ('CAI', 'Cái', TRUE);

-- =========================
-- CUSTOMER GROUPS
-- =========================
INSERT INTO subdim_customer_groups (code, name, discount_percentage, min_purchase_amount) VALUES
    ('VIP',    'Khách hàng VIP',    10.00, 30000000),  -- id=1
    ('GOLD',   'Khách hàng Vàng',   7.00,  10000000),  -- id=2
    ('BRONZE', 'Khách hàng Đồng',   5.00,  5000000),   -- id=3
    ('SILVER', 'Khách hàng Bạc',    3.00,  2000000),   -- id=4
    ('NORMAL', 'Khách hàng thường', 0.00,  0);          -- id=5

-- =========================
-- STORE TYPES
-- =========================
INSERT INTO subdim_store_types (code, name) VALUES
    ('SUPER',     'Siêu thị'),
    ('MINI',      'Cửa hàng tiện lợi'),
    ('WAREHOUSE', 'Kho tổng'),
    ('ONLINE',    'Cửa hàng online');

-- =========================
-- TRANSACTION TYPES
-- =========================
INSERT INTO subdim_transaction_types (code, name, affects_stock) VALUES
    ('IMPORT',       'Nhập hàng',        1),
    ('EXPORT',       'Xuất hàng',        -1),
    ('RETURN',       'Trả hàng nhập',    -1),
    ('ADJUSTMENT',   'Điều chỉnh',       0),
    ('TRANSFER_OUT', 'Chuyển kho đi',    -1),
    ('TRANSFER_IN',  'Chuyển kho đến',   1),
    ('DAMAGE',       'Hàng hỏng',        -1),
    ('EXPIRED',      'Hàng hết hạn',     -1);

-- =========================
-- ROLES
-- =========================
INSERT INTO subdim_roles (code, name, description) VALUES
    ('ADMIN', 'Administrator', 'Quản trị viên hệ thống - Full quyền'),
    ('STAFF', 'Sales Staff',   'Nhân viên bán hàng - Bán hàng, thu ngân, xem kho');

-- =========================
-- PERMISSIONS
-- =========================
INSERT INTO subdim_permissions (code, name, resource, action) VALUES
    ('PRODUCT_VIEW',    'Xem sản phẩm',          'product',   'view'),
    ('PRODUCT_CREATE',  'Tạo sản phẩm',          'product',   'create'),
    ('PRODUCT_EDIT',    'Sửa sản phẩm',          'product',   'edit'),
    ('PRODUCT_DELETE',  'Xóa sản phẩm',          'product',   'delete'),
    ('ORDER_VIEW',      'Xem đơn hàng',           'order',     'view'),
    ('ORDER_CREATE',    'Tạo đơn hàng',           'order',     'create'),
    ('ORDER_EDIT',      'Sửa đơn hàng',           'order',     'edit'),
    ('ORDER_DELETE',    'Hủy đơn hàng',           'order',     'delete'),
    ('CUSTOMER_VIEW',   'Xem khách hàng',         'customer',  'view'),
    ('CUSTOMER_CREATE', 'Tạo khách hàng',         'customer',  'create'),
    ('CUSTOMER_EDIT',   'Sửa khách hàng',         'customer',  'edit'),
    ('INVENTORY_VIEW',  'Xem kho',                'inventory', 'view'),
    ('INVENTORY_IMPORT','Nhập kho',               'inventory', 'import'),
    ('INVENTORY_EXPORT','Xuất kho',               'inventory', 'export'),
    ('REPORT_VIEW',     'Xem báo cáo',            'report',    'view'),
    ('USER_MANAGE',     'Quản lý người dùng',     'user',      'manage'),
    ('SYSTEM_CONFIG',   'Cấu hình hệ thống',      'system',    'config');

-- =========================
-- ROLE PERMISSIONS MAPPING
-- =========================
-- Admin (role_id=1) has all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM subdim_permissions;

-- Staff (role_id=2) permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM subdim_permissions 
WHERE code IN ('PRODUCT_VIEW', 'ORDER_VIEW', 'ORDER_CREATE', 
               'CUSTOMER_VIEW', 'CUSTOMER_CREATE', 'INVENTORY_VIEW');

-- =========================
-- DISCOUNT TYPES
-- =========================
INSERT INTO subdim_discount_types (code, name, description) VALUES
    ('PERCENTAGE',   'Giảm theo %',     'Giảm giá theo phần trăm tổng đơn hàng'),
    ('FIXED_AMOUNT', 'Giảm cố định',    'Giảm một số tiền cố định'),
    ('BUY_X_GET_Y',  'Mua X tặng Y',    'Mua số lượng X được tặng Y'),
    ('FREE_SHIPPING','Miễn phí ship',   'Miễn phí vận chuyển');

-- =========================
-- CASHBOOK TYPES
-- =========================
INSERT INTO subdim_cashbook_types (code, name, transaction_direction, description) VALUES
    ('SALES_INCOME',    'Thu từ bán hàng',   1,  'Tiền thu từ các đơn hàng'),
    ('OTHER_INCOME',    'Thu khác',           1,  'Các khoản thu khác'),
    ('PURCHASE_EXPENSE','Chi mua hàng',       -1, 'Chi trả nhà cung cấp'),
    ('SALARY_EXPENSE',  'Chi lương',          -1, 'Chi trả lương nhân viên'),
    ('RENT_EXPENSE',    'Chi thuê mặt bằng',  -1, 'Chi phí thuê kho/cửa hàng'),
    ('UTILITY_EXPENSE', 'Chi điện nước',      -1, 'Chi phí điện, nước, internet'),
    ('OTHER_EXPENSE',   'Chi khác',           -1, 'Các khoản chi khác'),
    ('REFUND',          'Hoàn tiền',          -1, 'Hoàn tiền cho khách hàng'),
    ('DEPOSIT',         'Nạp tiền',           1,  'Nạp tiền vào quỹ'),
    ('WITHDRAWAL',      'Rút tiền',           -1, 'Rút tiền từ quỹ');

-- =========================
-- PAYMENT METHODS
-- =========================
INSERT INTO subdim_payment_methods (code, name) VALUES
    ('CASH',          'Tiền mặt'),
    ('BANK_TRANSFER', 'Chuyển khoản ngân hàng'),
    ('CARD',          'Thẻ tín dụng/ghi nợ'),
    ('MOMO',          'Ví MoMo'),
    ('ZALOPAY',       'ZaloPay'),
    ('VNPAY',         'VNPay'),
    ('OTHER',         'Khác');

-- =========================
-- SHIPMENT STATUSES
-- =========================
INSERT INTO subdim_shipment_statuses (code, name, description, sort_order) VALUES
    ('pending',          'Chờ xử lý',       'Đơn hàng mới, chờ xác nhận',    1),
    ('confirmed',        'Đã xác nhận',     'Đã xác nhận, chuẩn bị hàng',    2),
    ('picking',          'Đang lấy hàng',   'Shipper đang lấy hàng từ kho',   3),
    ('picked',           'Đã lấy hàng',     'Shipper đã lấy hàng',            4),
    ('in_transit',       'Đang vận chuyển', 'Hàng đang trên đường giao',      5),
    ('out_for_delivery', 'Đang giao hàng',  'Shipper đang giao cho khách',    6),
    ('delivered',        'Đã giao hàng',    'Giao hàng thành công',           7),
    ('failed',           'Giao thất bại',   'Không giao được hàng',           8),
    ('returned',         'Đã hoàn hàng',    'Hàng đã hoàn về kho',            9),
    ('cancelled',        'Đã hủy',          'Đơn vận chuyển bị hủy',         10);

-- =========================
-- STORES (5 cửa hàng)
-- [FIX] Dùng subquery theo city code thay vì hardcode city_id
-- =========================
INSERT INTO dim_stores (code, name, store_type_id, city_id, address, phone, manager_name) VALUES
    ('HN001',  'MiniMart Hoàng Mai',  2, (SELECT id FROM subdim_cities WHERE code = 'HN'),  '123 Đường Giải Phóng, Hoàng Mai, Hà Nội',         '0241234567', 'Nguyễn Văn Minh'),
    ('HN002',  'MiniMart Cầu Giấy',  2, (SELECT id FROM subdim_cities WHERE code = 'HN'),  '456 Đường Trần Duy Hưng, Cầu Giấy, Hà Nội',      '0241234568', 'Trần Thị Hoa'),
    ('HCM001', 'SuperMart Quận 1',   1, (SELECT id FROM subdim_cities WHERE code = 'HCM'), '789 Đường Nguyễn Huệ, Quận 1, TP.HCM',           '0281234567', 'Lê Văn Nam'),
    ('HCM002', 'MiniMart Quận 7',    2, (SELECT id FROM subdim_cities WHERE code = 'HCM'), '321 Đường Nguyễn Thị Thập, Quận 7, TP.HCM',      '0281234568', 'Phạm Văn Đức'),
    ('WH001',  'Kho Tổng TP.HCM',   3, (SELECT id FROM subdim_cities WHERE code = 'HCM'), 'Khu công nghiệp Tân Bình, TP.HCM',               '0281234569', 'Võ Hoàng Anh');

-- =========================
-- SUPPLIERS (20 nhà cung cấp)
-- [FIX] Dùng subquery theo city code thay vì hardcode city_id
-- =========================
DO $$
DECLARE
    v_names TEXT[] := ARRAY[
        'Công ty TNHH Acecook Việt Nam',
        'Công ty CP Masan Consumer',
        'Công ty CP Sữa Việt Nam - Vinamilk',
        'Công ty TNHH Nước giải khát Coca-Cola',
        'Công ty CP Suntory PepsiCo',
        'Công ty CP Kido',
        'Công ty TNHH Unilever Việt Nam',
        'Công ty TNHH Nestlé Việt Nam',
        'Công ty CP Vissan',
        'Công ty TNHH P&G Việt Nam',
        'Công ty CP Bibica',
        'Công ty CP Kinh Đô',
        'Công ty TNHH Ajinomoto Việt Nam',
        'Công ty CP Đường Quảng Ngãi',
        'Công ty TNHH Abbott Việt Nam',
        'Công ty CP Colgate-Palmolive VN',
        'Công ty TNHH Bayer Việt Nam',
        'Công ty CP Cholimex Food',
        'Công ty TNHH La Vie',
        'Công ty CP Orion Food Vina'
    ];
    v_emails TEXT[] := ARRAY[
        'info@acecook.com.vn','sales@masan.com','sales@vinamilk.com.vn',
        'vn@coca-cola.com','sales@pepsico.vn','kido@kido.com.vn',
        'contact.vn@unilever.com','info@vn.nestle.com','sales@vissan.com.vn',
        'contact@pg.com.vn','info@bibica.com.vn','sales@kinhdo.com.vn',
        'info@ajinomoto.com.vn','duongqn@gmail.com','info@abbott.com.vn',
        'contact@colgate.vn','info@bayer.vn','sales@cholimex.com.vn',
        'info@lavie.com.vn','sales@orion.vn'
    ];
    -- [FIX] Dùng city code thay vì hardcode id
    v_city_codes TEXT[] := ARRAY[
        'HN','HCM','HCM','HCM','HCM','HCM','HCM','HN','HCM','HCM',
        'HCM','HCM','HCM','QNG','HCM','HCM','HN','HCM','HN','HCM'
    ];
    v_addresses TEXT[] := ARRAY[
        'KCN Thăng Long, Hà Nội',
        'Tòa nhà Masan, Quận 1, TP.HCM',
        '10 Tân Trào, Quận 7, TP.HCM',
        'Khu chế xuất Tân Thuận, TP.HCM',
        'KCN VSIP, Bình Dương',
        'Lô II-7, KCN Tân Bình, TP.HCM',
        '4 Phan Chu Trinh, Quận 1, TP.HCM',
        'Tòa nhà Peakview, Hà Nội',
        '420 Nơ Trang Long, Bình Thạnh, TP.HCM',
        'KCN Amata, Đồng Nai',
        'KCN Biên Hòa 2, Đồng Nai',
        'KCN Tây Bắc Củ Chi, TP.HCM',
        'Lô 22, KCN Biên Hòa 2, Đồng Nai',
        '02 Nguyễn Chí Thanh, Quảng Ngãi',
        '97 Nguyễn Văn Trỗi, Phú Nhuận, TP.HCM',
        'KCN Long Thành, Đồng Nai',
        'Tầng 8, Lotte Center, Hà Nội',
        'KCN Vĩnh Lộc, Bình Chánh, TP.HCM',
        'KCN Thăng Long II, Hưng Yên',
        'KCN Mỹ Phước, Bình Dương'
    ];
    v_payment TEXT[] := ARRAY[
        'Thanh toán trong 30 ngày','Thanh toán trong 45 ngày',
        'Thanh toán trong 30 ngày','Thanh toán ngay',
        'Thanh toán trong 30 ngày','Thanh toán trong 60 ngày',
        'Thanh toán trong 45 ngày','Thanh toán trong 30 ngày',
        'Thanh toán trong 30 ngày','Thanh toán trong 60 ngày',
        'Thanh toán trong 30 ngày','Thanh toán trong 45 ngày',
        'Thanh toán trong 30 ngày','Thanh toán ngay',
        'Thanh toán trong 45 ngày','Thanh toán trong 30 ngày',
        'Thanh toán trong 60 ngày','Thanh toán trong 30 ngày',
        'Thanh toán trong 30 ngày','Thanh toán trong 45 ngày'
    ];
    v_count INT := 20;
    i INT;
    v_city_id INT;
BEGIN
    FOR i IN 1..v_count LOOP
        -- [FIX] Lookup city_id by code
        SELECT id INTO v_city_id FROM subdim_cities WHERE code = v_city_codes[i];

        INSERT INTO dim_suppliers (code, name, city_id, address, phone, email, tax_code, payment_terms)
        VALUES (
            'NCC-202601-' || LPAD(i::TEXT, 5, '0'),
            v_names[i],
            v_city_id,
            v_addresses[i],
            '02' || (40 + (i % 50))::TEXT || LPAD((1000000 + i * 111111)::TEXT, 7, '0'),
            v_emails[i],
            '01234567' || LPAD(i::TEXT, 2, '0'),
            v_payment[i]
        );
    END LOOP;
    
    RAISE NOTICE '✅ Seeded % suppliers', v_count;
END $$;

-- =========================
-- CUSTOMERS (500 khách hàng)
-- [FIX] Phone unique: dùng i làm suffix tránh collision
-- [FIX] City lookup: dùng code thay vì hardcode id
-- [IMPROVE] Customer group weights: comment rõ mapping group_id
-- =========================
DO $$
DECLARE
    v_ho TEXT[] := ARRAY[
        'Nguyễn','Nguyễn','Nguyễn','Nguyễn',
        'Trần','Trần',
        'Lê','Lê',
        'Phạm',
        'Hoàng','Vũ','Đỗ','Bùi','Đinh','Đặng'
    ];
    v_dem_nam TEXT[] := ARRAY[
        'Văn','Đức','Minh','Hoàng','Quốc','Hữu','Xuân','Thanh','Công','Bá',
        'Anh','Trung','Đình','Quang','Ngọc','Tấn','Duy','Tiến','Hải','Thành'
    ];
    v_dem_nu TEXT[] := ARRAY[
        'Thị','Ngọc','Thanh','Phương','Thúy','Kim','Bích','Diễm','Hoài','Tuyết',
        'Ánh','Minh','Hồng','Thu','Mai','Khánh','Quỳnh','Hạnh','Mỹ','Như'
    ];
    v_ten TEXT[] := ARRAY[
        'An','Bình','Cường','Dung','Em','Phương','Giang','Hoa','Khoa','Kim',
        'Long','Mai','Nam','Oanh','Phú','Quỳnh','Sơn','Thúy','Uy','Vân',
        'Xuân','Yến','Anh','Bảo','Châu','Đăng','Hằng','Hiếu','Hùng','Hương',
        'Khánh','Lan','Linh','Lộc','Minh','Ngọc','Nhung','Phong','Quân','Sang',
        'Tâm','Thảo','Trí','Trọng','Tú','Tuấn','Uyên','Vinh','Vy','Hà'
    ];
    v_duong TEXT[] := ARRAY[
        'Láng Hạ','Giải Phóng','Trần Duy Hưng','Kim Mã','Nguyễn Trãi',
        'Lê Lợi','Nguyễn Huệ','Hai Bà Trưng','Pasteur','Võ Văn Tần',
        'Điện Biên Phủ','Cách Mạng Tháng 8','Nam Kỳ Khởi Nghĩa','Trần Phú','Lê Duẩn',
        'Thái Hà','Trường Chinh','Nguyễn Đình Chiểu','Lê Văn Sỹ','Bạch Đằng',
        'Hoàng Hoa Thám','Nguyễn Chí Thanh','Tây Sơn','Phạm Ngọc Thạch','Khâm Thiên',
        'Đội Cấn','Văn Cao','Liễu Giai','Tôn Đức Thắng','Nguyễn Lương Bằng',
        'Lạc Long Quân','Hào Nam','Chùa Bộc','Vĩnh Hồ','Trần Khát Chân',
        'Nguyễn Kiệm','Hoàng Văn Thụ','Cộng Hòa','Bùi Viện','Nguyễn Thái Bình'
    ];

    -- [FIX] Dùng city code để lookup, không hardcode id
    v_city_codes TEXT[] := ARRAY[
        'HN','HN','HN','HN','HN',          -- Hà Nội: 5 slots
        'HCM','HCM','HCM','HCM','HCM','HCM', -- HCM: 6 slots
        'DN','DN',                          -- Đà Nẵng: 2 slots
        'HP',                               -- Hải Phòng: 1 slot
        'CT',                               -- Cần Thơ: 1 slot
        'HUE',                              -- Huế: 1 slot
        'BD',                               -- Bình Dương: 1 slot
        'VT',                               -- Vũng Tàu: 1 slot
        'BN'                                -- Bắc Ninh: 1 slot
    ];
    v_quan_ten TEXT[] := ARRAY[
        'Ba Đình, HN','Đống Đa, HN','Hoàng Mai, HN','Cầu Giấy, HN','Hai Bà Trưng, HN',
        'Quận 1, HCM','Quận 3, HCM','Quận 7, HCM','Bình Thạnh, HCM','Tân Bình, HCM','Phú Nhuận, HCM',
        'Hải Châu, DN','Thanh Khê, DN',
        'Ngô Quyền, HP',
        'Ninh Kiều, CT',
        'TP Huế',
        'Thủ Dầu Một, BD',
        'TP Vũng Tàu',
        'TP Bắc Ninh'
    ];

    -- [IMPROVE] Rõ ràng về mapping:
    -- group_id: 1=VIP, 2=GOLD, 3=BRONZE, 4=SILVER, 5=NORMAL
    -- Phân phối mục tiêu: VIP≈5%, GOLD≈8%, SILVER≈12%, BRONZE≈15%, NORMAL≈60%
    -- Mảng 20 phần tử: 1×VIP, 2×GOLD, 2×SILVER, 3×BRONZE, 12×NORMAL
    v_group_ids INT[] := ARRAY[
        1,              -- VIP      ×1 = 5%
        2, 2,           -- GOLD     ×2 = 10%
        4, 4,           -- SILVER   ×2 = 10%
        3, 3, 3,        -- BRONZE   ×3 = 15%
        5,5,5,5,5,5,5,5,5,5,5,5  -- NORMAL  ×12 = 60%
    ];

    v_count    INT := 500;
    v_gender   TEXT;
    v_ho_i     TEXT;
    v_dem_i    TEXT;
    v_ten_i    TEXT;
    v_full_name TEXT;
    v_phone    TEXT;
    v_email    TEXT;
    v_group_id INT;
    v_loc_idx  INT;
    v_city_id  INT;
    v_address  TEXT;
    v_dob      DATE;
    i          INT;
BEGIN
    PERFORM SETSEED(0.314159);
    
    FOR i IN 1..v_count LOOP
        v_gender    := CASE WHEN RANDOM() < 0.52 THEN 'female' ELSE 'male' END;
        v_ho_i      := v_ho[1 + FLOOR(RANDOM() * array_length(v_ho, 1))::int];
        v_dem_i     := CASE WHEN v_gender = 'male'
                            THEN v_dem_nam[1 + FLOOR(RANDOM() * array_length(v_dem_nam, 1))::int]
                            ELSE v_dem_nu [1 + FLOOR(RANDOM() * array_length(v_dem_nu,  1))::int]
                       END;
        v_ten_i     := v_ten[1 + FLOOR(RANDOM() * array_length(v_ten, 1))::int];
        v_full_name := v_ho_i || ' ' || v_dem_i || ' ' || v_ten_i;

        -- [FIX] Phone: dùng i làm suffix 7 chữ số cuối → đảm bảo unique
        v_phone := CASE WHEN RANDOM() < 0.5 THEN '09' ELSE '03' END
                   || LPAD((FLOOR(RANDOM() * 9) + 1)::TEXT, 1, '0')
                   || LPAD(i::TEXT, 7, '0');

        v_email := LOWER(
            TRANSLATE(
                LEFT(v_ho_i, 1) || LEFT(v_dem_i, 1) || v_ten_i,
                'ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮĐàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữđ',
                'AAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUDaaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuud'
            )
        ) || i || '@email.com';

        -- [IMPROVE] Dùng v_group_ids trực tiếp (đã là group_id thực)
        v_group_id := v_group_ids[1 + FLOOR(RANDOM() * array_length(v_group_ids, 1))::int];

        -- [FIX] Lookup city_id bằng code
        v_loc_idx := 1 + FLOOR(RANDOM() * array_length(v_city_codes, 1))::int;
        SELECT id INTO v_city_id FROM subdim_cities WHERE code = v_city_codes[v_loc_idx];

        v_address := (1 + FLOOR(RANDOM() * 200))::TEXT || ' '
                     || v_duong[1 + FLOOR(RANDOM() * array_length(v_duong, 1))::int] || ', '
                     || v_quan_ten[v_loc_idx];

        v_dob := '1970-01-01'::date + (FLOOR(RANDOM() * 12775))::int;

        INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender)
        VALUES (
            'KH-202601-' || LPAD(i::TEXT, 5, '0'),
            v_full_name, v_phone, v_email, v_group_id, v_city_id, v_address, v_dob, v_gender
        )
        ON CONFLICT (phone) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE '✅ Seeded % customers', v_count;
END $$;

-- =========================
-- PRODUCTS (49 sản phẩm)
-- =========================
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, has_variants, image_url) VALUES
    ('MIG001', 'Mì Hảo Hảo tôm chua cay',         11,  1,  1, 'Mì ăn liền vị tôm chua cay phổ biến',     FALSE, '/uploads/products/product-1.jpg'),
    ('MIG002', 'Mì Hảo Hảo sườn heo',              11,  1,  1, 'Mì ăn liền vị sườn heo thơm ngon',        FALSE, '/uploads/products/product-2.jpg'),
    ('MIG003', 'Mì Omachi xào bò',                  11,  2,  1, 'Mì xào cao cấp vị bò',                    FALSE, '/uploads/products/product-3.jpg'),
    ('MIG004', 'Mì Kokomi tôm',                     11,  1,  1, 'Mì tôm ngon cho bữa sáng',                FALSE, '/uploads/products/product-4.jpg'),
    ('MIG005', 'Mì Asia gà',                        11,  3,  1, 'Mì vị gà giá rẻ',                         FALSE, '/uploads/products/product-5.jpg'),
    ('NGK001', 'Coca-Cola lon 330ml',               12,  4,  5, 'Nước giải khát có ga Coca-Cola',           FALSE, '/uploads/products/product-6.jpg'),
    ('NGK002', 'Coca-Cola chai 1.5L',               12,  4,  4, 'Nước giải khát có ga Coca-Cola chai lớn', FALSE, '/uploads/products/product-7.jpg'),
    ('NGK003', 'Pepsi lon 330ml',                   12,  5,  5, 'Nước giải khát có ga Pepsi',               FALSE, '/uploads/products/product-8.jpg'),
    ('NGK004', 'Pepsi chai 1.5L',                   12,  5,  4, 'Nước giải khát có ga Pepsi chai lớn',     FALSE, '/uploads/products/product-9.jpg'),
    ('NGK005', 'Sting vàng 330ml',                  12,  6,  5, 'Nước tăng lực Sting vàng',                FALSE, '/uploads/products/product-10.jpg'),
    ('NGK006', 'Sting đỏ 330ml',                    12,  6,  5, 'Nước tăng lực Sting đỏ',                  FALSE, '/uploads/products/product-11.jpg'),
    ('NGK007', 'Red Bull 250ml',                    12,  7,  5, 'Nước tăng lực Red Bull chính hãng',       FALSE, '/uploads/products/product-12.jpg'),
    ('NEP001', 'Nước cam ép NutiFood 1L',           13,  8,  2, 'Nước cam ép 100% tự nhiên',               FALSE, '/uploads/products/product-13.jpg'),
    ('NEP002', 'Nước dứa ép NutiFood 1L',           13,  8,  2, 'Nước dứa ép 100% tự nhiên',               FALSE, '/uploads/products/product-14.jpg'),
    ('NEP003', 'Nước táo ép NutiFood 1L',           13,  8,  2, 'Nước táo ép 100% tự nhiên',               FALSE, '/uploads/products/product-15.jpg'),
    ('SUA001', 'Sữa tươi Vinamilk hộp 1L',         14,  9,  2, 'Sữa tươi tiệt trùng không đường',         FALSE, '/uploads/products/product-16.jpg'),
    ('SUA002', 'Sữa tươi TH True Milk 1L',         14, 10,  2, 'Sữa tươi organic cao cấp',                FALSE, '/uploads/products/product-17.jpg'),
    ('SUA003', 'Sữa tươi Dutch Lady 1L',            14, 11,  2, 'Sữa tươi nhập khẩu cao cấp',              FALSE, '/uploads/products/product-18.jpg'),
    ('SUA004', 'Sữa chua uống Vinamilk 180ml',      15,  9,  2, 'Sữa chua uống có đường',                  FALSE, '/uploads/products/product-19.jpg'),
    ('SUA005', 'Sữa chua ăn Vinamilk 100g',         15,  9,  1, 'Sữa chua ăn vị dâu',                      FALSE, '/uploads/products/product-20.jpg'),
    ('SUA006', 'Sữa bột Vinamilk 400g',             24,  9,  2, 'Sữa bột cho người lớn',                   FALSE, '/uploads/products/product-21.jpg'),
    ('SUA007', 'Sữa bột Dutch Lady 900g',           24, 11,  2, 'Sữa bột cho trẻ em cao cấp',              FALSE, '/uploads/products/product-22.jpg'),
    ('BK001',  'Snack Oishi 40g',                   16, 12,  1, 'Snack khoai tây Oishi nhiều vị',           FALSE, '/uploads/products/product-23.jpg'),
    ('BK002',  'Snack Lay''s 50g',                  16, 13,  1, 'Snack khoai tây Lay''s cao cấp',           FALSE, '/uploads/products/product-24.jpg'),
    ('BK003',  'Bánh quy Oreo 137g',                16, 12,  1, 'Bánh quy kẹp kem Oreo',                   FALSE, '/uploads/products/product-25.jpg'),
    ('BK004',  'Kẹo Alpenliebe 120g',               17, 12,  1, 'Kẹo mềm nhiều vị',                        FALSE, '/uploads/products/product-26.jpg'),
    ('BK005',  'Kẹo Mentos 37g',                    17, 12,  1, 'Kẹo bạc hà Mentos',                       FALSE, '/uploads/products/product-27.jpg'),
    ('GV001',  'Nước mắm Nam Ngư 500ml',            18, 15,  4, 'Nước mắm truyền thống Phan Thiết',        FALSE, '/uploads/products/product-28.jpg'),
    ('GV002',  'Nước tương Chin-su 500ml',          18, 15,  4, 'Nước tương đậm đặc',                      FALSE, '/uploads/products/product-29.jpg'),
    ('GV003',  'Tương ớt Chin-su 250g',             18, 15,  2, 'Tương ớt cay đặc biệt',                   FALSE, '/uploads/products/product-30.jpg'),
    ('GV004',  'Dầu ăn Simply 1L',                  19, 15,  4, 'Dầu ăn cao cấp từ đậu nành',              FALSE, '/uploads/products/product-31.jpg'),
    ('GV005',  'Hạt nêm Knorr 400g',                19, 16,  2, 'Hạt nêm từ thịt heo, xương',              FALSE, '/uploads/products/product-32.jpg'),
    ('GV006',  'Bột ngọt Ajinomoto 400g',           19, 16,  2, 'Bột ngọt chất lượng cao',                 FALSE, '/uploads/products/product-33.jpg'),
    ('GV007',  'Muối I-ốt 500g',                    19, 15,  1, 'Muối I-ốt tinh khiết',                    FALSE, '/uploads/products/product-34.jpg'),
    ('GV008',  'Đường trắng 1kg',                   19, 15,  1, 'Đường kính tinh luyện',                   FALSE, '/uploads/products/product-35.jpg'),
    ('GD001',  'Nước giặt OMO 3.8kg',               20, 17,  4, 'Nước giặt OMO đậm đặc',                   FALSE, '/uploads/products/product-36.jpg'),
    ('GD002',  'Nước giặt Ariel 3.6kg',             20, 18,  4, 'Nước giặt Ariel giặt sạch vượt trội',    FALSE, '/uploads/products/product-37.jpg'),
    ('GD003',  'Nước rửa chén Sunlight 750g',       20, 17,  4, 'Nước rửa chén chanh',                     FALSE, '/uploads/products/product-38.jpg'),
    ('GD004',  'Nước lau sàn Vim 1L',               20, 17,  4, 'Nước lau sàn kháng khuẩn',               FALSE, '/uploads/products/product-39.jpg'),
    ('GD005',  'Xà phòng Lifebuoy 90g',             21, 17, 10, 'Xà phòng diệt khuẩn',                    FALSE, '/uploads/products/product-40.jpg'),
    ('CN001',  'Dầu gội Clear 630ml',               22, 20,  4, 'Dầu gội sạch gàu nam',                    FALSE, '/uploads/products/product-41.jpg'),
    ('CN002',  'Dầu gội Sunsilk 330ml',             22, 21,  4, 'Dầu gội mềm mượt tóc nữ',                FALSE, '/uploads/products/product-42.jpg'),
    ('CN003',  'Sữa tắm Dove 530g',                 21, 19,  4, 'Sữa tắm dưỡng ẩm',                        FALSE, '/uploads/products/product-43.jpg'),
    ('CN004',  'Kem đánh răng PS 230g',             21, 17, 10, 'Kem đánh răng bảo vệ nướu',              FALSE, '/uploads/products/product-44.jpg'),
    ('CN005',  'Bàn chải đánh răng PS',             21, 17, 10, 'Bàn chải lông mềm',                       FALSE, '/uploads/products/product-45.jpg'),
    ('CN006',  'Khăn giấy Tempo hộp 100 tờ',       21, 12,  2, 'Khăn giấy mềm mịn',                       FALSE, '/uploads/products/product-46.jpg'),
    ('CF001',  'Cà phê G7 3in1 hộp 16 gói',         2, 24,  2, 'Cà phê hòa tan 3in1 Trung Nguyên',        FALSE, '/uploads/products/product-47.jpg'),
    ('CF002',  'Cà phê Highlands hộp 14 gói',        2, 24,  2, 'Cà phê hòa tan cao cấp',                  FALSE, '/uploads/products/product-48.jpg'),
    ('CF003',  'Cà phê Nescafe 3in1 hộp 20 gói',    2, 24,  2, 'Cà phê hòa tan Nestle',                   FALSE, '/uploads/products/product-49.jpg');

-- =========================
-- PRODUCT VARIANTS (49 variants)
-- =========================
INSERT INTO dim_product_variants (product_id, sku, barcode, variant_name, cost_price, selling_price) VALUES
    (1,  'MIG001-SKU', '8934567890001', 'Mì Hảo Hảo tôm chua cay - Gói',    2500,   4000),
    (2,  'MIG002-SKU', '8934567890002', 'Mì Hảo Hảo sườn heo - Gói',        2500,   4000),
    (3,  'MIG003-SKU', '8934567890003', 'Mì Omachi xào bò - Gói',            4500,   7000),
    (4,  'MIG004-SKU', '8934567890004', 'Mì Kokomi tôm - Gói',               3500,   5500),
    (5,  'MIG005-SKU', '8934567890005', 'Mì Asia gà - Gói',                  4000,   6500),
    (6,  'NGK001-SKU', '8934567890006', 'Coca-Cola lon 330ml',                6500,  11000),
    (7,  'NGK002-SKU', '8934567890007', 'Coca-Cola chai 1.5L',               16000,  25000),
    (8,  'NGK003-SKU', '8934567890008', 'Pepsi lon 330ml',                    6000,  10000),
    (9,  'NGK004-SKU', '8934567890009', 'Pepsi chai 1.5L',                   15000,  23000),
    (10, 'NGK005-SKU', '8934567890010', 'Sting vàng 330ml',                   6500,  11000),
    (11, 'NGK006-SKU', '8934567890011', 'Sting đỏ 330ml',                     6500,  11000),
    (12, 'NGK007-SKU', '8934567890012', 'Red Bull 250ml',                     6000,  10000),
    (13, 'NEP001-SKU', '8934567890013', 'Nước cam ép NutiFood 1L',           28000,  42000),
    (14, 'NEP002-SKU', '8934567890014', 'Nước dứa ép NutiFood 1L',           28000,  42000),
    (15, 'NEP003-SKU', '8934567890015', 'Nước táo ép NutiFood 1L',           22000,  35000),
    (16, 'SUA001-SKU', '8934567890016', 'Sữa tươi Vinamilk 1L',              25000,  38000),
    (17, 'SUA002-SKU', '8934567890017', 'Sữa tươi TH True Milk 1L',          25000,  38000),
    (18, 'SUA003-SKU', '8934567890018', 'Sữa tươi Dutch Lady 1L',            30000,  45000),
    (19, 'SUA004-SKU', '8934567890019', 'Sữa chua uống Vinamilk 180ml',      5500,   8500),
    (20, 'SUA005-SKU', '8934567890020', 'Sữa chua ăn Vinamilk 100g',         6000,   9500),
    (21, 'SUA006-SKU', '8934567890021', 'Sữa bột Vinamilk 400g',             22000,  32000),
    (22, 'SUA007-SKU', '8934567890022', 'Sữa bột Dutch Lady 900g',           28000,  42000),
    (23, 'BK001-SKU',  '8934567890023', 'Snack Oishi 40g',                   22000,  35000),
    (24, 'BK002-SKU',  '8934567890024', 'Snack Lay''s 50g',                  35000,  55000),
    (25, 'BK003-SKU',  '8934567890025', 'Bánh quy Oreo 137g',                18000,  28000),
    (26, 'BK004-SKU',  '8934567890026', 'Kẹo Alpenliebe 120g',               15000,  25000),
    (27, 'BK005-SKU',  '8934567890027', 'Kẹo Mentos 37g',                    18000,  28000),
    (28, 'GV001-SKU',  '8934567890028', 'Nước mắm Nam Ngư 500ml',            25000,  38000),
    (29, 'GV002-SKU',  '8934567890029', 'Nước tương Chin-su 500ml',          22000,  35000),
    (30, 'GV003-SKU',  '8934567890030', 'Tương ớt Chin-su 250g',             32000,  48000),
    (31, 'GV004-SKU',  '8934567890031', 'Dầu ăn Simply 1L',                  55000,  85000),
    (32, 'GV005-SKU',  '8934567890032', 'Hạt nêm Knorr 400g',                35000,  52000),
    (33, 'GV006-SKU',  '8934567890033', 'Bột ngọt Ajinomoto 400g',           38000,  56000),
    (34, 'GV007-SKU',  '8934567890034', 'Muối I-ốt 500g',                    12000,  18000),
    (35, 'GV008-SKU',  '8934567890035', 'Đường trắng 1kg',                   15000,  22000),
    (36, 'GD001-SKU',  '8934567890036', 'Nước giặt OMO 3.8kg',               95000, 145000),
    (37, 'GD002-SKU',  '8934567890037', 'Nước giặt Ariel 3.6kg',             85000, 130000),
    (38, 'GD003-SKU',  '8934567890038', 'Nước rửa chén Sunlight 750g',       25000,  38000),
    (39, 'GD004-SKU',  '8934567890039', 'Nước lau sàn Vim 1L',               45000,  68000),
    (40, 'GD005-SKU',  '8934567890040', 'Xà phòng Lifebuoy 90g',             25000,  38000),
    (41, 'CN001-SKU',  '8934567890041', 'Dầu gội Clear 630ml',               35000,  55000),
    (42, 'CN002-SKU',  '8934567890042', 'Dầu gội Sunsilk 330ml',             15000,  25000),
    (43, 'CN003-SKU',  '8934567890043', 'Sữa tắm Dove 530g',                 85000, 130000),
    (44, 'CN004-SKU',  '8934567890044', 'Kem đánh răng PS 230g',             55000,  85000),
    (45, 'CN005-SKU',  '8934567890045', 'Bàn chải đánh răng PS',             75000, 115000),
    (46, 'CN006-SKU',  '8934567890046', 'Khăn giấy Tempo 100 tờ',            28000,  42000),
    (47, 'CF001-SKU',  '8934567890047', 'Cà phê G7 3in1 hộp 16 gói',        45000,  68000),
    (48, 'CF002-SKU',  '8934567890048', 'Cà phê Highlands hộp 14 gói',       55000,  85000),
    (49, 'CF003-SKU',  '8934567890049', 'Cà phê Nescafe 3in1 hộp 20 gói',   52000,  80000);

-- =========================
-- USERS (6 người dùng) - Password: "1"
-- Hash bcrypt: $2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK
-- =========================
INSERT INTO dim_users (username, email, password_hash, full_name, role_id, store_id, phone) VALUES
    ('admin',      'admin@minimart.com',       '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Admin Hệ Thống',    1, 1, '0900000001'),
    ('staff_hn1',  'staff.hn1@minimart.com',   '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Nguyễn Văn Minh',  2, 1, '0900000002'),
    ('staff_hn2',  'staff.hn2@minimart.com',   '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Trần Thị Hoa',     2, 2, '0900000003'),
    ('staff_hcm1', 'staff.hcm1@minimart.com',  '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Lê Văn Nam',       2, 3, '0900000004'),
    ('staff_hcm2', 'staff.hcm2@minimart.com',  '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Phạm Văn Đức',    2, 4, '0900000005'),
    ('staff_wh',   'staff.wh@minimart.com',    '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Võ Hoàng Anh',     2, 5, '0900000006');

-- =========================
-- CARRIERS (6 carriers)
-- =========================
INSERT INTO dim_carriers (code, name, phone, tracking_url_template) VALUES
    ('INTERNAL', 'Giao hàng nội bộ', NULL,         NULL),
    ('GHN',      'Giao Hàng Nhanh',  '1900636336', 'https://donhang.ghn.vn/?order_code={tracking_code}'),
    ('GHTK',     'Giao Hàng Tiết Kiệm','1900636886','https://i.ghtk.vn/{tracking_code}'),
    ('VNP',      'Viettel Post',     '1900866868', 'https://viettelpost.com.vn/tra-cuu-hang-gui?tracking_code={tracking_code}'),
    ('JT',       'J&T Express',      '1900158815', 'https://jtexpress.vn/track?bills={tracking_code}'),
    ('BEST',     'Best Express',     '1900063630', 'https://bestexpress.vn/tracking/{tracking_code}');

-- =========================
-- BANK ACCOUNTS (3 accounts)
-- =========================
INSERT INTO dim_bank_accounts (account_name, account_number, bank_name, bank_code, branch, store_id, is_default, is_active, created_by)
VALUES 
    ('Siêu Thị Mini HCM', '1234567890', 'Vietcombank', 'VCB', 'Chi nhánh Quận 1',   3, TRUE, TRUE, 1),
    ('Siêu Thị Mini HN',  '0987654321', 'Techcombank', 'TCB', 'Chi nhánh Hoàng Mai', 1, TRUE, TRUE, 1),
    ('Kho Tổng',           '5678901234', 'ACB',         'ACB', 'Chi nhánh Tân Bình',  5, TRUE, TRUE, 1);

-- =========================
-- DIM_TIME (2025-2027)
-- =========================
INSERT INTO dim_time (date_key, day_of_week, day_name, week_of_year, month, month_name, quarter, year, is_weekend)
SELECT 
    d::date                             AS date_key,
    EXTRACT(DOW  FROM d)                AS day_of_week,
    TO_CHAR(d, 'Day')                   AS day_name,
    EXTRACT(WEEK FROM d)                AS week_of_year,
    EXTRACT(MONTH FROM d)               AS month,
    TO_CHAR(d, 'Month')                 AS month_name,
    EXTRACT(QUARTER FROM d)             AS quarter,
    EXTRACT(YEAR FROM d)                AS year,
    EXTRACT(DOW FROM d) IN (0, 6)       AS is_weekend
FROM generate_series('2025-01-01'::date, '2027-12-31'::date, '1 day'::interval) d;

-- Update Vietnam public holidays
UPDATE dim_time SET is_holiday = TRUE, holiday_name = 'Tết Dương lịch'
WHERE EXTRACT(MONTH FROM date_key) = 1 AND EXTRACT(DAY FROM date_key) = 1;

UPDATE dim_time SET is_holiday = TRUE, holiday_name = 'Giải phóng miền Nam'
WHERE EXTRACT(MONTH FROM date_key) = 4 AND EXTRACT(DAY FROM date_key) = 30;

UPDATE dim_time SET is_holiday = TRUE, holiday_name = 'Quốc tế lao động'
WHERE EXTRACT(MONTH FROM date_key) = 5 AND EXTRACT(DAY FROM date_key) = 1;

UPDATE dim_time SET is_holiday = TRUE, holiday_name = 'Quốc khánh'
WHERE EXTRACT(MONTH FROM date_key) = 9 AND EXTRACT(DAY FROM date_key) = 2;

-- =========================
-- DISCOUNTS (3 sample discounts)
-- =========================
INSERT INTO dim_discounts (code, name, description, discount_type_id, discount_value, max_discount_amount, min_order_amount, max_uses_total, start_date, end_date, created_by) VALUES
    ('SALE10',   'Giảm 10%',       'Giảm 10% cho đơn từ 200K', 1, 10,    50000, 200000, 1000, '2026-01-01', '2026-12-31', 1),
    ('WELCOME50','Chào mừng 50K',  'Giảm 50K cho khách mới',   2, 50000, NULL,  100000,  500, '2026-01-01', '2026-06-30', 1),
    ('FREESHIP', 'Miễn phí ship',  'Miễn phí ship đơn từ 300K',4, 30000, NULL,  300000, NULL, '2026-01-01', '2026-12-31', 1);

-- =========================
-- INVENTORY STOCKS (5 stores x all variants)
-- =========================
SELECT SETSEED(0.42);

INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 1, id, FLOOR(RANDOM() * 200  + 50 )::int, 20,  300  FROM dim_product_variants;

INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 2, id, FLOOR(RANDOM() * 150  + 30 )::int, 15,  200  FROM dim_product_variants;

INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 3, id, FLOOR(RANDOM() * 250  + 80 )::int, 25,  400  FROM dim_product_variants;

INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 4, id, FLOOR(RANDOM() * 100  + 20 )::int, 10,  150  FROM dim_product_variants;

INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 5, id, FLOOR(RANDOM() * 1000 + 500)::int, 100, 2000 FROM dim_product_variants;

-- =========================
-- SAMPLE CASHBOOK TRANSACTION
-- [FIX] Dùng DO block + biến để tránh NULL từ subquery lỗi
-- =========================
DO $$
DECLARE
    v_cashbook_type_id  INT;
    v_payment_method_id INT;
    v_store_exists      BOOLEAN;
    v_user_exists       BOOLEAN;
    v_date_exists       BOOLEAN;
BEGIN
    SELECT id INTO v_cashbook_type_id  FROM subdim_cashbook_types  WHERE code = 'SALES_INCOME';
    SELECT id INTO v_payment_method_id FROM subdim_payment_methods WHERE code = 'CASH';
    SELECT EXISTS(SELECT 1 FROM dim_time   WHERE date_key = CURRENT_DATE) INTO v_date_exists;
    SELECT EXISTS(SELECT 1 FROM dim_stores WHERE id = 1)                  INTO v_store_exists;
    SELECT EXISTS(SELECT 1 FROM dim_users  WHERE id = 1)                  INTO v_user_exists;

    IF v_cashbook_type_id IS NULL THEN
        RAISE WARNING '⚠️ cashbook_type SALES_INCOME not found, skipping sample cashbook';
        RETURN;
    END IF;
    IF v_payment_method_id IS NULL THEN
        RAISE WARNING '⚠️ payment_method CASH not found, skipping sample cashbook';
        RETURN;
    END IF;
    IF NOT (v_date_exists AND v_store_exists AND v_user_exists) THEN
        RAISE WARNING '⚠️ Missing date/store/user reference, skipping sample cashbook';
        RETURN;
    END IF;

    INSERT INTO fact_cashbook_transactions (
        transaction_code, date_key, store_id, cashbook_type_id, payment_method_id,
        amount, reference_type, description, created_by, status
    ) VALUES (
        'PT-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-00001',
        CURRENT_DATE,
        1,
        v_cashbook_type_id,
        v_payment_method_id,
        1500000,
        'ORDER',
        'Thu tiền bán hàng ngày',
        1,
        'approved'
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Sample cashbook transaction inserted';
END $$;

-- =========================
-- COMPLETION MESSAGE
-- [FIX] Cities count: 10 → 63
-- =========================
DO $$ 
DECLARE
    v_customers INT;
    v_suppliers INT;
    v_variants  INT;
    v_stocks    INT;
    v_cities    INT;
BEGIN
    SELECT COUNT(*) INTO v_customers FROM dim_customers;
    SELECT COUNT(*) INTO v_suppliers FROM dim_suppliers;
    SELECT COUNT(*) INTO v_variants  FROM dim_product_variants;
    SELECT COUNT(*) INTO v_stocks    FROM fact_inventory_stocks;
    SELECT COUNT(*) INTO v_cities    FROM subdim_cities;
    
    RAISE NOTICE '✅ Seed data completed successfully!';
    RAISE NOTICE '   📍 Regions: 3';
    RAISE NOTICE '   🏙️  Cities: % ', v_cities;   -- [FIX] dynamic count thay vì hardcode
    RAISE NOTICE '   📂 Categories: 24 (hierarchical)';
    RAISE NOTICE '   🏷️  Brands: 24';
    RAISE NOTICE '   🏪 Stores: 5 (4 retail + 1 warehouse)';
    RAISE NOTICE '   🏭 Suppliers: % (NCC-YYYYMM-XXXXX)', v_suppliers;
    RAISE NOTICE '   👥 Customers: % (KH-YYYYMM-XXXXX)', v_customers;
    RAISE NOTICE '   📦 Products: 49';
    RAISE NOTICE '   🔖 Product Variants: %', v_variants;
    RAISE NOTICE '   👤 Users: 6 (Password: "1")';
    RAISE NOTICE '   🚚 Carriers: 6';
    RAISE NOTICE '   🏦 Bank Accounts: 3';
    RAISE NOTICE '   🎁 Discounts: 3';
    RAISE NOTICE '   📊 Inventory Stocks: % (5 stores x % variants)', v_stocks, v_variants;
    RAISE NOTICE '   📅 Time dimension: 2025-2027 (1096 days)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Orders NOT seeded — use incremental_data_generator.sql:';
    RAISE NOTICE '   SELECT generate_daily_data(''2026-01-15'');';
    RAISE NOTICE '   SELECT backfill_daily_data(''2026-01-01'', ''2026-01-31'');';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Login credentials:';
    RAISE NOTICE '   Username: admin      | Password: 1';
    RAISE NOTICE '   Username: staff_hn1  | Password: 1';
    RAISE NOTICE '   Username: staff_hcm1 | Password: 1';
END $$;