-- =====================================================
-- SUPERMARKET MANAGEMENT SYSTEM - SEED DATA
-- Version: 3.1 | Date: 01/02/2026
-- Đã gộp dữ liệu từ tất cả migrations
-- Có TRUNCATE để có thể chạy lại nhiều lần
-- =====================================================

-- =========================
-- TRUNCATE ALL TABLES (theo thứ tự FK)
-- =========================
TRUNCATE TABLE fact_shipment_tracking CASCADE;
TRUNCATE TABLE fact_shipments CASCADE;
TRUNCATE TABLE fact_store_balances CASCADE;
TRUNCATE TABLE fact_cashbook_transactions CASCADE;
TRUNCATE TABLE fact_discount_usages CASCADE;
TRUNCATE TABLE fact_order_items CASCADE;
TRUNCATE TABLE fact_orders CASCADE;
TRUNCATE TABLE fact_inventory_transactions CASCADE;
TRUNCATE TABLE fact_inventory_stocks CASCADE;
TRUNCATE TABLE dim_bank_accounts CASCADE;
TRUNCATE TABLE dim_discounts CASCADE;
TRUNCATE TABLE dim_carriers CASCADE;
TRUNCATE TABLE dim_product_variants CASCADE;
TRUNCATE TABLE dim_product_images CASCADE;
TRUNCATE TABLE dim_products CASCADE;
TRUNCATE TABLE dim_users CASCADE;
TRUNCATE TABLE dim_customers CASCADE;
TRUNCATE TABLE dim_suppliers CASCADE;
TRUNCATE TABLE dim_stores CASCADE;
TRUNCATE TABLE dim_time CASCADE;
TRUNCATE TABLE role_permissions CASCADE;
TRUNCATE TABLE subdim_permissions CASCADE;
TRUNCATE TABLE subdim_roles CASCADE;
TRUNCATE TABLE subdim_shipment_statuses CASCADE;
TRUNCATE TABLE subdim_payment_methods CASCADE;
TRUNCATE TABLE subdim_cashbook_types CASCADE;
TRUNCATE TABLE subdim_discount_types CASCADE;
TRUNCATE TABLE subdim_transaction_types CASCADE;
TRUNCATE TABLE subdim_store_types CASCADE;
TRUNCATE TABLE subdim_customer_groups CASCADE;
TRUNCATE TABLE subdim_units CASCADE;
TRUNCATE TABLE subdim_brands CASCADE;
TRUNCATE TABLE subdim_categories CASCADE;
TRUNCATE TABLE subdim_cities CASCADE;
TRUNCATE TABLE subdim_regions CASCADE;

-- Reset sequences
ALTER SEQUENCE subdim_regions_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_cities_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_brands_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_units_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_customer_groups_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_store_types_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_transaction_types_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_roles_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_permissions_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_discount_types_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_cashbook_types_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_payment_methods_id_seq RESTART WITH 1;
ALTER SEQUENCE subdim_shipment_statuses_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_stores_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_suppliers_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_customers_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_products_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_product_variants_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_users_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_discounts_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_carriers_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_bank_accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE fact_inventory_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE fact_orders_id_seq RESTART WITH 1;
ALTER SEQUENCE fact_order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE fact_discount_usages_id_seq RESTART WITH 1;
ALTER SEQUENCE fact_cashbook_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE fact_shipments_id_seq RESTART WITH 1;
ALTER SEQUENCE fact_shipment_tracking_id_seq RESTART WITH 1;

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
('HN', 'Hà Nội', 1),
('HP', 'Hải Phòng', 1),
('BN', 'Bắc Ninh', 1),
('DN', 'Đà Nẵng', 2),
('HUE', 'Huế', 2),
('QN', 'Quảng Nam', 2),
('HCM', 'TP Hồ Chí Minh', 3),
('BD', 'Bình Dương', 3),
('CT', 'Cần Thơ', 3),
('VT', 'Vũng Tàu', 3);

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
('VIP', 'Khách hàng VIP', 10.00, 5000000),
('GOLD', 'Khách hàng Vàng', 7.00, 2000000),
('SILVER', 'Khách hàng Bạc', 5.00, 1000000),
('BRONZE', 'Khách hàng Đồng', 3.00, 500000),
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
('STAFF', 'Sales Staff', 'Nhân viên bán hàng - Bán hàng, thu ngân, xem kho'),
('MANAGER', 'Manager', 'Quản lý cửa hàng');

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

