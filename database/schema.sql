-- =====================================================-- =====================================================

-- SUPERMARKET MANAGEMENT SYSTEM-- SUPERMARKET MANAGEMENT SYSTEM

-- PostgreSQL 14+-- PostgreSQL 14+

-- Snowflake Schema (OLTP-friendly)-- Snowflake Schema (OLTP-friendly)

-- Version: 3.0 | Updated: 01/02/2026-- =====================================================

-- Đã gộp tất cả migrations

-- =====================================================-- =========================

-- LEVEL 3: SUB-SUB DIMENSIONS

-- =========================-- =========================

-- LEVEL 3: SUB-SUB DIMENSIONSCREATE TABLE subdim_regions (

-- =========================    id SERIAL PRIMARY KEY,

CREATE TABLE subdim_regions (    code VARCHAR(10) UNIQUE NOT NULL,

    id SERIAL PRIMARY KEY,    name VARCHAR(50) NOT NULL,

    code VARCHAR(10) UNIQUE NOT NULL,    description TEXT

    name VARCHAR(50) NOT NULL,);

    description TEXT

);-- =========================

-- LEVEL 2: SUB-DIMENSIONS

-- =========================-- =========================

-- LEVEL 2: SUB-DIMENSIONS

-- =========================-- Cities

CREATE TABLE subdim_cities (

-- Cities    id SERIAL PRIMARY KEY,

CREATE TABLE subdim_cities (    code VARCHAR(20) UNIQUE NOT NULL,

    id SERIAL PRIMARY KEY,    name VARCHAR(100) NOT NULL,

    code VARCHAR(20) UNIQUE NOT NULL,    region_id INT NOT NULL,

    name VARCHAR(100) NOT NULL,    CONSTRAINT fk_city_region

    region_id INT NOT NULL,        FOREIGN KEY (region_id) REFERENCES subdim_regions(id)

    CONSTRAINT fk_city_region);

        FOREIGN KEY (region_id) REFERENCES subdim_regions(id)

);-- Categories (Hierarchy)

CREATE TABLE subdim_categories (

-- Categories (Hierarchy)    id SERIAL PRIMARY KEY,

CREATE TABLE subdim_categories (    code VARCHAR(50) UNIQUE NOT NULL,

    id SERIAL PRIMARY KEY,    name VARCHAR(100) NOT NULL,

    code VARCHAR(50) UNIQUE NOT NULL,    parent_id INT,

    name VARCHAR(100) NOT NULL,    level INT DEFAULT 0,

    parent_id INT,    path VARCHAR(500),

    level INT DEFAULT 0,    CONSTRAINT fk_category_parent

    path VARCHAR(500),        FOREIGN KEY (parent_id) REFERENCES subdim_categories(id)

    CONSTRAINT fk_category_parent        ON DELETE CASCADE

        FOREIGN KEY (parent_id) REFERENCES subdim_categories(id));

        ON DELETE CASCADE

);-- Brands

CREATE TABLE subdim_brands (

-- Brands    id SERIAL PRIMARY KEY,

CREATE TABLE subdim_brands (    code VARCHAR(50) UNIQUE NOT NULL,

    id SERIAL PRIMARY KEY,    name VARCHAR(100) NOT NULL,

    code VARCHAR(50) UNIQUE NOT NULL,    origin_country VARCHAR(50),

    name VARCHAR(100) NOT NULL,    description TEXT

    origin_country VARCHAR(50),);

    description TEXT

);-- Units

CREATE TABLE subdim_units (

-- Units    id SERIAL PRIMARY KEY,

CREATE TABLE subdim_units (    code VARCHAR(20) UNIQUE NOT NULL,

    id SERIAL PRIMARY KEY,    name VARCHAR(50) NOT NULL,

    code VARCHAR(20) UNIQUE NOT NULL,    base_unit BOOLEAN DEFAULT FALSE

    name VARCHAR(50) NOT NULL,);

    base_unit BOOLEAN DEFAULT FALSE

);-- Customer Groups

CREATE TABLE subdim_customer_groups (

-- Customer Groups    id SERIAL PRIMARY KEY,

CREATE TABLE subdim_customer_groups (    code VARCHAR(30) UNIQUE NOT NULL,

    id SERIAL PRIMARY KEY,    name VARCHAR(100) NOT NULL,

    code VARCHAR(30) UNIQUE NOT NULL,    discount_percentage DECIMAL(5,2) DEFAULT 0,

    name VARCHAR(100) NOT NULL,    min_purchase_amount DECIMAL(15,2) DEFAULT 0

    discount_percentage DECIMAL(5,2) DEFAULT 0,);

    min_purchase_amount DECIMAL(15,2) DEFAULT 0

);-- Store Types

