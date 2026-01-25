-- =====================================================
-- SEED DATA FULL FOR MINIMART DATABASE
-- Dữ liệu mẫu đầy đủ cho hệ thống siêu thị mini
-- =====================================================

-- Xóa dữ liệu cũ (theo thứ tự FK)
TRUNCATE TABLE fact_order_items CASCADE;
TRUNCATE TABLE fact_orders CASCADE;
TRUNCATE TABLE fact_inventory_transactions CASCADE;
TRUNCATE TABLE fact_inventory_stocks CASCADE;
TRUNCATE TABLE dim_product_variants CASCADE;
TRUNCATE TABLE dim_products CASCADE;
TRUNCATE TABLE dim_users CASCADE;
TRUNCATE TABLE dim_customers CASCADE;
TRUNCATE TABLE dim_suppliers CASCADE;
TRUNCATE TABLE dim_stores CASCADE;
TRUNCATE TABLE dim_time CASCADE;
TRUNCATE TABLE role_permissions CASCADE;
TRUNCATE TABLE subdim_permissions CASCADE;
TRUNCATE TABLE subdim_roles CASCADE;
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
ALTER SEQUENCE dim_stores_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_suppliers_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_customers_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_products_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_product_variants_id_seq RESTART WITH 1;
ALTER SEQUENCE dim_users_id_seq RESTART WITH 1;
ALTER SEQUENCE fact_inventory_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE fact_orders_id_seq RESTART WITH 1;
ALTER SEQUENCE fact_order_items_id_seq RESTART WITH 1;

-- =========================
-- REGIONS (3 miền)
-- =========================
INSERT INTO subdim_regions (code, name, description) VALUES
('MB', 'Miền Bắc', 'Các tỉnh thành phía Bắc'),
('MT', 'Miền Trung', 'Các tỉnh thành miền Trung'),
('MN', 'Miền Nam', 'Các tỉnh thành phía Nam');

-- =========================
-- CITIES (10 thành phố)
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
-- CATEGORIES (15 danh mục)
-- =========================
INSERT INTO subdim_categories (code, name, parent_id, level, path) VALUES
('FOOD', 'Thực phẩm', NULL, 0, '/1'),
('DRINK', 'Đồ uống', NULL, 0, '/2'),
('SNACK', 'Bánh kẹo', NULL, 0, '/3'),
('DAIRY', 'Sữa & Sản phẩm từ sữa', NULL, 0, '/4'),
('FROZEN', 'Thực phẩm đông lạnh', NULL, 0, '/5'),
('FRESH', 'Thực phẩm tươi sống', NULL, 0, '/6'),
('SEASONING', 'Gia vị', NULL, 0, '/7'),
('HOUSEHOLD', 'Đồ gia dụng', NULL, 0, '/8'),
('PERSONAL', 'Chăm sóc cá nhân', NULL, 0, '/9'),
('BABY', 'Đồ dùng em bé', NULL, 0, '/10'),
-- Danh mục con
('INSTANT', 'Mì gói & Cháo', 1, 1, '/1/11'),
('SOFT_DRINK', 'Nước ngọt', 2, 1, '/2/12'),
('JUICE', 'Nước ép trái cây', 2, 1, '/2/13'),
('CHOCOLATE', 'Sô cô la', 3, 1, '/3/14'),
('COOKIES', 'Bánh quy', 3, 1, '/3/15');