-- Manager (role_id=3) permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM subdim_permissions 
WHERE code NOT IN ('SYSTEM_CONFIG', 'USER_MANAGE');

-- =========================
-- DISCOUNT TYPES (từ Migration 001)
-- =========================
INSERT INTO subdim_discount_types (code, name, description) VALUES
    ('PERCENTAGE', 'Giảm theo %', 'Giảm giá theo phần trăm tổng đơn hàng'),
    ('FIXED_AMOUNT', 'Giảm cố định', 'Giảm một số tiền cố định'),
    ('BUY_X_GET_Y', 'Mua X tặng Y', 'Mua số lượng X được tặng Y'),
    ('FREE_SHIPPING', 'Miễn phí ship', 'Miễn phí vận chuyển');

-- =========================
-- CASHBOOK TYPES (từ Migration 002)
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
-- PAYMENT METHODS (từ Migration 002)
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
-- SHIPMENT STATUSES (từ Migration 003)
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
('HCM001', 'SuperMart Quận 1', 1, 7, '789 Đường Nguyễn Huệ, Quận 1, TP.HCM', '0281234567', 'Lê Văn Nam'),
('HCM002', 'MiniMart Quận 7', 2, 7, '321 Đường Nguyễn Thị Thập, Quận 7, TP.HCM', '0281234568', 'Phạm Văn Đức'),
('WH001', 'Kho Tổng TP.HCM', 3, 7, 'Khu công nghiệp Tân Bình, TP.HCM', '0281234569', 'Võ Hoàng Anh');

-- =========================
-- SUPPLIERS (8 nhà cung cấp)
-- =========================
INSERT INTO dim_suppliers (code, name, city_id, address, phone, email, tax_code, payment_terms) VALUES
('SUP001', 'Công ty TNHH Acecook Việt Nam', 1, 'KCN Thăng Long, Hà Nội', '0243567890', 'info@acecook.com.vn', '0123456789', 'Thanh toán trong 30 ngày'),
('SUP002', 'Công ty CP Masan Consumer', 7, 'Tòa nhà Masan, Quận 1, TP.HCM', '0283456789', 'sales@masan.com', '0123456790', 'Thanh toán trong 45 ngày'),
('SUP003', 'Công ty CP Sữa Việt Nam - Vinamilk', 7, '10 Tân Trào, Quận 7, TP.HCM', '0283345678', 'sales@vinamilk.com.vn', '0123456791', 'Thanh toán trong 30 ngày'),
('SUP004', 'Công ty TNHH Nước giải khát Coca-Cola', 7, 'Khu chế xuất Tân Thuận, TP.HCM', '0283234567', 'vn@coca-cola.com', '0123456792', 'Thanh toán ngay'),
('SUP005', 'Công ty CP Suntory PepsiCo', 7, 'Bình Dương', '0273123456', 'sales@pepsico.vn', '0123456793', 'Thanh toán trong 30 ngày'),
('SUP006', 'Công ty CP Kido', 7, 'Lô II-7, KCN Tân Bình, TP.HCM', '0283456123', 'kido@kido.com.vn', '0123456794', 'Thanh toán trong 60 ngày'),
('SUP007', 'Công ty TNHH Unilever Việt Nam', 7, '4 Phan Chu Trinh, Quận 1, TP.HCM', '0283567890', 'contact.vn@unilever.com', '0123456795', 'Thanh toán trong 45 ngày'),
('SUP008', 'Công ty TNHH Nestlé Việt Nam', 1, 'Tòa nhà Peakview, Hà Nội', '0243678901', 'info@vn.nestle.com', '0123456796', 'Thanh toán trong 30 ngày');

