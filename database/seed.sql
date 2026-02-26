-- =====================================================
-- SUPERMARKET MANAGEMENT SYSTEM - SEED DATA
-- Version: 4.0 | Date: 25/02/2026
-- Có thể chạy lại nhiều lần (idempotent)
-- Orders được sinh bằng incremental_data_generator.sql
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
-- LEVEL 2: CITIES
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
    ('VIP', 'Khách hàng VIP', 10.00, 30000000),
    ('GOLD', 'Khách hàng Vàng', 7.00, 10000000),
    ('BRONZE', 'Khách hàng Đồng', 5.00, 5000000),
    ('SILVER', 'Khách hàng Bạc', 3.00, 2000000),
    ('NORMAL', 'Khách hàng thường', 0.00, 0);

-- =========================
-- STORE TYPES
-- =========================
INSERT INTO subdim_store_types (code, name) VALUES
    ('SUPER', 'Siêu thị'),
    ('MINI', 'Cửa hàng tiện lợi'),
    ('WAREHOUSE', 'Kho tổng'),
    ('ONLINE', 'Cửa hàng online');

-- =========================
-- TRANSACTION TYPES
-- =========================
INSERT INTO subdim_transaction_types (code, name, affects_stock) VALUES
    ('IMPORT', 'Nhập hàng', 1),
    ('EXPORT', 'Xuất hàng', -1),
    ('RETURN', 'Trả hàng nhập', -1),
    ('ADJUSTMENT', 'Điều chỉnh', 0),
    ('TRANSFER_OUT', 'Chuyển kho đi', -1),
    ('TRANSFER_IN', 'Chuyển kho đến', 1),
    ('DAMAGE', 'Hàng hỏng', -1),
    ('EXPIRED', 'Hàng hết hạn', -1);

-- =========================
-- ROLES
-- =========================
INSERT INTO subdim_roles (code, name, description) VALUES
    ('ADMIN', 'Administrator', 'Quản trị viên hệ thống - Full quyền'),
    ('STAFF', 'Sales Staff', 'Nhân viên bán hàng - Bán hàng, thu ngân, xem kho');

-- =========================
-- PERMISSIONS
-- =========================
INSERT INTO subdim_permissions (code, name, resource, action) VALUES
    ('PRODUCT_VIEW', 'Xem sản phẩm', 'product', 'view'),
    ('PRODUCT_CREATE', 'Tạo sản phẩm', 'product', 'create'),
    ('PRODUCT_EDIT', 'Sửa sản phẩm', 'product', 'edit'),
    ('PRODUCT_DELETE', 'Xóa sản phẩm', 'product', 'delete'),
    ('ORDER_VIEW', 'Xem đơn hàng', 'order', 'view'),
    ('ORDER_CREATE', 'Tạo đơn hàng', 'order', 'create'),
    ('ORDER_EDIT', 'Sửa đơn hàng', 'order', 'edit'),
    ('ORDER_DELETE', 'Hủy đơn hàng', 'order', 'delete'),
    ('CUSTOMER_VIEW', 'Xem khách hàng', 'customer', 'view'),
    ('CUSTOMER_CREATE', 'Tạo khách hàng', 'customer', 'create'),
    ('CUSTOMER_EDIT', 'Sửa khách hàng', 'customer', 'edit'),
    ('INVENTORY_VIEW', 'Xem kho', 'inventory', 'view'),
    ('INVENTORY_IMPORT', 'Nhập kho', 'inventory', 'import'),
    ('INVENTORY_EXPORT', 'Xuất kho', 'inventory', 'export'),
    ('REPORT_VIEW', 'Xem báo cáo', 'report', 'view'),
    ('USER_MANAGE', 'Quản lý người dùng', 'user', 'manage'),
    ('SYSTEM_CONFIG', 'Cấu hình hệ thống', 'system', 'config');

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
    ('PERCENTAGE', 'Giảm theo %', 'Giảm giá theo phần trăm tổng đơn hàng'),
    ('FIXED_AMOUNT', 'Giảm cố định', 'Giảm một số tiền cố định'),
    ('BUY_X_GET_Y', 'Mua X tặng Y', 'Mua số lượng X được tặng Y'),
    ('FREE_SHIPPING', 'Miễn phí ship', 'Miễn phí vận chuyển');

-- =========================
-- CASHBOOK TYPES
-- =========================
INSERT INTO subdim_cashbook_types (code, name, transaction_direction, description) VALUES
    ('SALES_INCOME', 'Thu từ bán hàng', 1, 'Tiền thu từ các đơn hàng'),
    ('OTHER_INCOME', 'Thu khác', 1, 'Các khoản thu khác'),
    ('PURCHASE_EXPENSE', 'Chi mua hàng', -1, 'Chi trả nhà cung cấp'),
    ('SALARY_EXPENSE', 'Chi lương', -1, 'Chi trả lương nhân viên'),
    ('RENT_EXPENSE', 'Chi thuê mặt bằng', -1, 'Chi phí thuê kho/cửa hàng'),
    ('UTILITY_EXPENSE', 'Chi điện nước', -1, 'Chi phí điện, nước, internet'),
    ('OTHER_EXPENSE', 'Chi khác', -1, 'Các khoản chi khác'),
    ('REFUND', 'Hoàn tiền', -1, 'Hoàn tiền cho khách hàng'),
    ('DEPOSIT', 'Nạp tiền', 1, 'Nạp tiền vào quỹ'),
    ('WITHDRAWAL', 'Rút tiền', -1, 'Rút tiền từ quỹ');

-- =========================
-- PAYMENT METHODS
-- =========================
INSERT INTO subdim_payment_methods (code, name) VALUES
    ('CASH', 'Tiền mặt'),
    ('BANK_TRANSFER', 'Chuyển khoản ngân hàng'),
    ('CARD', 'Thẻ tín dụng/ghi nợ'),
    ('MOMO', 'Ví MoMo'),
    ('ZALOPAY', 'ZaloPay'),
    ('VNPAY', 'VNPay'),
    ('OTHER', 'Khác');