-- =========================
-- BRANDS (20 thương hiệu)
-- =========================
INSERT INTO subdim_brands (code, name, origin_country, description) VALUES
('VINAMILK', 'Vinamilk', 'Vietnam', 'Công ty sữa hàng đầu Việt Nam'),
('COCACOLA', 'Coca Cola', 'USA', 'Thương hiệu nước giải khát toàn cầu'),
('PEPSI', 'Pepsi', 'USA', 'Thương hiệu nước giải khát'),
('ACECOOK', 'Acecook', 'Japan', 'Mì gói, phở gói'),
('MASAN', 'Masan', 'Vietnam', 'Thực phẩm tiêu dùng'),
('UNILEVER', 'Unilever', 'UK', 'Hàng tiêu dùng'),
('P&G', 'P&G', 'USA', 'Hàng tiêu dùng'),
('NESTLE', 'Nestle', 'Switzerland', 'Thực phẩm và đồ uống'),
('ORION', 'Orion', 'Korea', 'Bánh kẹo'),
('KINH_DO', 'Kinh Đô', 'Vietnam', 'Bánh kẹo'),
('TH_TRUEMILK', 'TH True Milk', 'Vietnam', 'Sữa tươi sạch'),
('DUTCH_LADY', 'Dutch Lady', 'Netherlands', 'Sản phẩm sữa'),
('CHIN_SU', 'Chin-su', 'Vietnam', 'Gia vị'),
('AJINOMOTO', 'Ajinomoto', 'Japan', 'Bột ngọt, gia vị'),
('COLGATE', 'Colgate', 'USA', 'Chăm sóc răng miệng'),
('SUNSILK', 'Sunsilk', 'UK', 'Chăm sóc tóc'),
('OMO', 'OMO', 'UK', 'Bột giặt'),
('COMFORT', 'Comfort', 'UK', 'Nước xả vải'),
('HIGHLAND', 'Highlands Coffee', 'Vietnam', 'Cà phê'),
('TRUNG_NGUYEN', 'Trung Nguyên', 'Vietnam', 'Cà phê');

-- =========================
-- UNITS (8 đơn vị tính)
-- =========================
INSERT INTO subdim_units (code, name, base_unit) VALUES
('PCS', 'Cái', TRUE),
('BOX', 'Thùng', FALSE),
('KG', 'Kg', TRUE),
('G', 'Gram', FALSE),
('L', 'Lít', TRUE),
('ML', 'ML', FALSE),
('PACK', 'Gói', FALSE),
('BOTTLE', 'Chai', FALSE);

-- =========================
-- CUSTOMER GROUPS (5 nhóm)
-- =========================
INSERT INTO subdim_customer_groups (code, name, discount_percentage, min_purchase_amount) VALUES
('NORMAL', 'Khách thường', 0, 0),
('SILVER', 'Khách bạc', 3, 1000000),
('GOLD', 'Khách vàng', 5, 5000000),
('PLATINUM', 'Khách bạch kim', 8, 10000000),
('VIP', 'Khách VIP', 10, 20000000);

-- =========================
-- STORE TYPES (3 loại)
-- =========================
INSERT INTO subdim_store_types (code, name) VALUES
('RETAIL', 'Cửa hàng bán lẻ'),
('WAREHOUSE', 'Kho trung tâm'),
('MINI', 'Cửa hàng tiện lợi');

-- =========================
-- TRANSACTION TYPES (6 loại)
-- =========================
INSERT INTO subdim_transaction_types (code, name, affects_stock) VALUES
('PURCHASE', 'Nhập hàng từ NCC', 1),
('SALE', 'Bán hàng', -1),
('RETURN_IN', 'Khách trả hàng', 1),
('RETURN_OUT', 'Trả hàng NCC', -1),
('TRANSFER_IN', 'Chuyển kho vào', 1),
('TRANSFER_OUT', 'Chuyển kho ra', -1),
('ADJUSTMENT', 'Điều chỉnh tồn', 0);

-- =========================
-- ROLES (4 vai trò)
-- =========================
INSERT INTO subdim_roles (code, name, description) VALUES
('ADMIN', 'Quản trị viên', 'Toàn quyền hệ thống'),
('MANAGER', 'Quản lý cửa hàng', 'Quản lý cửa hàng'),
('STAFF', 'Nhân viên bán hàng', 'Bán hàng, xem báo cáo cơ bản'),
('WAREHOUSE', 'Nhân viên kho', 'Quản lý kho');