-- =========================
-- CUSTOMERS (25 khách hàng)
-- =========================
INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender) VALUES
('KH001', 'Nguyễn Văn An', '0901234567', 'nva@email.com', 3, 1, '12 Láng Hạ, Ba Đình, HN', '1985-03-15', 'Nam'),
('KH002', 'Trần Thị Bình', '0901234568', 'ttb@email.com', 2, 1, '34 Giảng Võ, Đống Đa, HN', '1990-07-22', 'Nữ'),
('KH003', 'Lê Văn Cường', '0901234569', 'lvc@email.com', 4, 7, '56 Lê Lợi, Quận 1, HCM', '1988-11-03', 'Nam'),
('KH004', 'Phạm Thị Dung', '0901234570', 'ptd@email.com', 1, 7, '78 Nguyễn Huệ, Quận 1, HCM', '1992-05-18', 'Nữ'),
('KH005', 'Hoàng Văn Em', '0901234571', 'hve@email.com', 5, 1, '90 Trần Duy Hưng, Cầu Giấy, HN', '1995-09-25', 'Nam'),
('KH006', 'Vũ Thị Phương', '0901234572', 'vtp@email.com', 3, 7, '12 Hai Bà Trưng, Quận 3, HCM', '1987-02-14', 'Nữ'),
('KH007', 'Đỗ Văn Giang', '0901234573', 'dvg@email.com', 2, 1, '34 Xã Đàn, Đống Đa, HN', '1991-06-30', 'Nam'),
('KH008', 'Bùi Thị Hoa', '0901234574', 'bth@email.com', 4, 7, '56 Lý Tự Trọng, Quận 1, HCM', '1989-12-08', 'Nữ'),
('KH009', 'Đinh Văn Ích', '0901234575', 'dvi@email.com', 5, 4, '78 Trần Phú, Hải Châu, Đà Nẵng', '1993-04-17', 'Nam'),
('KH010', 'Ngô Thị Kim', '0901234576', 'ntk@email.com', 3, 1, '90 Kim Mã, Ba Đình, HN', '1986-08-21', 'Nữ'),
('KH011', 'Cao Văn Long', '0901234577', 'cvl@email.com', 2, 7, '12 Pasteur, Quận 1, HCM', '1990-10-12', 'Nam'),
('KH012', 'Lý Thị Mai', '0901234578', 'ltm@email.com', 4, 1, '34 Nguyễn Chí Thanh, Đống Đa, HN', '1988-03-28', 'Nữ'),
('KH013', 'Phan Văn Nam', '0901234579', 'pvn@email.com', 5, 7, '56 Điện Biên Phủ, Quận 3, HCM', '1994-07-05', 'Nam'),
('KH014', 'Tạ Thị Oanh', '0901234580', 'tto@email.com', 1, 1, '78 Láng, Đống Đa, HN', '1992-11-19', 'Nữ'),
('KH015', 'Mai Văn Phú', '0901234581', 'mvp@email.com', 3, 7, '90 Võ Văn Tần, Quận 3, HCM', '1987-01-23', 'Nam'),
('KH016', 'Hồ Thị Quỳnh', '0901234582', 'htq@email.com', 2, 4, '12 Lê Duẩn, Hải Châu, Đà Nẵng', '1991-05-16', 'Nữ'),
('KH017', 'Trương Văn Sơn', '0901234583', 'tvs@email.com', 4, 1, '34 Tây Sơn, Đống Đa, HN', '1989-09-30', 'Nam'),
('KH018', 'Dương Thị Thúy', '0901234584', 'dtt@email.com', 5, 7, '56 Cách Mạng Tháng 8, Quận 10, HCM', '1993-02-07', 'Nữ'),
('KH019', 'Lương Văn Uy', '0901234585', 'lvu@email.com', 3, 1, '78 Ô Chợ Dừa, Đống Đa, HN', '1986-06-14', 'Nam'),
('KH020', 'Võ Thị Vân', '0901234586', 'vtv@email.com', 2, 7, '90 Nam Kỳ Khởi Nghĩa, Quận 1, HCM', '1990-10-27', 'Nữ'),
('KH021', 'Đặng Văn Xuân', '0901234587', 'dvx@email.com', 4, 4, '12 Bạch Đằng, Hải Châu, Đà Nẵng', '1988-12-03', 'Nam'),
('KH022', 'Chu Thị Yến', '0901234588', 'cty@email.com', 5, 1, '34 Tôn Đức Thắng, Đống Đa, HN', '1994-04-11', 'Nữ'),
('KH023', 'Huỳnh Văn Zung', '0901234589', 'hvz@email.com', 1, 7, '56 Nguyễn Thị Minh Khai, Quận 3, HCM', '1992-08-19', 'Nam'),
('KH024', 'Trịnh Thị Anh', '0901234590', 'tta@email.com', 3, 1, '78 Thái Hà, Đống Đa, HN', '1987-01-26', 'Nữ'),
('KH025', 'Tô Văn Bảo', '0901234591', 'tvb@email.com', 2, 7, '90 Trường Chinh, Quận Tân Bình, HCM', '1991-05-04', 'Nam');