CREATE TABLE subdim_store_types (

-- Store Types    id SERIAL PRIMARY KEY,

CREATE TABLE subdim_store_types (    code VARCHAR(30) UNIQUE NOT NULL,

    id SERIAL PRIMARY KEY,    name VARCHAR(100) NOT NULL

    code VARCHAR(30) UNIQUE NOT NULL,);

    name VARCHAR(100) NOT NULL

);-- Transaction Types

CREATE TABLE subdim_transaction_types (

-- Transaction Types    id SERIAL PRIMARY KEY,

CREATE TABLE subdim_transaction_types (    code VARCHAR(30) UNIQUE NOT NULL,

    id SERIAL PRIMARY KEY,    name VARCHAR(100) NOT NULL,

    code VARCHAR(30) UNIQUE NOT NULL,    affects_stock INT NOT NULL CHECK (affects_stock IN (-1, 0, 1))

    name VARCHAR(100) NOT NULL,);

    affects_stock INT NOT NULL CHECK (affects_stock IN (-1, 0, 1))

);-- Roles

CREATE TABLE subdim_roles (

-- Roles    id SERIAL PRIMARY KEY,

CREATE TABLE subdim_roles (    code VARCHAR(30) UNIQUE NOT NULL,

    id SERIAL PRIMARY KEY,    name VARCHAR(100) NOT NULL,

    code VARCHAR(30) UNIQUE NOT NULL,    description TEXT

    name VARCHAR(100) NOT NULL,);

    description TEXT

);-- Permissions

CREATE TABLE subdim_permissions (

-- Permissions    id SERIAL PRIMARY KEY,

CREATE TABLE subdim_permissions (    code VARCHAR(50) UNIQUE NOT NULL,

    id SERIAL PRIMARY KEY,    name VARCHAR(100) NOT NULL,

    code VARCHAR(50) UNIQUE NOT NULL,    resource VARCHAR(50),

    name VARCHAR(100) NOT NULL,    action VARCHAR(20)

    resource VARCHAR(50),);

    action VARCHAR(20)

);-- Role Permissions

CREATE TABLE role_permissions (

-- Role Permissions    role_id INT NOT NULL,

CREATE TABLE role_permissions (    permission_id INT NOT NULL,

    role_id INT NOT NULL,    PRIMARY KEY (role_id, permission_id),

    permission_id INT NOT NULL,    CONSTRAINT fk_rp_role

    PRIMARY KEY (role_id, permission_id),        FOREIGN KEY (role_id) REFERENCES subdim_roles(id)

    CONSTRAINT fk_rp_role        ON DELETE CASCADE,

        FOREIGN KEY (role_id) REFERENCES subdim_roles(id)    CONSTRAINT fk_rp_permission

        ON DELETE CASCADE,        FOREIGN KEY (permission_id) REFERENCES subdim_permissions(id)

    CONSTRAINT fk_rp_permission        ON DELETE CASCADE

        FOREIGN KEY (permission_id) REFERENCES subdim_permissions(id));

        ON DELETE CASCADE

);-- =========================

-- LEVEL 1: MAIN DIMENSIONS

-- =========================-- =========================

-- DISCOUNT TYPES (từ Migration 001)

-- =========================-- Time Dimension

CREATE TABLE subdim_discount_types (CREATE TABLE dim_time (

    id SERIAL PRIMARY KEY,    date_key DATE PRIMARY KEY,

    code VARCHAR(30) UNIQUE NOT NULL,    day_of_week INT NOT NULL,

    name VARCHAR(100) NOT NULL,    day_name VARCHAR(20),

    description TEXT    week_of_year INT,

);    month INT NOT NULL,

    month_name VARCHAR(20),

-- =========================    quarter INT NOT NULL,

-- CASHBOOK TYPES (từ Migration 002)    year INT NOT NULL,

-- =========================    is_weekend BOOLEAN DEFAULT FALSE,

CREATE TABLE subdim_cashbook_types (    is_holiday BOOLEAN DEFAULT FALSE,

    id SERIAL PRIMARY KEY,    holiday_name VARCHAR(100)

    code VARCHAR(30) UNIQUE NOT NULL,);

    name VARCHAR(100) NOT NULL,

    transaction_direction INT NOT NULL CHECK (transaction_direction IN (1, -1)),  -- 1: thu, -1: chi-- Stores

    description TEXTCREATE TABLE dim_stores (

);    id SERIAL PRIMARY KEY,

    code VARCHAR(50) UNIQUE NOT NULL,

-- =========================    name VARCHAR(200) NOT NULL,

-- PAYMENT METHODS (từ Migration 002)    store_type_id INT NOT NULL,

-- =========================    city_id INT NOT NULL,

CREATE TABLE subdim_payment_methods (    address TEXT,

    id SERIAL PRIMARY KEY,    phone VARCHAR(20),

    code VARCHAR(30) UNIQUE NOT NULL,    manager_name VARCHAR(100),

    name VARCHAR(100) NOT NULL,    is_active BOOLEAN DEFAULT TRUE,

    is_active BOOLEAN DEFAULT TRUE    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

);    CONSTRAINT fk_store_type

        FOREIGN KEY (store_type_id) REFERENCES subdim_store_types(id),

-- =========================    CONSTRAINT fk_store_city

-- SHIPMENT STATUSES (từ Migration 003)        FOREIGN KEY (city_id) REFERENCES subdim_cities(id)

-- =========================);

