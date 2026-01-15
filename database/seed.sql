-- =====================================================
-- SEED DATA FOR MINIMART DATABASE
-- =====================================================

-- =========================
-- ROLES
-- =========================
INSERT INTO subdim_roles (code, name) VALUES
('ADMIN', 'Administrator'),
('STAFF', 'Staff'),
('WAREHOUSE', 'Warehouse Staff');

-- =========================
-- PERMISSIONS
-- =========================
INSERT INTO subdim_permissions (code, name, resource, action) VALUES
('products:create', 'Create Product', 'products', 'create'),
('products:read', 'Read Product', 'products', 'read'),
('products:update', 'Update Product', 'products', 'update'),
('orders:create', 'Create Order', 'orders', 'create'),
('orders:read', 'Read Order', 'orders', 'read'),
('inventory:update', 'Update Inventory', 'inventory', 'update');

-- =========================
-- ROLE - PERMISSIONS
-- =========================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM subdim_roles r, subdim_permissions p
WHERE r.code = 'ADMIN';

-- =========================
-- REGIONS
-- =========================
INSERT INTO subdim_regions (code, name) VALUES
('MB', 'Miền Bắc'),
('MT', 'Miền Trung'),
('MN', 'Miền Nam');

-- =========================
-- CITIES
-- =========================
INSERT INTO subdim_cities (code, name, region_id) VALUES
('HN', 'Hà Nội', 1),
('DN', 'Đà Nẵng', 2),
('HCM', 'TP Hồ Chí Minh', 3);

-- =========================
-- STORE TYPES
-- =========================
INSERT INTO subdim_store_types (code, name) VALUES
('RETAIL', 'Retail Store'),
('WAREHOUSE', 'Central Warehouse');

-- =========================
-- STORES
-- =========================
INSERT INTO dim_stores (code, name, store_type_id, city_id, address) VALUES
('STORE_HN', 'MiniMart Hà Nội', 1, 1, '123 Trần Duy Hưng'),
('STORE_HCM', 'MiniMart Hồ Chí Minh', 1, 3, '456 Nguyễn Huệ'),
('WH_HCM', 'Kho Tổng HCM', 2, 3, 'KCN Tân Bình');

-- =========================
-- CUSTOMER GROUPS
-- =========================
INSERT INTO subdim_customer_groups (code, name, discount_percentage) VALUES
('NORMAL', 'Khách thường', 0),
('VIP', 'Khách VIP', 5);

-- =========================
-- CUSTOMERS
-- =========================
INSERT INTO dim_customers (code, full_name, phone, customer_group_id, city_id) VALUES
('CUS001', 'Nguyễn Văn A', '0900000001', 1, 1),
('CUS002', 'Trần Thị B', '0900000002', 2, 3);

-- =========================
-- BRANDS
-- =========================
INSERT INTO subdim_brands (code, name, origin_country) VALUES
('VINAMILK', 'Vinamilk', 'Vietnam'),
('COCACOLA', 'Coca Cola', 'USA');

-- =========================
-- UNITS
-- =========================
INSERT INTO subdim_units (code, name, base_unit) VALUES
('PCS', 'Cái', TRUE),
('BOX', 'Thùng', FALSE);

-- =========================
-- CATEGORIES
-- =========================
INSERT INTO subdim_categories (code, name, level, path) VALUES
('FOOD', 'Thực phẩm', 0, '/1'),
('DRINK', 'Đồ uống', 1, '/1/2');

-- =========================
-- PRODUCTS
-- =========================
INSERT INTO dim_products (code, name, category_id, brand_id, unit_id, has_variants)
VALUES
('MILK001', 'Sữa tươi Vinamilk', 1, 1, 1, FALSE),
('COKE001', 'Coca Cola Lon', 2, 2, 1, FALSE);

-- =========================
-- PRODUCT VARIANTS
-- =========================
INSERT INTO dim_product_variants
(product_id, sku, barcode, selling_price)
VALUES
(1, 'MILK001-SKU', '8934567890123', 15000),
(2, 'COKE001-SKU', '8934567890456', 10000);

-- =========================
-- USERS
-- =========================
INSERT INTO dim_users
(username, email, password_hash, full_name, role_id, store_id)
VALUES
('admin', 'admin@minimart.com', 'hashed_password', 'Admin System', 1, 1),
('staff_hn', 'staff.hn@minimart.com', 'hashed_password', 'Staff Hà Nội', 2, 1);

-- =========================
-- INVENTORY STOCKS
-- =========================
INSERT INTO fact_inventory_stocks
(store_id, variant_id, quantity_on_hand, min_stock_level)
VALUES
(1, 1, 100, 20),
(1, 2, 200, 30),
(2, 1, 150, 20);

-- =========================
-- TIME DIMENSION (SAMPLE)
-- =========================
INSERT INTO dim_time
(date_key, day_of_week, month, quarter, year, is_weekend)
VALUES
(CURRENT_DATE, EXTRACT(DOW FROM CURRENT_DATE), EXTRACT(MONTH FROM CURRENT_DATE),
 EXTRACT(QUARTER FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE),
 EXTRACT(DOW FROM CURRENT_DATE) IN (0,6));