-- =========================
-- PRODUCTS (49 sản phẩm)
-- =========================
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, has_variants) VALUES
-- Mì gói (5 sản phẩm)
('MIG001', 'Mì Hảo Hảo tôm chua cay', 11, 1, 1, 'Mì ăn liền vị tôm chua cay phổ biến', FALSE),
('MIG002', 'Mì Hảo Hảo sườn heo', 11, 1, 1, 'Mì ăn liền vị sườn heo thơm ngon', FALSE),
('MIG003', 'Mì Omachi xào bò', 11, 2, 1, 'Mì xào cao cấp vị bò', FALSE),
('MIG004', 'Mì Kokomi tôm', 11, 1, 1, 'Mì tôm ngon cho bữa sáng', FALSE),
('MIG005', 'Mì Asia gà', 11, 3, 1, 'Mì vị gà giá rẻ', FALSE),

-- Nước ngọt (7 sản phẩm)
('NGK001', 'Coca-Cola lon 330ml', 12, 4, 5, 'Nước giải khát có ga Coca-Cola', FALSE),
('NGK002', 'Coca-Cola chai 1.5L', 12, 4, 4, 'Nước giải khát có ga Coca-Cola chai lớn', FALSE),
('NGK003', 'Pepsi lon 330ml', 12, 5, 5, 'Nước giải khát có ga Pepsi', FALSE),
('NGK004', 'Pepsi chai 1.5L', 12, 5, 4, 'Nước giải khát có ga Pepsi chai lớn', FALSE),
('NGK005', 'Sting vàng 330ml', 12, 6, 5, 'Nước tăng lực Sting vàng', FALSE),
('NGK006', 'Sting đỏ 330ml', 12, 6, 5, 'Nước tăng lực Sting đỏ', FALSE),
('NGK007', 'Red Bull 250ml', 12, 7, 5, 'Nước tăng lực Red Bull chính hãng', FALSE),

-- Nước ép (3 sản phẩm)
('NEP001', 'Nước cam ép NutiFood 1L', 13, 8, 2, 'Nước cam ép 100% tự nhiên', FALSE),
('NEP002', 'Nước dứa ép NutiFood 1L', 13, 8, 2, 'Nước dứa ép 100% tự nhiên', FALSE),
('NEP003', 'Nước táo ép NutiFood 1L', 13, 8, 2, 'Nước táo ép 100% tự nhiên', FALSE),

-- Sữa (7 sản phẩm)
('SUA001', 'Sữa tươi Vinamilk hộp 1L', 14, 9, 2, 'Sữa tươi tiệt trùng không đường', FALSE),
('SUA002', 'Sữa tươi TH True Milk 1L', 14, 10, 2, 'Sữa tươi organic cao cấp', FALSE),
('SUA003', 'Sữa tươi Dutch Lady 1L', 14, 11, 2, 'Sữa tươi nhập khẩu cao cấp', FALSE),
('SUA004', 'Sữa chua uống Vinamilk 180ml', 15, 9, 2, 'Sữa chua uống có đường', FALSE),
('SUA005', 'Sữa chua ăn Vinamilk 100g', 15, 9, 1, 'Sữa chua ăn vị dâu', FALSE),
('SUA006', 'Sữa bột Vinamilk 400g', 24, 9, 2, 'Sữa bột cho người lớn', FALSE),
('SUA007', 'Sữa bột Dutch Lady 900g', 24, 11, 2, 'Sữa bột cho trẻ em cao cấp', FALSE),