CREATE TABLE subdim_shipment_statuses (

    id SERIAL PRIMARY KEY,-- Suppliers

    code VARCHAR(30) UNIQUE NOT NULL,CREATE TABLE dim_suppliers (

    name VARCHAR(100) NOT NULL,    id SERIAL PRIMARY KEY,

    description TEXT,    code VARCHAR(50) UNIQUE NOT NULL,

    sort_order INT DEFAULT 0    name VARCHAR(200) NOT NULL,

);    city_id INT,

    address TEXT,

-- =========================    phone VARCHAR(20),

-- LEVEL 1: MAIN DIMENSIONS    email VARCHAR(100),

-- =========================    tax_code VARCHAR(50),

    payment_terms VARCHAR(100),

-- Time Dimension    is_active BOOLEAN DEFAULT TRUE,

CREATE TABLE dim_time (    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    date_key DATE PRIMARY KEY,    CONSTRAINT fk_supplier_city

    day_of_week INT NOT NULL,        FOREIGN KEY (city_id) REFERENCES subdim_cities(id)

    day_name VARCHAR(20),);

    week_of_year INT,

    month INT NOT NULL,-- Customers

    month_name VARCHAR(20),CREATE TABLE dim_customers (

    quarter INT NOT NULL,    id SERIAL PRIMARY KEY,

    year INT NOT NULL,    code VARCHAR(50) UNIQUE NOT NULL,

    is_weekend BOOLEAN DEFAULT FALSE,    full_name VARCHAR(200) NOT NULL,

    is_holiday BOOLEAN DEFAULT FALSE,    phone VARCHAR(20) UNIQUE,

    holiday_name VARCHAR(100)    email VARCHAR(100),

);    customer_group_id INT,

    city_id INT,

-- Stores    address TEXT,

CREATE TABLE dim_stores (    date_of_birth DATE,

    id SERIAL PRIMARY KEY,    gender VARCHAR(10),

    code VARCHAR(50) UNIQUE NOT NULL,    total_lifetime_value DECIMAL(15,2) DEFAULT 0,

    name VARCHAR(200) NOT NULL,    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    store_type_id INT NOT NULL,    CONSTRAINT fk_customer_group

    city_id INT NOT NULL,        FOREIGN KEY (customer_group_id) REFERENCES subdim_customer_groups(id),

    address TEXT,    CONSTRAINT fk_customer_city

    phone VARCHAR(20),        FOREIGN KEY (city_id) REFERENCES subdim_cities(id)

    manager_name VARCHAR(100),);

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Products

    CONSTRAINT fk_store_typeCREATE TABLE dim_products (

        FOREIGN KEY (store_type_id) REFERENCES subdim_store_types(id),    id SERIAL PRIMARY KEY,

    CONSTRAINT fk_store_city    code VARCHAR(50) UNIQUE NOT NULL,

        FOREIGN KEY (city_id) REFERENCES subdim_cities(id)    name VARCHAR(300) NOT NULL,

);    category_id INT NOT NULL,

    brand_id INT,

-- Suppliers    unit_id INT NOT NULL,

CREATE TABLE dim_suppliers (    description TEXT,

    id SERIAL PRIMARY KEY,    image_url VARCHAR(500),

    code VARCHAR(50) UNIQUE NOT NULL,    is_active BOOLEAN DEFAULT TRUE,

    name VARCHAR(200) NOT NULL,    has_variants BOOLEAN DEFAULT FALSE,

    city_id INT,    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    address TEXT,    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    phone VARCHAR(20),    CONSTRAINT fk_product_category

    email VARCHAR(100),        FOREIGN KEY (category_id) REFERENCES subdim_categories(id),

    tax_code VARCHAR(50),    CONSTRAINT fk_product_brand

    payment_terms VARCHAR(100),        FOREIGN KEY (brand_id) REFERENCES subdim_brands(id),

    is_active BOOLEAN DEFAULT TRUE,    CONSTRAINT fk_product_unit

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        FOREIGN KEY (unit_id) REFERENCES subdim_units(id)

    CONSTRAINT fk_supplier_city);

        FOREIGN KEY (city_id) REFERENCES subdim_cities(id)

);-- Product Variants (SKU)