-- =========================
-- PERMISSIONS (12 quyền)
-- =========================
INSERT INTO subdim_permissions (code, name, resource, action) VALUES
('products:create', 'Thêm sản phẩm', 'products', 'create'),
('products:read', 'Xem sản phẩm', 'products', 'read'),
('products:update', 'Sửa sản phẩm', 'products', 'update'),
('products:delete', 'Xóa sản phẩm', 'products', 'delete'),
('orders:create', 'Tạo đơn hàng', 'orders', 'create'),
('orders:read', 'Xem đơn hàng', 'orders', 'read'),
('orders:update', 'Sửa đơn hàng', 'orders', 'update'),
('inventory:read', 'Xem tồn kho', 'inventory', 'read'),
('inventory:update', 'Cập nhật tồn kho', 'inventory', 'update'),
('reports:read', 'Xem báo cáo', 'reports', 'read'),
('staff:manage', 'Quản lý nhân viên', 'staff', 'manage'),
('settings:manage', 'Quản lý cài đặt', 'settings', 'manage');

-- =========================
-- ROLE PERMISSIONS
-- =========================
-- Admin có tất cả quyền
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM subdim_permissions;

-- Manager
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10);

-- Staff
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 2), (3, 5), (3, 6), (3, 8);

-- Warehouse
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, 2), (4, 8), (4, 9);

-- =========================
-- STORES (5 cửa hàng)
-- =========================
INSERT INTO dim_stores (code, name, store_type_id, city_id, address, phone, manager_name) VALUES
('STORE_HN1', 'MiniMart Cầu Giấy', 1, 1, '123 Trần Duy Hưng, Cầu Giấy', '0243111222', 'Nguyễn Văn Minh'),
('STORE_HN2', 'MiniMart Thanh Xuân', 1, 1, '456 Nguyễn Trãi, Thanh Xuân', '0243222333', 'Trần Thị Hoa'),
('STORE_HCM1', 'MiniMart Quận 1', 1, 7, '789 Nguyễn Huệ, Quận 1', '0283444555', 'Lê Văn Nam'),
('STORE_HCM2', 'MiniMart Quận 7', 3, 7, '321 Nguyễn Thị Thập, Quận 7', '0283555666', 'Phạm Thị Mai'),
('WH_HCM', 'Kho Tổng HCM', 2, 8, 'Lô A1 KCN Tân Bình', '0283666777', 'Võ Hoàng Anh');

-- =========================
-- SUPPLIERS (10 nhà cung cấp)
-- =========================
INSERT INTO dim_suppliers (code, name, city_id, address, phone, email, tax_code, payment_terms) VALUES
('SUP001', 'Công ty TNHH Vinamilk', 7, '10 Tân Trào, Quận 7', '0283123456', 'sales@vinamilk.com', '0300588569', 'Net 30'),
('SUP002', 'Coca Cola Việt Nam', 7, 'KCN Long Thành', '0283234567', 'order@cocacola.vn', '0300123456', 'Net 15'),
('SUP003', 'Acecook Việt Nam', 7, 'KCN Biên Hòa', '0283345678', 'sales@acecook.vn', '0300234567', 'Net 30'),
('SUP004', 'Masan Consumer', 7, '60-62 Trần Hưng Đạo, Q1', '0283456789', 'order@masan.com', '0300345678', 'Net 45'),
('SUP005', 'Unilever Việt Nam', 7, 'KCN Củ Chi', '0283567890', 'supply@unilever.vn', '0300456789', 'Net 30'),
('SUP006', 'Nestle Việt Nam', 8, 'KCN VSIP Bình Dương', '0274123456', 'order@nestle.vn', '0300567890', 'Net 30'),
('SUP007', 'Orion Vina', 8, 'KCN Mỹ Phước', '0274234567', 'sales@orion.vn', '0300678901', 'Net 15'),
('SUP008', 'Kinh Đô', 7, ''||CHR(39)||'138 Hai Bà Trưng, Q1', '0283678901', 'order@kinhdo.vn', '0300789012', 'Net 30'),
('SUP009', 'TH True Milk', 1, 'Nghệ An', '0243789012', 'order@thtruemilk.vn', '0300890123', 'Net 15'),
('SUP010', 'Ajinomoto Việt Nam', 8, 'KCN Biên Hòa 2', '0274345678', 'sales@ajinomoto.vn', '0300901234', 'Net 30');