-- =========================
-- SHIPMENT STATUSES
-- =========================
INSERT INTO subdim_shipment_statuses (code, name, description, sort_order) VALUES
    ('pending', 'Chờ xử lý', 'Đơn hàng mới, chờ xác nhận', 1),
    ('confirmed', 'Đã xác nhận', 'Đã xác nhận, chuẩn bị hàng', 2),
    ('picking', 'Đang lấy hàng', 'Shipper đang lấy hàng từ kho', 3),
    ('picked', 'Đã lấy hàng', 'Shipper đã lấy hàng', 4),
    ('in_transit', 'Đang vận chuyển', 'Hàng đang trên đường giao', 5),
    ('out_for_delivery', 'Đang giao hàng', 'Shipper đang giao cho khách', 6),
    ('delivered', 'Đã giao hàng', 'Giao hàng thành công', 7),
    ('failed', 'Giao thất bại', 'Không giao được hàng', 8),
    ('returned', 'Đã hoàn hàng', 'Hàng đã hoàn về kho', 9),
    ('cancelled', 'Đã hủy', 'Đơn vận chuyển bị hủy', 10);

-- =========================
-- STORES (5 cửa hàng)
-- =========================
INSERT INTO dim_stores (code, name, store_type_id, city_id, address, phone, manager_name) VALUES
    ('HN001', 'MiniMart Hoàng Mai', 2, 1, '123 Đường Giải Phóng, Hoàng Mai, Hà Nội', '0241234567', 'Nguyễn Văn Minh'),
    ('HN002', 'MiniMart Cầu Giấy', 2, 1, '456 Đường Trần Duy Hưng, Cầu Giấy, Hà Nội', '0241234568', 'Trần Thị Hoa'),
    ('HCM001', 'SuperMart Quận 1', 1, 45, '789 Đường Nguyễn Huệ, Quận 1, TP.HCM', '0281234567', 'Lê Văn Nam'),
    ('HCM002', 'MiniMart Quận 7', 2, 45, '321 Đường Nguyễn Thị Thập, Quận 7, TP.HCM', '0281234568', 'Phạm Văn Đức'),
    ('WH001', 'Kho Tổng TP.HCM', 3, 45, 'Khu công nghiệp Tân Bình, TP.HCM', '0281234569', 'Võ Hoàng Anh');

-- =========================
-- SUPPLIERS (8 nhà cung cấp)
-- =========================
INSERT INTO dim_suppliers (code, name, city_id, address, phone, email, tax_code, payment_terms) VALUES
    ('SUP001', 'Công ty TNHH Acecook Việt Nam', 1, 'KCN Thăng Long, Hà Nội', '0243567890', 'info@acecook.com.vn', '0123456789', 'Thanh toán trong 30 ngày'),
    ('SUP002', 'Công ty CP Masan Consumer', 45, 'Tòa nhà Masan, Quận 1, TP.HCM', '0283456789', 'sales@masan.com', '0123456790', 'Thanh toán trong 45 ngày'),
    ('SUP003', 'Công ty CP Sữa Việt Nam - Vinamilk', 45, '10 Tân Trào, Quận 7, TP.HCM', '0283345678', 'sales@vinamilk.com.vn', '0123456791', 'Thanh toán trong 30 ngày'),
    ('SUP004', 'Công ty TNHH Nước giải khát Coca-Cola', 45, 'Khu chế xuất Tân Thuận, TP.HCM', '0283234567', 'vn@coca-cola.com', '0123456792', 'Thanh toán ngay'),
    ('SUP005', 'Công ty CP Suntory PepsiCo', 45, 'Bình Dương', '0273123456', 'sales@pepsico.vn', '0123456793', 'Thanh toán trong 30 ngày'),
    ('SUP006', 'Công ty CP Kido', 45, 'Lô II-7, KCN Tân Bình, TP.HCM', '0283456123', 'kido@kido.com.vn', '0123456794', 'Thanh toán trong 60 ngày'),
    ('SUP007', 'Công ty TNHH Unilever Việt Nam', 45, '4 Phan Chu Trinh, Quận 1, TP.HCM', '0283567890', 'contact.vn@unilever.com', '0123456795', 'Thanh toán trong 45 ngày'),
    ('SUP008', 'Công ty TNHH Nestlé Việt Nam', 1, 'Tòa nhà Peakview, Hà Nội', '0243678901', 'info@vn.nestle.com', '0123456796', 'Thanh toán trong 30 ngày');