CREATE TABLE dim_product_variants (

-- Customers    id SERIAL PRIMARY KEY,

CREATE TABLE dim_customers (    product_id INT NOT NULL,

    id SERIAL PRIMARY KEY,    sku VARCHAR(100) UNIQUE NOT NULL,

    code VARCHAR(50) UNIQUE NOT NULL,    barcode VARCHAR(100) UNIQUE,

    full_name VARCHAR(200) NOT NULL,    variant_name VARCHAR(300),

    phone VARCHAR(20) UNIQUE,    cost_price DECIMAL(15,2),

    email VARCHAR(100),    selling_price DECIMAL(15,2) NOT NULL,

    customer_group_id INT,    attributes JSONB,

    city_id INT,    weight DECIMAL(10,3),

    address TEXT,    dimensions JSONB,

    date_of_birth DATE,    is_active BOOLEAN DEFAULT TRUE,

    gender VARCHAR(10),    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    total_lifetime_value DECIMAL(15,2) DEFAULT 0,    CONSTRAINT fk_variant_product

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        FOREIGN KEY (product_id) REFERENCES dim_products(id)

    CONSTRAINT fk_customer_group        ON DELETE CASCADE

        FOREIGN KEY (customer_group_id) REFERENCES subdim_customer_groups(id),);

    CONSTRAINT fk_customer_city

        FOREIGN KEY (city_id) REFERENCES subdim_cities(id)-- Product Images (Gallery) - Dimension table for product gallery

);CREATE TABLE dim_product_images (

    id SERIAL PRIMARY KEY,

-- Products    product_id INT NOT NULL,

CREATE TABLE dim_products (    image_url VARCHAR(500) NOT NULL,

    id SERIAL PRIMARY KEY,    alt_text VARCHAR(255),

    code VARCHAR(50) UNIQUE NOT NULL,    sort_order INT DEFAULT 0,

    name VARCHAR(300) NOT NULL,    is_primary BOOLEAN DEFAULT FALSE,

    category_id INT NOT NULL,    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    brand_id INT,    CONSTRAINT fk_product_image_product

    unit_id INT NOT NULL,        FOREIGN KEY (product_id) REFERENCES dim_products(id)

    description TEXT,        ON DELETE CASCADE

    image_url VARCHAR(500),);

    is_active BOOLEAN DEFAULT TRUE,

    has_variants BOOLEAN DEFAULT FALSE,-- Index for dim_product_images

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,CREATE INDEX idx_product_images_product ON dim_product_images(product_id);

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_category-- Users

        FOREIGN KEY (category_id) REFERENCES subdim_categories(id),CREATE TABLE dim_users (

    CONSTRAINT fk_product_brand    id SERIAL PRIMARY KEY,

        FOREIGN KEY (brand_id) REFERENCES subdim_brands(id),    username VARCHAR(50) UNIQUE NOT NULL,

    CONSTRAINT fk_product_unit    email VARCHAR(100) UNIQUE NOT NULL,

        FOREIGN KEY (unit_id) REFERENCES subdim_units(id)    password_hash VARCHAR(255) NOT NULL,

);    full_name VARCHAR(100) NOT NULL,

    role_id INT NOT NULL,

-- Product Variants (SKU)    store_id INT,

CREATE TABLE dim_product_variants (    phone VARCHAR(20),

    id SERIAL PRIMARY KEY,    date_of_birth DATE,

    product_id INT NOT NULL,    gender VARCHAR(10),

    sku VARCHAR(100) UNIQUE NOT NULL,    address TEXT,

    barcode VARCHAR(100) UNIQUE,    avatar_url VARCHAR(500),

    variant_name VARCHAR(300),    is_active BOOLEAN DEFAULT TRUE,

    cost_price DECIMAL(15,2),    last_login TIMESTAMP,

    selling_price DECIMAL(15,2) NOT NULL,    failed_login_attempts INT DEFAULT 0,

    attributes JSONB,    locked_until TIMESTAMP,

    weight DECIMAL(10,3),    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    dimensions JSONB,    CONSTRAINT fk_user_store

    is_active BOOLEAN DEFAULT TRUE,        FOREIGN KEY (store_id) REFERENCES dim_stores(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT fk_user_role

    CONSTRAINT fk_variant_product        FOREIGN KEY (role_id) REFERENCES subdim_roles(id)

        FOREIGN KEY (product_id) REFERENCES dim_products(id));

        ON DELETE CASCADE

);-- Indexes for dim_users

CREATE INDEX idx_users_locked_until ON dim_users(locked_until);

-- Product Images (Gallery)CREATE INDEX idx_users_is_active ON dim_users(is_active);

CREATE TABLE dim_product_images (

    id SERIAL PRIMARY KEY,-- =========================

    product_id INT NOT NULL,-- FACT TABLES

    image_url VARCHAR(500) NOT NULL,-- =========================

    alt_text VARCHAR(255),

    sort_order INT DEFAULT 0,-- Inventory Stocks

    is_primary BOOLEAN DEFAULT FALSE,CREATE TABLE fact_inventory_stocks (

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    store_id INT NOT NULL,

    CONSTRAINT fk_product_image_product    variant_id INT NOT NULL,

        FOREIGN KEY (product_id) REFERENCES dim_products(id)    quantity_on_hand DECIMAL(15,3) DEFAULT 0,

        ON DELETE CASCADE    quantity_reserved DECIMAL(15,3) DEFAULT 0,

);    quantity_available DECIMAL(15,3)

        GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,

-- Index for dim_product_images    min_stock_level DECIMAL(15,3) DEFAULT 0,

CREATE INDEX idx_product_images_product ON dim_product_images(product_id);    max_stock_level DECIMAL(15,3) DEFAULT 0,

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- Users    PRIMARY KEY (store_id, variant_id),

CREATE TABLE dim_users (    CONSTRAINT fk_stock_store

    id SERIAL PRIMARY KEY,        FOREIGN KEY (store_id) REFERENCES dim_stores(id),

    username VARCHAR(50) UNIQUE NOT NULL,    CONSTRAINT fk_stock_variant

    email VARCHAR(100) UNIQUE NOT NULL,        FOREIGN KEY (variant_id) REFERENCES dim_product_variants(id)

    password_hash VARCHAR(255) NOT NULL,);

    full_name VARCHAR(100) NOT NULL,

    role_id INT NOT NULL,-- Inventory Transactions

    store_id INT,CREATE TABLE fact_inventory_transactions (

    phone VARCHAR(20),    id BIGSERIAL PRIMARY KEY,

    date_of_birth DATE,    transaction_code VARCHAR(100) UNIQUE NOT NULL,

    gender VARCHAR(10),    date_key DATE NOT NULL,

    address TEXT,    transaction_type_id INT NOT NULL,

    avatar_url VARCHAR(500),    store_id INT NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,    variant_id INT NOT NULL,

    last_login TIMESTAMP,    quantity_change DECIMAL(15,3) NOT NULL,

    failed_login_attempts INT DEFAULT 0,    balance_before DECIMAL(15,3) NOT NULL,

    locked_until TIMESTAMP,    balance_after DECIMAL(15,3) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    reference_type VARCHAR(50),

    CONSTRAINT fk_user_store    reference_id INT,

        FOREIGN KEY (store_id) REFERENCES dim_stores(id),    unit_cost DECIMAL(15,2),

    CONSTRAINT fk_user_role    total_value DECIMAL(15,2)

        FOREIGN KEY (role_id) REFERENCES subdim_roles(id)        GENERATED ALWAYS AS (ABS(quantity_change) * unit_cost) STORED,

);    created_by INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- Indexes for dim_users    notes TEXT,

CREATE INDEX idx_users_locked_until ON dim_users(locked_until);    CONSTRAINT fk_inv_date FOREIGN KEY (date_key) REFERENCES dim_time(date_key),

CREATE INDEX idx_users_is_active ON dim_users(is_active);    CONSTRAINT fk_inv_type FOREIGN KEY (transaction_type_id) REFERENCES subdim_transaction_types(id),

    CONSTRAINT fk_inv_store FOREIGN KEY (store_id) REFERENCES dim_stores(id),

-- =========================    CONSTRAINT fk_inv_variant FOREIGN KEY (variant_id) REFERENCES dim_product_variants(id),

-- DISCOUNTS (từ Migration 001)    CONSTRAINT fk_inv_user FOREIGN KEY (created_by) REFERENCES dim_users(id)

-- =========================);

CREATE TABLE dim_discounts (

    id SERIAL PRIMARY KEY,-- Sales Orders

    code VARCHAR(50) UNIQUE NOT NULL,CREATE TABLE fact_orders (

    name VARCHAR(200) NOT NULL,    id SERIAL PRIMARY KEY,

    description TEXT,    order_code VARCHAR(50) UNIQUE NOT NULL,

        date_key DATE NOT NULL,

    -- Type & Value    customer_id INT,

    discount_type_id INT NOT NULL,    store_id INT NOT NULL,

    discount_value DECIMAL(15,2) NOT NULL,  -- % hoặc số tiền    status VARCHAR(30) NOT NULL,

    max_discount_amount DECIMAL(15,2),       -- Giới hạn giảm tối đa (cho %)    payment_status VARCHAR(30) NOT NULL,

        subtotal DECIMAL(15,2) DEFAULT 0,

    -- Conditions    discount_amount DECIMAL(15,2) DEFAULT 0,

    min_order_amount DECIMAL(15,2) DEFAULT 0,  -- Đơn tối thiểu    tax_amount DECIMAL(15,2) DEFAULT 0,

    max_uses_total INT,                         -- Tổng số lần dùng    shipping_fee DECIMAL(15,2) DEFAULT 0,

    max_uses_per_customer INT DEFAULT 1,        -- Số lần dùng/khách    final_amount DECIMAL(15,2) DEFAULT 0,

        payment_method VARCHAR(30),

    -- Scope    shipping_address TEXT,

    applies_to VARCHAR(30) DEFAULT 'all',       -- all, specific_products, specific_categories    customer_note TEXT,

    applicable_product_ids INT[],               -- Array product IDs    internal_note TEXT,

    applicable_category_ids INT[],              -- Array category IDs    created_by INT NOT NULL,

    customer_group_ids INT[],                   -- Chỉ áp dụng cho nhóm KH này    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_order_date FOREIGN KEY (date_key) REFERENCES dim_time(date_key),

    -- Time    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES dim_customers(id),

    start_date TIMESTAMP NOT NULL,    CONSTRAINT fk_order_store FOREIGN KEY (store_id) REFERENCES dim_stores(id),

    end_date TIMESTAMP NOT NULL,    CONSTRAINT fk_order_user FOREIGN KEY (created_by) REFERENCES dim_users(id)

    );

    -- Status

    is_active BOOLEAN DEFAULT TRUE,-- Order Items

    current_uses INT DEFAULT 0,CREATE TABLE fact_order_items (

        id BIGSERIAL PRIMARY KEY,

    -- Audit    order_id INT NOT NULL,

    created_by INT NOT NULL,    variant_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    quantity DECIMAL(15,3) NOT NULL,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    unit_price DECIMAL(15,2) NOT NULL,

        discount_per_item DECIMAL(15,2) DEFAULT 0,

    CONSTRAINT fk_discount_type    line_subtotal DECIMAL(15,2)

        FOREIGN KEY (discount_type_id) REFERENCES subdim_discount_types(id),        GENERATED ALWAYS AS (quantity * unit_price) STORED,

    CONSTRAINT fk_discount_created_by    line_total DECIMAL(15,2)

        FOREIGN KEY (created_by) REFERENCES dim_users(id),        GENERATED ALWAYS AS ((quantity * unit_price) - discount_per_item) STORED,

    CONSTRAINT chk_discount_dates    CONSTRAINT fk_orderitem_order

        CHECK (end_date > start_date),        FOREIGN KEY (order_id) REFERENCES fact_orders(id)

    CONSTRAINT chk_discount_value        ON DELETE CASCADE,

        CHECK (discount_value > 0)    CONSTRAINT fk_orderitem_variant

);        FOREIGN KEY (variant_id) REFERENCES dim_product_variants(id)

);

-- =========================
-- CARRIERS (từ Migration 003)
-- =========================
CREATE TABLE dim_carriers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    tracking_url_template VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- BANK ACCOUNTS (từ Migration 004)
-- =========================
CREATE TABLE dim_bank_accounts (
    id SERIAL PRIMARY KEY,
    account_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,
    branch VARCHAR(100),
    store_id INT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bank_account_store
        FOREIGN KEY (store_id) REFERENCES dim_stores(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_bank_account_creator
        FOREIGN KEY (created_by) REFERENCES dim_users(id)
);

-- Indexes for bank accounts
CREATE INDEX idx_bank_accounts_store ON dim_bank_accounts(store_id);
CREATE INDEX idx_bank_accounts_is_active ON dim_bank_accounts(is_active);
CREATE INDEX idx_bank_accounts_is_default ON dim_bank_accounts(is_default);

-- =========================
-- FACT TABLES
-- =========================

-- Inventory Stocks
CREATE TABLE fact_inventory_stocks (
    store_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity_on_hand DECIMAL(15,3) DEFAULT 0,
    quantity_reserved DECIMAL(15,3) DEFAULT 0,
    quantity_available DECIMAL(15,3)
        GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    min_stock_level DECIMAL(15,3) DEFAULT 0,
    max_stock_level DECIMAL(15,3) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (store_id, variant_id),
    CONSTRAINT fk_stock_store
        FOREIGN KEY (store_id) REFERENCES dim_stores(id),
    CONSTRAINT fk_stock_variant
        FOREIGN KEY (variant_id) REFERENCES dim_product_variants(id)
);

-- Inventory Transactions
CREATE TABLE fact_inventory_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    date_key DATE NOT NULL,
    transaction_type_id INT NOT NULL,
    store_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity_change DECIMAL(15,3) NOT NULL,
    balance_before DECIMAL(15,3) NOT NULL,
    balance_after DECIMAL(15,3) NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    unit_cost DECIMAL(15,2),
    total_value DECIMAL(15,2)
        GENERATED ALWAYS AS (ABS(quantity_change) * unit_cost) STORED,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT fk_inv_date FOREIGN KEY (date_key) REFERENCES dim_time(date_key),
    CONSTRAINT fk_inv_type FOREIGN KEY (transaction_type_id) REFERENCES subdim_transaction_types(id),
    CONSTRAINT fk_inv_store FOREIGN KEY (store_id) REFERENCES dim_stores(id),
    CONSTRAINT fk_inv_variant FOREIGN KEY (variant_id) REFERENCES dim_product_variants(id),
    CONSTRAINT fk_inv_user FOREIGN KEY (created_by) REFERENCES dim_users(id)
);

-- Sales Orders
CREATE TABLE fact_orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    date_key DATE NOT NULL,
    customer_id INT,
    store_id INT NOT NULL,
    status VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    subtotal DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    shipping_fee DECIMAL(15,2) DEFAULT 0,
    final_amount DECIMAL(15,2) DEFAULT 0,
    payment_method VARCHAR(30),
    shipping_address TEXT,
    customer_note TEXT,
    internal_note TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_date FOREIGN KEY (date_key) REFERENCES dim_time(date_key),
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES dim_customers(id),
    CONSTRAINT fk_order_store FOREIGN KEY (store_id) REFERENCES dim_stores(id),
    CONSTRAINT fk_order_user FOREIGN KEY (created_by) REFERENCES dim_users(id)
);