-- Bánh kẹo (5 sản phẩm)
('BK001', 'Snack Oishi 40g', 16, 12, 1, 'Snack khoai tây Oishi nhiều vị', FALSE),
('BK002', 'Snack Lay''s 50g', 16, 13, 1, 'Snack khoai tây Lay''s cao cấp', FALSE),
('BK003', 'Bánh quy Oreo 137g', 16, 12, 1, 'Bánh quy kẹp kem Oreo', FALSE),
('BK004', 'Kẹo Alpenliebe 120g', 17, 12, 1, 'Kẹo mềm nhiều vị', FALSE),
('BK005', 'Kẹo Mentos 37g', 17, 12, 1, 'Kẹo bạc hà Mentos', FALSE),

-- Gia vị (8 sản phẩm)
('GV001', 'Nước mắm Nam Ngư 500ml', 18, 15, 4, 'Nước mắm truyền thống Phan Thiết', FALSE),
('GV002', 'Nước tương Chin-su 500ml', 18, 15, 4, 'Nước tương đậm đặc', FALSE),
('GV003', 'Tương ớt Chin-su 250g', 18, 15, 2, 'Tương ớt cay đặc biệt', FALSE),
('GV004', 'Dầu ăn Simply 1L', 19, 15, 4, 'Dầu ăn cao cấp từ đậu nành', FALSE),
('GV005', 'Hạt nêm Knorr 400g', 19, 16, 2, 'Hạt nêm từ thịt heo, xương', FALSE),
('GV006', 'Bột ngọt Ajinomoto 400g', 19, 16, 2, 'Bột ngọt chất lượng cao', FALSE),
('GV007', 'Muối I-ốt 500g', 19, 15, 1, 'Muối I-ốt tinh khiết', FALSE),
('GV008', 'Đường trắng 1kg', 19, 15, 1, 'Đường kính tinh luyện', FALSE),

-- Gia dụng (5 sản phẩm)
('GD001', 'Nước giặt OMO 3.8kg', 20, 17, 4, 'Nước giặt OMO đậm đặc', FALSE),
('GD002', 'Nước giặt Ariel 3.6kg', 20, 18, 4, 'Nước giặt Ariel giặt sạch vượt trội', FALSE),
('GD003', 'Nước rửa chén Sunlight 750g', 20, 17, 4, 'Nước rửa chén chanh', FALSE),
('GD004', 'Nước lau sàn Vim 1L', 20, 17, 4, 'Nước lau sàn kháng khuẩn', FALSE),
('GD005', 'Xà phòng Lifebuoy 90g', 21, 17, 10, 'Xà phòng diệt khuẩn', FALSE),

-- Cá nhân (6 sản phẩm)
('CN001', 'Dầu gội Clear 630ml', 22, 20, 4, 'Dầu gội sạch gàu nam', FALSE),
('CN002', 'Dầu gội Sunsilk 330ml', 22, 21, 4, 'Dầu gội mềm mượt tóc nữ', FALSE),
('CN003', 'Sữa tắm Dove 530g', 21, 19, 4, 'Sữa tắm dưỡng ẩm', FALSE),
('CN004', 'Kem đánh răng PS 230g', 21, 17, 10, 'Kem đánh răng bảo vệ nướu', FALSE),
('CN005', 'Bàn chải đánh răng PS', 21, 17, 10, 'Bàn chải lông mềm', FALSE),
('CN006', 'Khăn giấy Tempo hộp 100 tờ', 21, 12, 2, 'Khăn giấy mềm mịn', FALSE),