-- =========================
-- CUSTOMERS (100 khách hàng)
-- =========================
INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender) VALUES
    ('KH001', 'Nguyễn Văn An', '0901234567', 'nva@email.com', 3, 1, '12 Láng Hạ, Ba Đình, HN', '1985-03-15', 'male'),
    ('KH002', 'Trần Thị Bình', '0901234568', 'ttb@email.com', 2, 1, '34 Giảng Võ, Đống Đa, HN', '1990-07-22', 'female'),
    ('KH003', 'Lê Văn Cường', '0901234569', 'lvc@email.com', 4, 45, '56 Lê Lợi, Quận 1, HCM', '1988-11-03', 'male'),
    ('KH004', 'Phạm Thị Dung', '0901234570', 'ptd@email.com', 1, 45, '78 Nguyễn Huệ, Quận 1, HCM', '1992-05-18', 'female'),
    ('KH005', 'Hoàng Văn Em', '0901234571', 'hve@email.com', 5, 1, '90 Trần Duy Hưng, Cầu Giấy, HN', '1995-09-25', 'male'),
    ('KH006', 'Vũ Thị Phương', '0901234572', 'vtp@email.com', 3, 45, '12 Hai Bà Trưng, Quận 3, HCM', '1987-02-14', 'female'),
    ('KH007', 'Đỗ Văn Giang', '0901234573', 'dvg@email.com', 2, 1, '34 Xã Đàn, Đống Đa, HN', '1991-06-30', 'male'),
    ('KH008', 'Bùi Thị Hoa', '0901234574', 'bth@email.com', 4, 45, '56 Lý Tự Trọng, Quận 1, HCM', '1989-12-08', 'female'),
    ('KH009', 'Đinh Văn Ích', '0901234575', 'dvi@email.com', 5, 32, '78 Trần Phú, Hải Châu, Đà Nẵng', '1993-04-17', 'male'),
    ('KH010', 'Ngô Thị Kim', '0901234576', 'ntk@email.com', 3, 1, '90 Kim Mã, Ba Đình, HN', '1986-08-21', 'female'),
    ('KH011', 'Cao Văn Long', '0901234577', 'cvl@email.com', 2, 45, '12 Pasteur, Quận 1, HCM', '1990-10-12', 'male'),
    ('KH012', 'Lý Thị Mai', '0901234578', 'ltm@email.com', 4, 1, '34 Nguyễn Chí Thanh, Đống Đa, HN', '1988-03-28', 'female'),
    ('KH013', 'Phan Văn Nam', '0901234579', 'pvn@email.com', 5, 45, '56 Điện Biên Phủ, Quận 3, HCM', '1994-07-05', 'male'),
    ('KH014', 'Tạ Thị Oanh', '0901234580', 'tto@email.com', 1, 1, '78 Láng, Đống Đa, HN', '1992-11-19', 'female'),
    ('KH015', 'Mai Văn Phú', '0901234581', 'mvp@email.com', 3, 45, '90 Võ Văn Tần, Quận 3, HCM', '1987-01-23', 'male'),
    ('KH016', 'Hồ Thị Quỳnh', '0901234582', 'htq@email.com', 2, 32, '12 Lê Duẩn, Hải Châu, Đà Nẵng', '1991-05-16', 'female'),
    ('KH017', 'Trương Văn Sơn', '0901234583', 'tvs@email.com', 4, 1, '34 Tây Sơn, Đống Đa, HN', '1989-09-30', 'male'),
    ('KH018', 'Dương Thị Thúy', '0901234584', 'dtt@email.com', 5, 45, '56 Cách Mạng Tháng 8, Quận 10, HCM', '1993-02-07', 'female'),
    ('KH019', 'Lương Văn Uy', '0901234585', 'lvu@email.com', 3, 1, '78 Ô Chợ Dừa, Đống Đa, HN', '1986-06-14', 'male'),
    ('KH020', 'Võ Thị Vân', '0901234586', 'vtv@email.com', 2, 45, '90 Nam Kỳ Khởi Nghĩa, Quận 1, HCM', '1990-10-27', 'female'),
    ('KH021', 'Đặng Văn Xuân', '0901234587', 'dvx@email.com', 4, 32, '12 Bạch Đằng, Hải Châu, Đà Nẵng', '1988-12-03', 'male'),
    ('KH022', 'Chu Thị Yến', '0901234588', 'cty@email.com', 5, 1, '34 Tôn Đức Thắng, Đống Đa, HN', '1994-04-11', 'female'),
    ('KH023', 'Huỳnh Văn Zung', '0901234589', 'hvz@email.com', 1, 45, '56 Nguyễn Thị Minh Khai, Quận 3, HCM', '1992-08-19', 'male'),
    ('KH024', 'Trịnh Thị Anh', '0901234590', 'tta@email.com', 3, 1, '78 Thái Hà, Đống Đa, HN', '1987-01-26', 'female'),
    ('KH025', 'Tô Văn Bảo', '0901234591', 'tvb@email.com', 2, 45, '90 Trường Chinh, Quận Tân Bình, HCM', '1991-05-04', 'male'),
    -- Khách hàng 26-50
    ('KH026', 'Nguyễn Thị Cẩm', '0901234592', 'ntc26@email.com', 3, 1, '15 Đội Cấn, Ba Đình, HN', '1993-08-12', 'female'),
    ('KH027', 'Lê Hoàng Dũng', '0901234593', 'lhd27@email.com', 4, 45, '22 Phan Xích Long, Phú Nhuận, HCM', '1986-11-28', 'male'),
    ('KH028', 'Phạm Minh Đức', '0901234594', 'pmd28@email.com', 2, 46, '8 Lê Hồng Phong, Thủ Dầu Một, BD', '1990-02-19', 'male'),
    ('KH029', 'Trần Thanh Hằng', '0901234595', 'tth29@email.com', 1, 45, '45 Lý Thái Tổ, Quận 10, HCM', '1988-06-07', 'female'),
    ('KH030', 'Vũ Đình Khoa', '0901234596', 'vdk30@email.com', 5, 1, '67 Hoàng Hoa Thám, Ba Đình, HN', '1995-01-30', 'male'),
    ('KH031', 'Đỗ Thị Lan', '0901234597', 'dtl31@email.com', 3, 32, '33 Nguyễn Văn Linh, Hải Châu, DN', '1991-09-14', 'female'),
    ('KH032', 'Bùi Quốc Minh', '0901234598', 'bqm32@email.com', 2, 45, '18 Trần Hưng Đạo, Quận 5, HCM', '1987-12-25', 'male'),
    ('KH033', 'Hoàng Thị Ngọc', '0901234599', 'htn33@email.com', 4, 1, '55 Cầu Giấy, Cầu Giấy, HN', '1994-03-08', 'female'),
    ('KH034', 'Đinh Công Phát', '0901234600', 'dcp34@email.com', 5, 47, '11 Trần Phú, Ninh Kiều, CT', '1989-07-20', 'male'),
    ('KH035', 'Ngô Thanh Quý', '0901234601', 'ntq35@email.com', 1, 45, '99 Nguyễn Đình Chiểu, Quận 3, HCM', '1992-10-03', 'female'),
    ('KH036', 'Cao Hữu Sang', '0901234602', 'chs36@email.com', 3, 2, '27 Lạch Tray, Ngô Quyền, HP', '1986-04-17', 'male'),
    ('KH037', 'Lý Thị Tâm', '0901234603', 'ltt37@email.com', 2, 45, '41 Võ Thị Sáu, Quận 3, HCM', '1990-08-29', 'female'),
    ('KH038', 'Phan Đức Uy', '0901234604', 'pdu38@email.com', 4, 1, '63 Nguyễn Trãi, Thanh Xuân, HN', '1988-01-11', 'male'),
    ('KH039', 'Tạ Ngọc Vân', '0901234605', 'tnv39@email.com', 5, 31, '7 Lê Lợi, TP Huế', '1993-05-24', 'female'),
    ('KH040', 'Mai Xuân Phong', '0901234606', 'mxp40@email.com', 3, 45, '85 Bùi Viện, Quận 1, HCM', '1987-09-06', 'male'),
    ('KH041', 'Hồ Thị Ánh', '0901234607', 'hta41@email.com', 2, 48, '19 Lê Hồng Phong, TP Vũng Tàu', '1991-12-18', 'female'),
    ('KH042', 'Trương Minh Bảo', '0901234608', 'tmb42@email.com', 4, 1, '73 Định Công, Hoàng Mai, HN', '1989-03-02', 'male'),
    ('KH043', 'Dương Thị Châu', '0901234609', 'dtc43@email.com', 1, 45, '29 Nguyễn Công Trứ, Quận 1, HCM', '1994-06-15', 'female'),
    ('KH044', 'Lương Hải Đăng', '0901234610', 'lhd44@email.com', 5, 32, '51 Hoàng Diệu, Hải Châu, DN', '1986-10-28', 'male'),
    ('KH045', 'Võ Thị Gấm', '0901234611', 'vtg45@email.com', 3, 45, '37 Lê Văn Sỹ, Quận 3, HCM', '1990-01-10', 'female'),
    ('KH046', 'Đặng Quốc Huy', '0901234612', 'dqh46@email.com', 2, 1, '95 Giải Phóng, Hoàng Mai, HN', '1988-04-22', 'male'),
    ('KH047', 'Chu Thị Hồng Nhung', '0901234613', 'cthn47@email.com', 4, 33, '13 Trần Phú, Tam Kỳ, QN', '1993-07-04', 'female'),
    ('KH048', 'Huỳnh Tấn Lộc', '0901234614', 'htl48@email.com', 5, 45, '61 Cộng Hòa, Tân Bình, HCM', '1987-11-17', 'male'),
    ('KH049', 'Trịnh Thị Mỹ Linh', '0901234615', 'ttml49@email.com', 1, 1, '47 Trúc Bạch, Ba Đình, HN', '1992-02-28', 'female'),
    ('KH050', 'Tô Đình Nam', '0901234616', 'tdn50@email.com', 3, 45, '83 Hoàng Sa, Quận 1, HCM', '1989-06-10', 'male'),
    -- Khách hàng 51-75
    ('KH051', 'Nguyễn Minh Quân', '0901234617', 'nmq51@email.com', 2, 1, '21 Thanh Nhàn, Hai Bà Trưng, HN', '1991-09-23', 'male'),
    ('KH052', 'Trần Thị Huyền Trang', '0901234618', 'ttht52@email.com', 4, 45, '39 Đinh Tiên Hoàng, Bình Thạnh, HCM', '1987-12-05', 'female'),
    ('KH053', 'Lê Anh Tuấn', '0901234619', 'lat53@email.com', 5, 3, '15 Lý Thái Tổ, TP Bắc Ninh', '1994-03-18', 'male'),
    ('KH054', 'Phạm Thị Uyên', '0901234620', 'ptu54@email.com', 3, 45, '57 Nguyễn Thượng Hiền, Quận 3, HCM', '1990-06-30', 'female'),
    ('KH055', 'Hoàng Đức Vinh', '0901234621', 'hdv55@email.com', 1, 1, '79 Liễu Giai, Ba Đình, HN', '1986-10-12', 'male'),
    ('KH056', 'Vũ Thị Thanh Xuân', '0901234622', 'vttx56@email.com', 2, 32, '23 Phan Đăng Lưu, Hải Châu, DN', '1992-01-25', 'female'),
    ('KH057', 'Đỗ Minh Hoàng', '0901234623', 'dmh57@email.com', 4, 45, '65 Trường Sa, Quận 3, HCM', '1988-04-07', 'male'),
    ('KH058', 'Bùi Thị Kim Oanh', '0901234624', 'btko58@email.com', 5, 1, '31 Thái Thịnh, Đống Đa, HN', '1993-07-20', 'female'),
    ('KH059', 'Đinh Hữu Phước', '0901234625', 'dhp59@email.com', 3, 46, '9 Đại Lộ Bình Dương, Thủ Dầu Một, BD', '1987-11-02', 'male'),
    ('KH060', 'Ngô Thị Tuyết Mai', '0901234626', 'nttm60@email.com', 2, 45, '43 Lê Thị Riêng, Quận 1, HCM', '1991-02-14', 'female'),
    ('KH061', 'Cao Xuân Trường', '0901234627', 'cxt61@email.com', 4, 1, '87 Chùa Bộc, Đống Đa, HN', '1989-05-27', 'male'),
    ('KH062', 'Lý Thị Diễm Phúc', '0901234628', 'ltdp62@email.com', 1, 45, '25 Trần Quang Khải, Quận 1, HCM', '1994-08-09', 'female'),
    ('KH063', 'Phan Thành Đạt', '0901234629', 'ptd63@email.com', 5, 47, '51 Mậu Thân, Ninh Kiều, CT', '1986-12-22', 'male'),
    ('KH064', 'Tạ Thị Phương Thảo', '0901234630', 'ttpt64@email.com', 3, 1, '69 Khâm Thiên, Đống Đa, HN', '1990-03-06', 'female'),
    ('KH065', 'Mai Hồng Quang', '0901234631', 'mhq65@email.com', 2, 45, '17 Hồ Tùng Mậu, Quận 1, HCM', '1988-06-19', 'male'),
    ('KH066', 'Hồ Ngọc Bích', '0901234632', 'hnb66@email.com', 4, 32, '35 Ông Ích Khiêm, Hải Châu, DN', '1993-09-01', 'female'),
    ('KH067', 'Trương Quang Vinh', '0901234633', 'tqv67@email.com', 5, 1, '53 Tôn Thất Tùng, Đống Đa, HN', '1987-01-14', 'male'),
    ('KH068', 'Dương Thị Bích Ngọc', '0901234634', 'dtbn68@email.com', 3, 45, '71 Hai Bà Trưng, Quận 1, HCM', '1991-04-26', 'female'),
    ('KH069', 'Lương Đình Trọng', '0901234635', 'ldt69@email.com', 1, 2, '19 Tô Hiệu, Lê Chân, HP', '1989-08-08', 'male'),
    ('KH070', 'Võ Thị Thanh Hà', '0901234636', 'vtth70@email.com', 2, 45, '89 Bến Vân Đồn, Quận 4, HCM', '1994-11-21', 'female'),
    ('KH071', 'Đặng Trung Kiên', '0901234637', 'dtk71@email.com', 4, 1, '33 Lạc Long Quân, Tây Hồ, HN', '1986-03-05', 'male'),
    ('KH072', 'Chu Thị Minh Nguyệt', '0901234638', 'ctmn72@email.com', 5, 45, '47 Nguyễn Văn Cừ, Quận 5, HCM', '1990-06-17', 'female'),
    ('KH073', 'Huỳnh Bá Phúc', '0901234639', 'hbp73@email.com', 3, 48, '5 Trương Công Định, TP Vũng Tàu', '1988-09-30', 'male'),
    ('KH074', 'Trịnh Ngọc Hân', '0901234640', 'tnh74@email.com', 2, 1, '61 Văn Cao, Ba Đình, HN', '1993-01-12', 'female'),
    ('KH075', 'Tô Văn Thịnh', '0901234641', 'tvt75@email.com', 4, 45, '77 Lê Quang Định, Bình Thạnh, HCM', '1987-04-25', 'male'),
    -- Khách hàng 76-100
    ('KH076', 'Nguyễn Thị Hạnh Dung', '0901234642', 'nthd76@email.com', 1, 45, '3 Nguyễn Cư Trinh, Quận 1, HCM', '1991-07-07', 'female'),
    ('KH077', 'Trần Bảo Khánh', '0901234643', 'tbk77@email.com', 5, 1, '41 Nguyễn Khuyến, Đống Đa, HN', '1989-10-20', 'male'),
    ('KH078', 'Lê Thị Ngọc Ánh', '0901234644', 'ltna78@email.com', 3, 32, '29 Hàm Nghi, Hải Châu, DN', '1994-02-02', 'female'),
    ('KH079', 'Phạm Quốc Đại', '0901234645', 'pqd79@email.com', 2, 45, '67 Nguyễn Kiệm, Phú Nhuận, HCM', '1986-05-15', 'male'),
    ('KH080', 'Hoàng Thị Tuyết Nhung', '0901234646', 'httn80@email.com', 4, 1, '85 Kim Ngưu, Hai Bà Trưng, HN', '1990-08-28', 'female'),
    ('KH081', 'Vũ Đức Thắng', '0901234647', 'vdt81@email.com', 5, 46, '13 Phú Lợi, Thủ Dầu Một, BD', '1988-12-10', 'male'),
    ('KH082', 'Đỗ Thị Mai Hương', '0901234648', 'dtmh82@email.com', 3, 45, '51 Ký Con, Quận 1, HCM', '1993-03-24', 'female'),
    ('KH083', 'Bùi Hoàng Nam', '0901234649', 'bhn83@email.com', 1, 1, '39 Phạm Ngọc Thạch, Đống Đa, HN', '1987-06-06', 'male'),
    ('KH084', 'Đinh Thị Thanh Tâm', '0901234650', 'dttt84@email.com', 2, 45, '73 Phạm Viết Chánh, Bình Thạnh, HCM', '1991-09-19', 'female'),
    ('KH085', 'Ngô Hữu Tài', '0901234651', 'nht85@email.com', 4, 31, '7 Bà Triệu, TP Huế', '1989-01-01', 'male'),
    ('KH086', 'Cao Thị Phương Linh', '0901234652', 'ctpl86@email.com', 5, 45, '91 Nguyễn Thái Bình, Quận 1, HCM', '1994-04-14', 'female'),
    ('KH087', 'Lý Quang Hào', '0901234653', 'lqh87@email.com', 3, 1, '59 Nguyễn Lương Bằng, Đống Đa, HN', '1986-07-27', 'male'),
    ('KH088', 'Phan Thị Diệu Linh', '0901234654', 'ptdl88@email.com', 2, 32, '15 Nguyễn Chí Thanh, Hải Châu, DN', '1990-11-09', 'female'),
    ('KH089', 'Tạ Minh Trí', '0901234655', 'tmt89@email.com', 4, 45, '33 Hoàng Văn Thụ, Tân Bình, HCM', '1988-02-22', 'male'),
    ('KH090', 'Mai Thị Hồng Nhung', '0901234656', 'mthn90@email.com', 1, 1, '77 Trần Khát Chân, Hai Bà Trưng, HN', '1993-06-04', 'female'),
    ('KH091', 'Hồ Thanh Phong', '0901234657', 'htp91@email.com', 5, 45, '5 Pasteur, Quận 3, HCM', '1987-09-17', 'male'),
    ('KH092', 'Trương Thị Kim Chi', '0901234658', 'ttkc92@email.com', 3, 47, '23 Nguyễn Trãi, Ninh Kiều, CT', '1991-12-30', 'female'),
    ('KH093', 'Dương Hoàng Sơn', '0901234659', 'dhs93@email.com', 2, 1, '67 Vĩnh Hồ, Đống Đa, HN', '1989-04-12', 'male'),
    ('KH094', 'Lương Thị Bích Thủy', '0901234660', 'ltbt94@email.com', 4, 45, '81 Đề Thám, Quận 1, HCM', '1994-07-25', 'female'),
    ('KH095', 'Võ Anh Khôi', '0901234661', 'vak95@email.com', 5, 1, '49 Hào Nam, Đống Đa, HN', '1986-11-07', 'male'),
    ('KH096', 'Đặng Thị Quỳnh Như', '0901234662', 'dtqn96@email.com', 1, 45, '15 Tôn Thất Đạm, Quận 1, HCM', '1990-02-19', 'female'),
    ('KH097', 'Chu Văn Hiếu', '0901234663', 'cvh97@email.com', 3, 32, '43 Phan Chu Trinh, Hải Châu, DN', '1988-05-03', 'male'),
    ('KH098', 'Huỳnh Thị Yến Nhi', '0901234664', 'htyn98@email.com', 2, 45, '27 Lê Thánh Tôn, Quận 1, HCM', '1993-08-16', 'female'),
    ('KH099', 'Trịnh Đức Long', '0901234665', 'tdl99@email.com', 4, 1, '71 Láng Hạ, Đống Đa, HN', '1987-12-28', 'male'),
    ('KH100', 'Tô Thị Phương Mai', '0901234666', 'ttpm100@email.com', 5, 45, '53 Nguyễn Trãi, Quận 5, HCM', '1991-03-13', 'female');