-- Order Items
CREATE TABLE fact_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_per_item DECIMAL(15,2) DEFAULT 0,
    line_subtotal DECIMAL(15,2)
        GENERATED ALWAYS AS (quantity * unit_price) STORED,
    line_total DECIMAL(15,2)
        GENERATED ALWAYS AS ((quantity * unit_price) - discount_per_item) STORED,
    CONSTRAINT fk_orderitem_order
        FOREIGN KEY (order_id) REFERENCES fact_orders(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_orderitem_variant
        FOREIGN KEY (variant_id) REFERENCES dim_product_variants(id)
);

-- =========================
-- DISCOUNT USAGES (từ Migration 001)
-- =========================
CREATE TABLE fact_discount_usages (
    id BIGSERIAL PRIMARY KEY,
    discount_id INT NOT NULL,
    order_id INT NOT NULL,
    customer_id INT,
    discount_amount DECIMAL(15,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_usage_discount
        FOREIGN KEY (discount_id) REFERENCES dim_discounts(id),
    CONSTRAINT fk_usage_order
        FOREIGN KEY (order_id) REFERENCES fact_orders(id),
    CONSTRAINT fk_usage_customer
        FOREIGN KEY (customer_id) REFERENCES dim_customers(id)
);

-- Indexes for discounts
CREATE INDEX idx_discounts_code ON dim_discounts(code);
CREATE INDEX idx_discounts_active ON dim_discounts(is_active);
CREATE INDEX idx_discounts_dates ON dim_discounts(start_date, end_date);
CREATE INDEX idx_discount_usages_discount ON fact_discount_usages(discount_id);
CREATE INDEX idx_discount_usages_customer ON fact_discount_usages(customer_id);

-- =========================
-- CASHBOOK TRANSACTIONS (từ Migration 002)
-- =========================
CREATE TABLE fact_cashbook_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    date_key DATE NOT NULL,
    store_id INT NOT NULL,
    cashbook_type_id INT NOT NULL,
    payment_method_id INT,
    amount DECIMAL(15,2) NOT NULL,
    running_balance DECIMAL(15,2),
    reference_type VARCHAR(50),
    reference_id INT,
    description TEXT,
    recipient_name VARCHAR(200),
    recipient_phone VARCHAR(20),
    attachment_url VARCHAR(500),
    created_by INT NOT NULL,
    approved_by INT,
    approved_at TIMESTAMP,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cashbook_date FOREIGN KEY (date_key) REFERENCES dim_time(date_key),
    CONSTRAINT fk_cashbook_store FOREIGN KEY (store_id) REFERENCES dim_stores(id),
    CONSTRAINT fk_cashbook_type FOREIGN KEY (cashbook_type_id) REFERENCES subdim_cashbook_types(id),
    CONSTRAINT fk_cashbook_payment_method FOREIGN KEY (payment_method_id) REFERENCES subdim_payment_methods(id),
    CONSTRAINT fk_cashbook_creator FOREIGN KEY (created_by) REFERENCES dim_users(id),
    CONSTRAINT fk_cashbook_approver FOREIGN KEY (approved_by) REFERENCES dim_users(id)
);