-- Cà phê (3 sản phẩm)
('CF001', 'Cà phê G7 3in1 hộp 16 gói', 2, 24, 2, 'Cà phê hòa tan 3in1 Trung Nguyên', FALSE),
('CF002', 'Cà phê Highlands hộp 14 gói', 2, 24, 2, 'Cà phê hòa tan cao cấp', FALSE),
('CF003', 'Cà phê Nescafe 3in1 hộp 20 gói', 2, 24, 2, 'Cà phê hòa tan Nestle', FALSE);

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
-- Hash: $2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK
-- =========================
INSERT INTO dim_users (username, email, password_hash, full_name, role_id, store_id, phone) VALUES
('admin', 'admin@minimart.com', '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Admin Hệ Thống', 1, 1, '0900000001'),
('staff_hn1', 'staff.hn1@minimart.com', '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Nguyễn Văn Minh', 2, 1, '0900000002'),
('staff_hn2', 'staff.hn2@minimart.com', '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Trần Thị Hoa', 2, 2, '0900000003'),
('staff_hcm1', 'staff.hcm1@minimart.com', '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Lê Văn Nam', 2, 3, '0900000004'),
('staff_hcm2', 'staff.hcm2@minimart.com', '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Phạm Văn Đức', 2, 4, '0900000005'),
('staff_wh', 'staff.wh@minimart.com', '$2a$12$qolE3BnwYKfJo/m/K1qad.V6TMq4.L2v2sqtw38RkIdo7D19XiuuK', 'Võ Hoàng Anh', 2, 5, '0900000006');

-- =========================
-- CARRIERS (từ Migration 003)
-- =========================
INSERT INTO dim_carriers (code, name, phone, tracking_url_template) VALUES
    ('INTERNAL', 'Giao hàng nội bộ', NULL, NULL),
    ('GHN', 'Giao Hàng Nhanh', '1900636336', 'https://donhang.ghn.vn/?order_code={tracking_code}'),
    ('GHTK', 'Giao Hàng Tiết Kiệm', '1900636886', 'https://i.ghtk.vn/{tracking_code}'),
    ('VNP', 'Viettel Post', '1900866868', 'https://viettelpost.com.vn/tra-cuu-hang-gui?tracking_code={tracking_code}'),
    ('JT', 'J&T Express', '1900158815', 'https://jtexpress.vn/track?bills={tracking_code}'),
    ('BEST', 'Best Express', '1900063630', 'https://bestexpress.vn/tracking/{tracking_code}');

-- =========================
-- BANK ACCOUNTS (từ Migration 004)
-- =========================
INSERT INTO dim_bank_accounts (account_name, account_number, bank_name, bank_code, branch, is_default, is_active, created_by)
VALUES 
    ('Siêu Thị Mini', '1234567890', 'Vietcombank', 'VCB', 'Chi nhánh Quận 1', TRUE, TRUE, 1),
    ('Siêu Thị Mini', '0987654321', 'Techcombank', 'TCB', 'Chi nhánh Quận 3', FALSE, TRUE, 1),
    ('Siêu Thị Mini', '5678901234', 'ACB', 'ACB', 'Chi nhánh Quận 7', FALSE, TRUE, 1);

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

-- =========================
-- DISCOUNTS (từ Migration 001)
-- =========================
INSERT INTO dim_discounts (code, name, description, discount_type_id, discount_value, max_discount_amount, min_order_amount, max_uses_total, start_date, end_date, created_by) VALUES
    ('SALE10', 'Giảm 10%', 'Giảm 10% cho đơn từ 200K', 1, 10, 50000, 200000, 1000, '2026-01-01', '2026-12-31', 1),
    ('WELCOME50', 'Chào mừng 50K', 'Giảm 50K cho khách mới', 2, 50000, NULL, 100000, 500, '2026-01-01', '2026-06-30', 1),
    ('FREESHIP', 'Miễn phí ship', 'Miễn phí ship đơn từ 300K', 4, 30000, NULL, 300000, NULL, '2026-01-01', '2026-12-31', 1);

-- =========================
-- INVENTORY STOCKS (5 stores x 49 variants)
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
-- ORDERS (150 đơn hàng trong tháng 1/2026)
-- =========================
DO $$
DECLARE
    i INT;
    order_date DATE;
    customer INT;
    store INT;
    staff INT;
    order_status VARCHAR(30);
    payment_status VARCHAR(30);
    order_id INT;
    num_items INT;
    j INT;
    variant INT;
    qty DECIMAL;
    price DECIMAL;
    order_subtotal DECIMAL;
    order_discount DECIMAL;