-- =========================
-- PRODUCTS (49 sản phẩm)
-- =========================
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, has_variants, image_url) VALUES
    -- Mì gói (5 sản phẩm)
    ('MIG001', 'Mì Hảo Hảo tôm chua cay', 11, 1, 1, 'Mì ăn liền vị tôm chua cay phổ biến', FALSE, '/uploads/products/product-1.jpg'),
    ('MIG002', 'Mì Hảo Hảo sườn heo', 11, 1, 1, 'Mì ăn liền vị sườn heo thơm ngon', FALSE, '/uploads/products/product-2.jpg'),
    ('MIG003', 'Mì Omachi xào bò', 11, 2, 1, 'Mì xào cao cấp vị bò', FALSE, '/uploads/products/product-3.jpg'),
    ('MIG004', 'Mì Kokomi tôm', 11, 1, 1, 'Mì tôm ngon cho bữa sáng', FALSE, '/uploads/products/product-4.jpg'),
    ('MIG005', 'Mì Asia gà', 11, 3, 1, 'Mì vị gà giá rẻ', FALSE, '/uploads/products/product-5.jpg'),
    
    -- Nước ngọt (7 sản phẩm)
    ('NGK001', 'Coca-Cola lon 330ml', 12, 4, 5, 'Nước giải khát có ga Coca-Cola', FALSE, '/uploads/products/product-6.jpg'),
    ('NGK002', 'Coca-Cola chai 1.5L', 12, 4, 4, 'Nước giải khát có ga Coca-Cola chai lớn', FALSE, '/uploads/products/product-7.jpg'),
    ('NGK003', 'Pepsi lon 330ml', 12, 5, 5, 'Nước giải khát có ga Pepsi', FALSE, '/uploads/products/product-8.jpg'),
    ('NGK004', 'Pepsi chai 1.5L', 12, 5, 4, 'Nước giải khát có ga Pepsi chai lớn', FALSE, '/uploads/products/product-9.jpg'),
    ('NGK005', 'Sting vàng 330ml', 12, 6, 5, 'Nước tăng lực Sting vàng', FALSE, '/uploads/products/product-10.jpg'),
    ('NGK006', 'Sting đỏ 330ml', 12, 6, 5, 'Nước tăng lực Sting đỏ', FALSE, '/uploads/products/product-11.jpg'),
    ('NGK007', 'Red Bull 250ml', 12, 7, 5, 'Nước tăng lực Red Bull chính hãng', FALSE, '/uploads/products/product-12.jpg'),
    
    -- Nước ép (3 sản phẩm)
    ('NEP001', 'Nước cam ép NutiFood 1L', 13, 8, 2, 'Nước cam ép 100% tự nhiên', FALSE, '/uploads/products/product-13.jpg'),
    ('NEP002', 'Nước dứa ép NutiFood 1L', 13, 8, 2, 'Nước dứa ép 100% tự nhiên', FALSE, '/uploads/products/product-14.jpg'),
    ('NEP003', 'Nước táo ép NutiFood 1L', 13, 8, 2, 'Nước táo ép 100% tự nhiên', FALSE, '/uploads/products/product-15.jpg'),
    
    -- Sữa (7 sản phẩm)
    ('SUA001', 'Sữa tươi Vinamilk hộp 1L', 14, 9, 2, 'Sữa tươi tiệt trùng không đường', FALSE, '/uploads/products/product-16.jpg'),
    ('SUA002', 'Sữa tươi TH True Milk 1L', 14, 10, 2, 'Sữa tươi organic cao cấp', FALSE, '/uploads/products/product-17.jpg'),
    ('SUA003', 'Sữa tươi Dutch Lady 1L', 14, 11, 2, 'Sữa tươi nhập khẩu cao cấp', FALSE, '/uploads/products/product-18.jpg'),
    ('SUA004', 'Sữa chua uống Vinamilk 180ml', 15, 9, 2, 'Sữa chua uống có đường', FALSE, '/uploads/products/product-19.jpg'),
    ('SUA005', 'Sữa chua ăn Vinamilk 100g', 15, 9, 1, 'Sữa chua ăn vị dâu', FALSE, '/uploads/products/product-20.jpg'),
    ('SUA006', 'Sữa bột Vinamilk 400g', 24, 9, 2, 'Sữa bột cho người lớn', FALSE, '/uploads/products/product-21.jpg'),
    ('SUA007', 'Sữa bột Dutch Lady 900g', 24, 11, 2, 'Sữa bột cho trẻ em cao cấp', FALSE, '/uploads/products/product-22.jpg'),
    
    -- Bánh kẹo (5 sản phẩm)
    ('BK001', 'Snack Oishi 40g', 16, 12, 1, 'Snack khoai tây Oishi nhiều vị', FALSE, '/uploads/products/product-23.jpg'),
    ('BK002', 'Snack Lay''s 50g', 16, 13, 1, 'Snack khoai tây Lay''s cao cấp', FALSE, '/uploads/products/product-24.jpg'),
    ('BK003', 'Bánh quy Oreo 137g', 16, 12, 1, 'Bánh quy kẹp kem Oreo', FALSE, '/uploads/products/product-25.jpg'),
    ('BK004', 'Kẹo Alpenliebe 120g', 17, 12, 1, 'Kẹo mềm nhiều vị', FALSE, '/uploads/products/product-26.jpg'),
    ('BK005', 'Kẹo Mentos 37g', 17, 12, 1, 'Kẹo bạc hà Mentos', FALSE, '/uploads/products/product-27.jpg'),
    
    -- Gia vị (8 sản phẩm)
    ('GV001', 'Nước mắm Nam Ngư 500ml', 18, 15, 4, 'Nước mắm truyền thống Phan Thiết', FALSE, '/uploads/products/product-28.jpg'),
    ('GV002', 'Nước tương Chin-su 500ml', 18, 15, 4, 'Nước tương đậm đặc', FALSE, '/uploads/products/product-29.jpg'),
    ('GV003', 'Tương ớt Chin-su 250g', 18, 15, 2, 'Tương ớt cay đặc biệt', FALSE, '/uploads/products/product-30.jpg'),
    ('GV004', 'Dầu ăn Simply 1L', 19, 15, 4, 'Dầu ăn cao cấp từ đậu nành', FALSE, '/uploads/products/product-31.jpg'),
    ('GV005', 'Hạt nêm Knorr 400g', 19, 16, 2, 'Hạt nêm từ thịt heo, xương', FALSE, '/uploads/products/product-32.jpg'),
    ('GV006', 'Bột ngọt Ajinomoto 400g', 19, 16, 2, 'Bột ngọt chất lượng cao', FALSE, '/uploads/products/product-33.jpg'),
    ('GV007', 'Muối I-ốt 500g', 19, 15, 1, 'Muối I-ốt tinh khiết', FALSE, '/uploads/products/product-34.jpg'),
    ('GV008', 'Đường trắng 1kg', 19, 15, 1, 'Đường kính tinh luyện', FALSE, '/uploads/products/product-35.jpg'),
    
    -- Gia dụng (5 sản phẩm)
    ('GD001', 'Nước giặt OMO 3.8kg', 20, 17, 4, 'Nước giặt OMO đậm đặc', FALSE, '/uploads/products/product-36.jpg'),
    ('GD002', 'Nước giặt Ariel 3.6kg', 20, 18, 4, 'Nước giặt Ariel giặt sạch vượt trội', FALSE, '/uploads/products/product-37.jpg'),
    ('GD003', 'Nước rửa chén Sunlight 750g', 20, 17, 4, 'Nước rửa chén chanh', FALSE, '/uploads/products/product-38.jpg'),
    ('GD004', 'Nước lau sàn Vim 1L', 20, 17, 4, 'Nước lau sàn kháng khuẩn', FALSE, '/uploads/products/product-39.jpg'),
    ('GD005', 'Xà phòng Lifebuoy 90g', 21, 17, 10, 'Xà phòng diệt khuẩn', FALSE, '/uploads/products/product-40.jpg'),
    
    -- Cá nhân (6 sản phẩm)
    ('CN001', 'Dầu gội Clear 630ml', 22, 20, 4, 'Dầu gội sạch gàu nam', FALSE, '/uploads/products/product-41.jpg'),
    ('CN002', 'Dầu gội Sunsilk 330ml', 22, 21, 4, 'Dầu gội mềm mượt tóc nữ', FALSE, '/uploads/products/product-42.jpg'),
    ('CN003', 'Sữa tắm Dove 530g', 21, 19, 4, 'Sữa tắm dưỡng ẩm', FALSE, '/uploads/products/product-43.jpg'),
    ('CN004', 'Kem đánh răng PS 230g', 21, 17, 10, 'Kem đánh răng bảo vệ nướu', FALSE, '/uploads/products/product-44.jpg'),
    ('CN005', 'Bàn chải đánh răng PS', 21, 17, 10, 'Bàn chải lông mềm', FALSE, '/uploads/products/product-45.jpg'),
    ('CN006', 'Khăn giấy Tempo hộp 100 tờ', 21, 12, 2, 'Khăn giấy mềm mịn', FALSE, '/uploads/products/product-46.jpg'),
    
    -- Cà phê (3 sản phẩm)
    ('CF001', 'Cà phê G7 3in1 hộp 16 gói', 2, 24, 2, 'Cà phê hòa tan 3in1 Trung Nguyên', FALSE, '/uploads/products/product-47.jpg'),
    ('CF002', 'Cà phê Highlands hộp 14 gói', 2, 24, 2, 'Cà phê hòa tan cao cấp', FALSE, '/uploads/products/product-48.jpg'),
    ('CF003', 'Cà phê Nescafe 3in1 hộp 20 gói', 2, 24, 2, 'Cà phê hòa tan Nestle', FALSE, '/uploads/products/product-49.jpg');