-- Indexes for cashbook
CREATE INDEX idx_cashbook_date ON fact_cashbook_transactions(date_key);
CREATE INDEX idx_cashbook_store ON fact_cashbook_transactions(store_id);
CREATE INDEX idx_cashbook_type ON fact_cashbook_transactions(cashbook_type_id);
CREATE INDEX idx_cashbook_status ON fact_cashbook_transactions(status);
CREATE INDEX idx_cashbook_reference ON fact_cashbook_transactions(reference_type, reference_id);

-- Store Balances (snapshot)
CREATE TABLE fact_store_balances (
    store_id INT NOT NULL,
    date_key DATE NOT NULL,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    total_income DECIMAL(15,2) DEFAULT 0,
    total_expense DECIMAL(15,2) DEFAULT 0,
    closing_balance DECIMAL(15,2) DEFAULT 0,
    transaction_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (store_id, date_key),
    CONSTRAINT fk_balance_store FOREIGN KEY (store_id) REFERENCES dim_stores(id),
    CONSTRAINT fk_balance_date FOREIGN KEY (date_key) REFERENCES dim_time(date_key)
);

-- =========================
-- SHIPMENTS (từ Migration 003)
-- =========================
CREATE TABLE fact_shipments (
    id BIGSERIAL PRIMARY KEY,
    shipment_code VARCHAR(100) UNIQUE NOT NULL,
    order_id INT NOT NULL,
    carrier_id INT,
    tracking_code VARCHAR(100),
    status_id INT NOT NULL,
    
    -- Thông tin người gửi
    sender_store_id INT NOT NULL,
    sender_name VARCHAR(200),
    sender_phone VARCHAR(20),
    sender_address TEXT,
    
    -- Thông tin người nhận
    recipient_name VARCHAR(200) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_address TEXT NOT NULL,
    recipient_city_id INT,
    recipient_district VARCHAR(100),
    recipient_ward VARCHAR(100),
    
    -- Thông tin gói hàng
    package_weight DECIMAL(10,2),
    package_length DECIMAL(10,2),
    package_width DECIMAL(10,2),
    package_height DECIMAL(10,2),
    items_description TEXT,
    
    -- Chi phí
    shipping_fee DECIMAL(15,2) DEFAULT 0,
    cod_amount DECIMAL(15,2) DEFAULT 0,
    insurance_fee DECIMAL(15,2) DEFAULT 0,
    total_fee DECIMAL(15,2) DEFAULT 0,
    
    -- Thời gian
    estimated_delivery_date DATE,
    actual_delivery_date TIMESTAMP,
    picked_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Metadata
    notes TEXT,
    special_instructions TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_shipment_order FOREIGN KEY (order_id) REFERENCES fact_orders(id),
    CONSTRAINT fk_shipment_carrier FOREIGN KEY (carrier_id) REFERENCES dim_carriers(id),
    CONSTRAINT fk_shipment_status FOREIGN KEY (status_id) REFERENCES subdim_shipment_statuses(id),
    CONSTRAINT fk_shipment_store FOREIGN KEY (sender_store_id) REFERENCES dim_stores(id),
    CONSTRAINT fk_shipment_city FOREIGN KEY (recipient_city_id) REFERENCES subdim_cities(id),
    CONSTRAINT fk_shipment_creator FOREIGN KEY (created_by) REFERENCES dim_users(id)
);