-- =========================
-- CUSTOMERS (25 khách hàng)
-- =========================
INSERT INTO dim_customers (code, full_name, phone, email, customer_group_id, city_id, address, date_of_birth, gender) VALUES
('CUS001', 'Nguyễn Văn An', '0901234001', 'an.nguyen@email.com', 1, 1, '12 Láng Hạ, Đống Đa', '1985-03-15', 'Nam'),
('CUS002', 'Trần Thị Bình', '0901234002', 'binh.tran@email.com', 2, 1, '45 Kim Mã, Ba Đình', '1990-07-22', 'Nữ'),
('CUS003', 'Lê Hoàng Cường', '0901234003', 'cuong.le@email.com', 3, 7, '78 Lê Lợi, Quận 1', '1982-11-08', 'Nam'),
('CUS004', 'Phạm Thị Dung', '0901234004', 'dung.pham@email.com', 4, 7, '234 Nguyễn Văn Linh, Q7', '1995-01-30', 'Nữ'),
('CUS005', 'Hoàng Văn Em', '0901234005', 'em.hoang@email.com', 5, 4, '56 Bạch Đằng, Hải Châu', '1988-09-12', 'Nam'),
('CUS006', 'Vũ Thị Phương', '0901234006', 'phuong.vu@email.com', 1, 1, '89 Thái Hà, Đống Đa', '1992-04-18', 'Nữ'),
('CUS007', 'Đặng Văn Giang', '0901234007', 'giang.dang@email.com', 2, 7, '123 Điện Biên Phủ, Q3', '1987-12-25', 'Nam'),
('CUS008', 'Ngô Thị Hạnh', '0901234008', 'hanh.ngo@email.com', 3, 8, '456 Đại lộ Bình Dương', '1993-06-05', 'Nữ'),
('CUS009', 'Bùi Văn Ích', '0901234009', 'ich.bui@email.com', 1, 1, '78 Cầu Giấy', '1980-08-14', 'Nam'),
('CUS010', 'Đỗ Thị Kim', '0901234010', 'kim.do@email.com', 2, 7, '90 Pasteur, Q1', '1996-02-28', 'Nữ'),
('CUS011', 'Trịnh Văn Long', '0901234011', 'long.trinh@email.com', 1, 4, '12 Nguyễn Văn Linh', '1984-05-20', 'Nam'),
('CUS012', 'Lý Thị Mến', '0901234012', 'men.ly@email.com', 3, 7, '345 Lý Thường Kiệt, Q10', '1991-10-10', 'Nữ'),
('CUS013', 'Cao Văn Nghĩa', '0901234013', 'nghia.cao@email.com', 1, 1, '67 Hoàng Hoa Thám', '1989-07-07', 'Nam'),
('CUS014', 'Mai Thị Oanh', '0901234014', 'oanh.mai@email.com', 2, 9, '89 Nguyễn Văn Cừ, Ninh Kiều', '1994-03-03', 'Nữ'),
('CUS015', 'Phan Văn Phúc', '0901234015', 'phuc.phan@email.com', 4, 7, '12 Trần Hưng Đạo, Q5', '1986-11-11', 'Nam'),
('CUS016', 'Đinh Thị Quỳnh', '0901234016', 'quynh.dinh@email.com', 1, 1, '34 Giải Phóng', '1997-09-09', 'Nữ'),
('CUS017', 'Hồ Văn Rạng', '0901234017', 'rang.ho@email.com', 1, 4, '56 Hùng Vương', '1983-04-04', 'Nam'),
('CUS018', 'Tô Thị Sương', '0901234018', 'suong.to@email.com', 2, 7, '78 Võ Văn Tần, Q3', '1990-12-12', 'Nữ'),
('CUS019', 'Lâm Văn Tài', '0901234019', 'tai.lam@email.com', 3, 8, '90 Mỹ Phước', '1988-06-06', 'Nam'),
('CUS020', 'Châu Thị Uyên', '0901234020', 'uyen.chau@email.com', 1, 1, '12 Thanh Xuân', '1995-08-08', 'Nữ'),
('CUS021', 'Dương Văn Vinh', '0901234021', 'vinh.duong@email.com', 2, 7, '34 Lê Văn Sỹ, Q3', '1982-01-01', 'Nam'),
('CUS022', 'Âu Thị Xuyến', '0901234022', 'xuyen.au@email.com', 1, 4, '56 Trần Phú', '1993-10-10', 'Nữ'),
('CUS023', 'Thái Văn Yên', '0901234023', 'yen.thai@email.com', 1, 10, '78 Bãi Sau', '1987-02-02', 'Nam'),
('CUS024', 'Kiều Thị Zara', '0901234024', 'zara.kieu@email.com', 5, 7, '90 Nguyễn Đình Chiểu, Q1', '1992-05-05', 'Nữ'),
('CUS025', 'Mạc Văn Khải', '0901234025', 'khai.mac@email.com', 1, 1, '123 Trường Chinh', '1985-07-07', 'Nam');