-- =========================
-- PRODUCT VARIANTS (49 variants)
-- =========================
INSERT INTO dim_product_variants (product_id, sku, barcode, cost_price, selling_price) VALUES
    (1, 'MIG001-SKU', '8934567890001', 2500, 4000),
    (2, 'MIG002-SKU', '8934567890002', 2500, 4000),
    (3, 'MIG003-SKU', '8934567890003', 4500, 7000),
    (4, 'MIG004-SKU', '8934567890004', 3500, 5500),
    (5, 'MIG005-SKU', '8934567890005', 4000, 6500),
    (6, 'NGK001-SKU', '8934567890006', 6500, 11000),
    (7, 'NGK002-SKU', '8934567890007', 16000, 25000),
    (8, 'NGK003-SKU', '8934567890008', 6000, 10000),
    (9, 'NGK004-SKU', '8934567890009', 15000, 23000),
    (10, 'NGK005-SKU', '8934567890010', 6500, 11000),
    (11, 'NGK006-SKU', '8934567890011', 6500, 11000),
    (12, 'NGK007-SKU', '8934567890012', 6000, 10000),
    (13, 'NEP001-SKU', '8934567890013', 28000, 42000),
    (14, 'NEP002-SKU', '8934567890014', 28000, 42000),
    (15, 'NEP003-SKU', '8934567890015', 22000, 35000),
    (16, 'SUA001-SKU', '8934567890016', 25000, 38000),
    (17, 'SUA002-SKU', '8934567890017', 25000, 38000),
    (18, 'SUA003-SKU', '8934567890018', 30000, 45000),
    (19, 'SUA004-SKU', '8934567890019', 5500, 8500),
    (20, 'SUA005-SKU', '8934567890020', 6000, 9500),
    (21, 'SUA006-SKU', '8934567890021', 22000, 32000),
    (22, 'SUA007-SKU', '8934567890022', 28000, 42000),
    (23, 'BK001-SKU', '8934567890023', 22000, 35000),
    (24, 'BK002-SKU', '8934567890024', 35000, 55000),
    (25, 'BK003-SKU', '8934567890025', 18000, 28000),
    (26, 'BK004-SKU', '8934567890026', 15000, 25000),
    (27, 'BK005-SKU', '8934567890027', 18000, 28000),
    (28, 'GV001-SKU', '8934567890028', 25000, 38000),
    (29, 'GV002-SKU', '8934567890029', 22000, 35000),
    (30, 'GV003-SKU', '8934567890030', 32000, 48000),
    (31, 'GV004-SKU', '8934567890031', 55000, 85000),
    (32, 'GV005-SKU', '8934567890032', 35000, 52000),
    (33, 'GV006-SKU', '8934567890033', 38000, 56000),
    (34, 'GV007-SKU', '8934567890034', 12000, 18000),
    (35, 'GV008-SKU', '8934567890035', 15000, 22000),
    (36, 'GD001-SKU', '8934567890036', 95000, 145000),
    (37, 'GD002-SKU', '8934567890037', 85000, 130000),
    (38, 'GD003-SKU', '8934567890038', 25000, 38000),
    (39, 'GD004-SKU', '8934567890039', 45000, 68000),
    (40, 'GD005-SKU', '8934567890040', 25000, 38000),
    (41, 'CN001-SKU', '8934567890041', 35000, 55000),
    (42, 'CN002-SKU', '8934567890042', 15000, 25000),
    (43, 'CN003-SKU', '8934567890043', 85000, 130000),
    (44, 'CN004-SKU', '8934567890044', 55000, 85000),
    (45, 'CN005-SKU', '8934567890045', 75000, 115000),
    (46, 'CN006-SKU', '8934567890046', 28000, 42000),
    (47, 'CF001-SKU', '8934567890047', 45000, 68000),
    (48, 'CF002-SKU', '8934567890048', 55000, 85000),
    (49, 'CF003-SKU', '8934567890049', 52000, 80000);