BEGIN
    FOR i IN 1..150 LOOP
        -- Random date in January 2026
        order_date := '2026-01-01'::date + (FLOOR(RANDOM() * 27))::int;
        
        -- 70% có customer, 30% không (khách lẻ)
        IF RANDOM() > 0.3 THEN
            customer := FLOOR(RANDOM() * 25 + 1)::int;
        ELSE
            customer := NULL;
        END IF;
        
        -- Random store (1-4)
        store := FLOOR(RANDOM() * 4 + 1)::int;
        
        -- Assign staff based on store
        CASE store
            WHEN 1 THEN staff := 2;
            WHEN 2 THEN staff := 3;
            WHEN 3 THEN staff := 4;
            WHEN 4 THEN staff := 5;
        END CASE;
        
        -- Order status
        IF RANDOM() > 0.1 THEN
            order_status := 'completed';
            payment_status := 'paid';
        ELSIF RANDOM() > 0.5 THEN
            order_status := 'pending';
            payment_status := 'unpaid';
        ELSE
            order_status := 'cancelled';
            payment_status := 'unpaid';
        END IF;
        
        -- Create order
        INSERT INTO fact_orders (order_code, date_key, customer_id, store_id, status, payment_status, 
                                 subtotal, discount_amount, final_amount, payment_method, created_by)
        VALUES (
            'DH' || LPAD(i::text, 6, '0'),
            order_date,
            customer,
            store,
            order_status,
            payment_status,
            0, 0, 0,
            CASE WHEN RANDOM() > 0.4 THEN 'cash' ELSE 'card' END,
            staff
        )
        RETURNING id INTO order_id;
        
        -- Add order items (1-5 items per order)
        num_items := FLOOR(RANDOM() * 5 + 1)::int;
        order_subtotal := 0;
        
        FOR j IN 1..num_items LOOP
            variant := FLOOR(RANDOM() * 49 + 1)::int;
            qty := FLOOR(RANDOM() * 5 + 1);
            
            SELECT selling_price INTO price 
            FROM dim_product_variants 
            WHERE id = variant;
            
            INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
            VALUES (order_id, variant, qty, price, 0);
            
            order_subtotal := order_subtotal + (qty * price);
        END LOOP;
        
        -- Apply discount
        IF customer IS NOT NULL AND RANDOM() > 0.7 THEN
            order_discount := FLOOR(order_subtotal * 0.05);
        ELSE
            order_discount := 0;
        END IF;
        
        -- Update order totals
        UPDATE fact_orders 
        SET subtotal = order_subtotal,
            discount_amount = order_discount,
            final_amount = order_subtotal - order_discount
        WHERE id = order_id;
    END LOOP;
END $$;

-- =========================
-- UPDATE CUSTOMER LIFETIME VALUE
-- =========================
UPDATE dim_customers c 
SET total_lifetime_value = COALESCE(
    (SELECT SUM(final_amount) 
     FROM fact_orders 
     WHERE customer_id = c.id AND status = 'completed'), 
    0
);

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
    RAISE NOTICE '   - Regions: 3';
    RAISE NOTICE '   - Cities: 10';
    RAISE NOTICE '   - Categories: 24';
    RAISE NOTICE '   - Brands: 24';
    RAISE NOTICE '   - Stores: 5';
    RAISE NOTICE '   - Suppliers: 8';
    RAISE NOTICE '   - Customers: 25';
    RAISE NOTICE '   - Products: 49';
    RAISE NOTICE '   - Product Variants: 49';
    RAISE NOTICE '   - Users: 6';
    RAISE NOTICE '   - Carriers: 6';
    RAISE NOTICE '   - Bank Accounts: 3';
    RAISE NOTICE '   - Discounts: 3';
    RAISE NOTICE '   - Inventory Stocks: 245 (5 stores x 49 variants)';
    RAISE NOTICE '   - Orders: 150';
    RAISE NOTICE '   - Time dimension: 2025-2027 (1096 days)';
END $$;