-- =========================
-- PRODUCTS (50 sản phẩm)
-- =========================
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, description, has_variants) VALUES
-- Thực phẩm - Mì gói
('MIG001', 'Mì Hảo Hảo tôm chua cay', 11, 4, 7, 'Mì ăn liền vị tôm chua cay 75g', FALSE),
('MIG002', 'Mì Hảo Hảo sườn heo', 11, 4, 7, 'Mì ăn liền vị sườn heo 75g', FALSE),
('MIG003', 'Mì Omachi xốt Spaghetti', 11, 5, 7, 'Mì khoai tây xốt Spaghetti 91g', FALSE),
('MIG004', 'Mì Kokomi đại tôm chua cay', 11, 5, 7, 'Mì đại 90g', FALSE),
('MIG005', 'Phở bò Vifon', 11, 5, 7, 'Phở ăn liền vị bò 65g', FALSE),

-- Đồ uống - Nước ngọt
('NGK001', 'Coca Cola lon 330ml', 12, 2, 1, 'Nước ngọt có gas', FALSE),
('NGK002', 'Coca Cola chai 1.5L', 12, 2, 8, 'Nước ngọt có gas', FALSE),
('NGK003', 'Pepsi lon 330ml', 12, 3, 1, 'Nước ngọt có gas', FALSE),
('NGK004', 'Pepsi chai 1.5L', 12, 3, 8, 'Nước ngọt có gas', FALSE),
('NGK005', 'Sprite lon 330ml', 12, 2, 1, 'Nước ngọt vị chanh', FALSE),
('NGK006', 'Fanta cam lon 330ml', 12, 2, 1, 'Nước ngọt vị cam', FALSE),
('NGK007', '7Up lon 330ml', 12, 3, 1, 'Nước ngọt vị chanh', FALSE),

-- Đồ uống - Nước ép
('NEP001', 'Nước cam ép TH 1L', 13, 11, 8, 'Nước cam ép nguyên chất', FALSE),
('NEP002', 'Nước táo ép TH 1L', 13, 11, 8, 'Nước táo ép nguyên chất', FALSE),
('NEP003', 'Nước ép xoài Vfresh 1L', 13, 1, 8, 'Nước ép xoài', FALSE),