-- =========================
-- USERS (6 người dùng) - Password: "1"
-- Hash bcrypt: $2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK
-- =========================
INSERT INTO dim_users (username, email, password_hash, full_name, role_id, store_id, phone) VALUES
    ('admin', 'admin@minimart.com', '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Admin Hệ Thống', 1, 1, '0900000001'),
    ('staff_hn1', 'staff.hn1@minimart.com', '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Nguyễn Văn Minh', 2, 1, '0900000002'),
    ('staff_hn2', 'staff.hn2@minimart.com', '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Trần Thị Hoa', 2, 2, '0900000003'),
    ('staff_hcm1', 'staff.hcm1@minimart.com', '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Lê Văn Nam', 2, 3, '0900000004'),
    ('staff_hcm2', 'staff.hcm2@minimart.com', '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Phạm Văn Đức', 2, 4, '0900000005'),
    ('staff_wh', 'staff.wh@minimart.com', '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Võ Hoàng Anh', 2, 5, '0900000006');

-- =========================
-- CARRIERS (6 carriers)
-- =========================
INSERT INTO dim_carriers (code, name, phone, tracking_url_template) VALUES
    ('INTERNAL', 'Giao hàng nội bộ', NULL, NULL),
    ('GHN', 'Giao Hàng Nhanh', '1900636336', 'https://donhang.ghn.vn/?order_code={tracking_code}'),
    ('GHTK', 'Giao Hàng Tiết Kiệm', '1900636886', 'https://i.ghtk.vn/{tracking_code}'),
    ('VNP', 'Viettel Post', '1900866868', 'https://viettelpost.com.vn/tra-cuu-hang-gui?tracking_code={tracking_code}'),
    ('JT', 'J&T Express', '1900158815', 'https://jtexpress.vn/track?bills={tracking_code}'),
    ('BEST', 'Best Express', '1900063630', 'https://bestexpress.vn/tracking/{tracking_code}');