-- Shipment Tracking History
CREATE TABLE fact_shipment_tracking (
    id BIGSERIAL PRIMARY KEY,
    shipment_id BIGINT NOT NULL,
    status_id INT NOT NULL,
    location VARCHAR(200),
    description TEXT,
    tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    
    CONSTRAINT fk_tracking_shipment FOREIGN KEY (shipment_id) REFERENCES fact_shipments(id) ON DELETE CASCADE,
    CONSTRAINT fk_tracking_status FOREIGN KEY (status_id) REFERENCES subdim_shipment_statuses(id),
    CONSTRAINT fk_tracking_creator FOREIGN KEY (created_by) REFERENCES dim_users(id)
);

-- Indexes for shipments
CREATE INDEX idx_shipment_order ON fact_shipments(order_id);
CREATE INDEX idx_shipment_carrier ON fact_shipments(carrier_id);
CREATE INDEX idx_shipment_status ON fact_shipments(status_id);
CREATE INDEX idx_shipment_tracking ON fact_shipments(tracking_code);
CREATE INDEX idx_shipment_created_at ON fact_shipments(created_at);
CREATE INDEX idx_tracking_shipment ON fact_shipment_tracking(shipment_id);

-- =========================
-- VIEWS
-- =========================

-- VIEW: Tổng hợp sổ quỹ theo ngày/cửa hàng
CREATE OR REPLACE VIEW vw_daily_cashbook_summary AS
SELECT 
    ct.date_key,
    ct.store_id,
    s.name as store_name,
    SUM(CASE WHEN cbt.transaction_direction = 1 THEN ct.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN cbt.transaction_direction = -1 THEN ct.amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN cbt.transaction_direction = 1 THEN ct.amount ELSE -ct.amount END) as net_amount,
    COUNT(*) as transaction_count
FROM fact_cashbook_transactions ct
JOIN subdim_cashbook_types cbt ON ct.cashbook_type_id = cbt.id
JOIN dim_stores s ON ct.store_id = s.id
WHERE ct.status = 'approved'
GROUP BY ct.date_key, ct.store_id, s.name;

-- =========================
-- COMPLETION MESSAGE
-- =========================
DO $$ 
BEGIN
    RAISE NOTICE '✅ Schema created successfully!';
    RAISE NOTICE '   - Core tables: regions, cities, categories, brands, units, etc.';
    RAISE NOTICE '   - Dimension tables: stores, suppliers, customers, products, users, discounts, carriers, bank_accounts';
    RAISE NOTICE '   - Fact tables: orders, order_items, inventory_stocks, inventory_transactions, cashbook, shipments';
    RAISE NOTICE '   - Views: vw_daily_cashbook_summary';
END $$;