-- Sữa
('SUA001', 'Sữa tươi Vinamilk 1L không đường', 4, 1, 8, 'Sữa tươi tiệt trùng', FALSE),
('SUA002', 'Sữa tươi Vinamilk 1L có đường', 4, 1, 8, 'Sữa tươi tiệt trùng', FALSE),
('SUA003', 'Sữa tươi TH True Milk 1L', 4, 11, 8, 'Sữa tươi sạch', FALSE),
('SUA004', 'Sữa chua Vinamilk hộp 100g', 4, 1, 1, 'Sữa chua ăn', FALSE),
('SUA005', 'Sữa chua TH True Yogurt 100g', 4, 11, 1, 'Sữa chua', FALSE),
('SUA006', 'Sữa đặc Ông Thọ 380g', 4, 1, 1, 'Sữa đặc có đường', FALSE),
('SUA007', 'Phô mai con bò cười 8 miếng', 4, 8, 1, 'Phô mai', FALSE),

-- Bánh kẹo
('BK001', 'Bánh Oreo socola 137g', 15, 9, 1, 'Bánh quy nhân kem', FALSE),
('BK002', 'Bánh Chocopie 12 cái', 14, 9, 1, 'Bánh phủ socola', FALSE),
('BK003', 'Bánh AFC lúa mì 200g', 15, 10, 1, 'Bánh quy giòn', FALSE),
('BK004', 'Kẹo Alpenliebe hộp', 14, 8, 1, 'Kẹo caramen', FALSE),
('BK005', 'Socola Dairy Milk 40g', 14, 8, 1, 'Socola sữa', FALSE),

-- Gia vị
('GV001', 'Nước mắm Nam Ngư 500ml', 7, 5, 8, 'Nước mắm', FALSE),
('GV002', 'Nước mắm Chinsu 500ml', 7, 13, 8, 'Nước mắm', FALSE),
('GV003', 'Bột ngọt Ajinomoto 454g', 7, 14, 7, 'Bột ngọt', FALSE),
('GV004', 'Hạt nêm Knorr 900g', 7, 6, 7, 'Hạt nêm thịt thăn', FALSE),
('GV005', 'Dầu ăn Tường An 1L', 7, 5, 8, 'Dầu thực vật', FALSE),
('GV006', 'Dầu ăn Neptune 1L', 7, 6, 8, 'Dầu thực vật', FALSE),
('GV007', 'Tương ớt Chinsu 250g', 7, 13, 8, 'Tương ớt', FALSE),
('GV008', 'Xì dầu Maggi 300ml', 7, 8, 8, 'Nước tương', FALSE),

-- Đồ gia dụng
('GD001', 'Bột giặt OMO 3kg', 8, 17, 7, 'Bột giặt', FALSE),
('GD002', 'Nước xả Comfort 3.8L', 8, 18, 8, 'Nước xả vải', FALSE),
('GD003', 'Nước rửa chén Sunlight 750ml', 8, 6, 8, 'Nước rửa chén', FALSE),
('GD004', 'Giấy vệ sinh Pulppy 12 cuộn', 8, 6, 7, 'Giấy vệ sinh', FALSE),
('GD005', 'Khăn giấy Tempo 100 tờ', 8, 6, 7, 'Khăn giấy', FALSE),

-- Chăm sóc cá nhân
('CN001', 'Kem đánh răng Colgate 225g', 9, 15, 1, 'Kem đánh răng', FALSE),
('CN002', 'Bàn chải đánh răng Colgate', 9, 15, 1, 'Bàn chải', FALSE),
('CN003', 'Dầu gội Sunsilk 640ml', 9, 16, 8, 'Dầu gội', FALSE),
('CN004', 'Dầu xả Sunsilk 320ml', 9, 16, 8, 'Dầu xả', FALSE),
('CN005', 'Sữa tắm Dove 500ml', 9, 6, 8, 'Sữa tắm', FALSE),
('CN006', 'Xà phòng Lifebuoy 4x90g', 9, 6, 7, 'Xà phòng cục', FALSE),

-- Cà phê
('CF001', 'Cà phê Highlands 200g', 2, 19, 7, 'Cà phê rang xay', FALSE),
('CF002', 'Cà phê G7 3in1 hộp 20 gói', 2, 20, 1, 'Cà phê hòa tan', FALSE),
('CF003', 'Cà phê Nescafe 3in1 hộp 20 gói', 2, 8, 1, 'Cà phê hòa tan', FALSE);