-- =========================
-- BANK ACCOUNTS (3 accounts)
-- =========================
INSERT INTO dim_bank_accounts (account_name, account_number, bank_name, bank_code, branch, store_id, is_default, is_active, created_by)
VALUES 
    ('Siêu Thị Mini HCM', '1234567890', 'Vietcombank', 'VCB', 'Chi nhánh Quận 1', 3, TRUE, TRUE, 1),
    ('Siêu Thị Mini HN', '0987654321', 'Techcombank', 'TCB', 'Chi nhánh Hoàng Mai', 1, TRUE, TRUE, 1),
    ('Kho Tổng', '5678901234', 'ACB', 'ACB', 'Chi nhánh Tân Bình', 5, TRUE, TRUE, 1);

-- =========================
-- DIM_TIME (2025-2027)
-- =========================
INSERT INTO dim_time (date_key, day_of_week, day_name, week_of_year, month, month_name, quarter, year, is_weekend)
SELECT 
    d::date as date_key,
    EXTRACT(DOW FROM d) as day_of_week,
    TO_CHAR(d, 'Day') as day_name,
    EXTRACT(WEEK FROM d) as week_of_year,
    EXTRACT(MONTH FROM d) as month,
    TO_CHAR(d, 'Month') as month_name,
    EXTRACT(QUARTER FROM d) as quarter,
    EXTRACT(YEAR FROM d) as year,
    EXTRACT(DOW FROM d) IN (0, 6) as is_weekend
FROM generate_series('2025-01-01'::date, '2027-12-31'::date, '1 day'::interval) d;

-- Update Vietnam holidays
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
    ('SALE10', 'Giảm 10%', 'Giảm 10% cho đơn từ 200K', 1, 10, 50000, 200000, 1000, '2026-01-01', '2026-12-31', 1),
    ('WELCOME50', 'Chào mừng 50K', 'Giảm 50K cho khách mới', 2, 50000, NULL, 100000, 500, '2026-01-01', '2026-06-30', 1),
    ('FREESHIP', 'Miễn phí ship', 'Miễn phí ship đơn từ 300K', 4, 30000, NULL, 300000, NULL, '2026-01-01', '2026-12-31', 1);

-- =========================
-- INVENTORY STOCKS (5 stores x 49 variants = 245 records)
-- =========================
INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 1, id, FLOOR(RANDOM() * 200 + 50)::int, 20, 300 FROM dim_product_variants WHERE id <= 49;

INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 2, id, FLOOR(RANDOM() * 150 + 30)::int, 15, 200 FROM dim_product_variants WHERE id <= 49;

INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 3, id, FLOOR(RANDOM() * 250 + 80)::int, 25, 400 FROM dim_product_variants WHERE id <= 49;

INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 4, id, FLOOR(RANDOM() * 100 + 20)::int, 10, 150 FROM dim_product_variants WHERE id <= 49;

INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 5, id, FLOOR(RANDOM() * 1000 + 500)::int, 100, 2000 FROM dim_product_variants WHERE id <= 49;

-- =========================
-- SAMPLE CASHBOOK TRANSACTION
-- =========================
INSERT INTO fact_cashbook_transactions (
    transaction_code, date_key, store_id, cashbook_type_id, payment_method_id,
    amount, reference_type, description, created_by, status
) 
SELECT 
    'CB-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-001',
    CURRENT_DATE,
    1,
    (SELECT id FROM subdim_cashbook_types WHERE code = 'SALES_INCOME'),
    (SELECT id FROM subdim_payment_methods WHERE code = 'CASH'),
    1500000,
    'ORDER',
    'Thu tiền bán hàng ngày',
    1,
    'approved'
WHERE EXISTS (SELECT 1 FROM dim_time WHERE date_key = CURRENT_DATE)
  AND EXISTS (SELECT 1 FROM dim_stores WHERE id = 1)
  AND EXISTS (SELECT 1 FROM dim_users WHERE id = 1)
ON CONFLICT DO NOTHING;

-- =========================
-- COMPLETION MESSAGE
-- =========================
DO $$ 
BEGIN
    RAISE NOTICE '✅ Seed data completed successfully!';
    RAISE NOTICE '   📍 Regions: 3';
    RAISE NOTICE '   🏙️  Cities: 10';
    RAISE NOTICE '   📂 Categories: 24 (hierarchical)';
    RAISE NOTICE '   🏷️  Brands: 24';
    RAISE NOTICE '   🏪 Stores: 5 (4 retail + 1 warehouse)';
    RAISE NOTICE '   🏭 Suppliers: 8';
    RAISE NOTICE '   👥 Customers: 100';
    RAISE NOTICE '   📦 Products: 49';
    RAISE NOTICE '   🔖 Product Variants: 49';
    RAISE NOTICE '   👤 Users: 6 (Password: "1")';
    RAISE NOTICE '   🚚 Carriers: 6';
    RAISE NOTICE '   🏦 Bank Accounts: 3';
    RAISE NOTICE '   🎁 Discounts: 3';
    RAISE NOTICE '   📊 Inventory Stocks: 245 (5 stores x 49 variants)';
    RAISE NOTICE '   📅 Time dimension: 2025-2027 (1096 days)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Orders NOT seeded — use incremental_data_generator.sql:';
    RAISE NOTICE '   SELECT generate_daily_data(''2026-01-15'');';
    RAISE NOTICE '   SELECT backfill_daily_data(''2026-01-01'', ''2026-01-31'');';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Login credentials:';
    RAISE NOTICE '   Username: admin | Password: 1';
    RAISE NOTICE '   Username: staff_hn1 | Password: 1';
    RAISE NOTICE '   Username: staff_hcm1 | Password: 1';
END $$;