-- =========================
-- PRODUCT VARIANTS (50 variants - mỗi sản phẩm 1 variant)
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
-- USERS (10 người dùng)
-- Password: admin123 -> bcrypt hash
-- =========================
INSERT INTO dim_users (username, email, password_hash, full_name, role_id, store_id, phone) VALUES
('admin', 'admin@minimart.com', '$2a$10$8K1p/a0dR1xqM8K3hxmYLe1i8z1lxYgCK0m1O5E.3Z5E1C5K1L5I6', 'Admin Hệ Thống', 1, 1, '0900000001'),
('manager_hn1', 'manager.hn1@minimart.com', '$2a$10$8K1p/a0dR1xqM8K3hxmYLe1i8z1lxYgCK0m1O5E.3Z5E1C5K1L5I6', 'Nguyễn Văn Minh', 2, 1, '0900000002'),
('manager_hn2', 'manager.hn2@minimart.com', '$2a$10$8K1p/a0dR1xqM8K3hxmYLe1i8z1lxYgCK0m1O5E.3Z5E1C5K1L5I6', 'Trần Thị Hoa', 2, 2, '0900000003'),
('manager_hcm', 'manager.hcm@minimart.com', '$2a$10$8K1p/a0dR1xqM8K3hxmYLe1i8z1lxYgCK0m1O5E.3Z5E1C5K1L5I6', 'Lê Văn Nam', 2, 3, '0900000004'),
('staff_hn1', 'staff.hn1@minimart.com', '$2a$10$8K1p/a0dR1xqM8K3hxmYLe1i8z1lxYgCK0m1O5E.3Z5E1C5K1L5I6', 'Phạm Thị Lan', 3, 1, '0900000005'),
('staff_hn2', 'staff.hn2@minimart.com', '$2a$10$8K1p/a0dR1xqM8K3hxmYLe1i8z1lxYgCK0m1O5E.3Z5E1C5K1L5I6', 'Hoàng Văn Tùng', 3, 2, '0900000006'),
('staff_hcm1', 'staff.hcm1@minimart.com', '$2a$10$8K1p/a0dR1xqM8K3hxmYLe1i8z1lxYgCK0m1O5E.3Z5E1C5K1L5I6', 'Vũ Thị Mai', 3, 3, '0900000007'),
('staff_hcm2', 'staff.hcm2@minimart.com', '$2a$10$8K1p/a0dR1xqM8K3hxmYLe1i8z1lxYgCK0m1O5E.3Z5E1C5K1L5I6', 'Đặng Văn Khoa', 3, 4, '0900000008'),
('warehouse_hcm', 'warehouse.hcm@minimart.com', '$2a$10$8K1p/a0dR1xqM8K3hxmYLe1i8z1lxYgCK0m1O5E.3Z5E1C5K1L5I6', 'Võ Hoàng Anh', 4, 5, '0900000009'),
('warehouse_hn', 'warehouse.hn@minimart.com', '$2a$10$8K1p/a0dR1xqM8K3hxmYLe1i8z1lxYgCK0m1O5E.3Z5E1C5K1L5I6', 'Ngô Văn Bình', 4, 1, '0900000010');

-- =========================
-- DIM_TIME (Năm 2025-2026)
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
FROM generate_series('2025-01-01'::date, '2026-12-31'::date, '1 day'::interval) d;

-- =========================
-- INVENTORY STOCKS (Tồn kho cho tất cả sản phẩm ở các cửa hàng)
-- =========================
-- Store 1 (HN1)
INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 1, id, 
    FLOOR(RANDOM() * 200 + 50)::int, -- 50-250 units
    20,
    300
FROM dim_product_variants WHERE id <= 49;

-- Store 2 (HN2)
INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 2, id, 
    FLOOR(RANDOM() * 150 + 30)::int, -- 30-180 units
    15,
    200
FROM dim_product_variants WHERE id <= 49;

-- Store 3 (HCM1)
INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 3, id, 
    FLOOR(RANDOM() * 250 + 80)::int, -- 80-330 units
    25,
    400
FROM dim_product_variants WHERE id <= 49;

-- Store 4 (HCM2 - mini store)
INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 4, id, 
    FLOOR(RANDOM() * 100 + 20)::int, -- 20-120 units
    10,
    150
FROM dim_product_variants WHERE id <= 49;

-- Store 5 (Warehouse - số lượng lớn)
INSERT INTO fact_inventory_stocks (store_id, variant_id, quantity_on_hand, min_stock_level, max_stock_level)
SELECT 5, id, 
    FLOOR(RANDOM() * 1000 + 500)::int, -- 500-1500 units
    100,
    2000
FROM dim_product_variants WHERE id <= 49;

-- =========================
-- FACT_ORDERS (150 đơn hàng trong tháng 1/2026)
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
        -- Random ngày trong tháng 1/2026
        order_date := '2026-01-01'::date + (FLOOR(RANDOM() * 25))::int;
        
        -- Random customer (1-25) hoặc NULL (khách vãng lai)
        IF RANDOM() > 0.3 THEN
            customer := FLOOR(RANDOM() * 25 + 1)::int;
        ELSE
            customer := NULL;
        END IF;
        
        -- Random store (1-4, không tính kho)
        store := FLOOR(RANDOM() * 4 + 1)::int;
        
        -- Staff theo store
        CASE store
            WHEN 1 THEN staff := 5;
            WHEN 2 THEN staff := 6;
            WHEN 3 THEN staff := 7;
            WHEN 4 THEN staff := 8;
        END CASE;
        
        -- Random status
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
        
        -- Tạo order
        INSERT INTO fact_orders (
            order_code, date_key, customer_id, store_id, status, payment_status,
            subtotal, discount_amount, final_amount, payment_method, created_by
        ) VALUES (
            'DH' || LPAD(i::text, 6, '0'),
            order_date,
            customer,
            store,
            order_status,
            payment_status,
            0, 0, 0,
            CASE WHEN RANDOM() > 0.4 THEN 'cash' ELSE 'card' END,
            staff
        ) RETURNING id INTO order_id;
        
        -- Random số items (1-5)
        num_items := FLOOR(RANDOM() * 5 + 1)::int;
        order_subtotal := 0;
        
        FOR j IN 1..num_items LOOP
            -- Random variant
            variant := FLOOR(RANDOM() * 49 + 1)::int;
            qty := FLOOR(RANDOM() * 5 + 1);
            
            SELECT selling_price INTO price FROM dim_product_variants WHERE id = variant;
            
            -- Insert order item
            INSERT INTO fact_order_items (order_id, variant_id, quantity, unit_price, discount_per_item)
            VALUES (order_id, variant, qty, price, 0);
            
            order_subtotal := order_subtotal + (qty * price);
        END LOOP;
        
        -- Random discount
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
-- Cập nhật total_lifetime_value cho customers
-- =========================
UPDATE dim_customers c
SET total_lifetime_value = COALESCE((
    SELECT SUM(final_amount) 
    FROM fact_orders 
    WHERE customer_id = c.id AND status = 'completed'
), 0);

-- =========================
-- THÔNG BÁO HOÀN THÀNH
-- =========================
DO $$
BEGIN
    RAISE NOTICE 'Seed data completed successfully!';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '- Regions: 3';
    RAISE NOTICE '- Cities: 10';
    RAISE NOTICE '- Categories: 15';
    RAISE NOTICE '- Brands: 20';
    RAISE NOTICE '- Products: 49';
    RAISE NOTICE '- Customers: 25';
    RAISE NOTICE '- Suppliers: 10';
    RAISE NOTICE '- Stores: 5';
    RAISE NOTICE '- Users: 10';
    RAISE NOTICE '- Orders: 150';
    RAISE NOTICE '- Inventory Stocks: 245 records';
END $$;
