-- =====================================================
-- SUPERMARKET MANAGEMENT SYSTEM
-- PostgreSQL 14+
-- Snowflake Schema (OLTP-friendly)
-- =====================================================

-- =========================
-- LEVEL 3: SUB-SUB DIMENSIONS
-- =========================
CREATE TABLE subdim_regions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- =========================
-- LEVEL 2: SUB-DIMENSIONS
-- =========================

-- Cities
CREATE TABLE subdim_cities (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    region_id INT NOT NULL,
    CONSTRAINT fk_city_region
        FOREIGN KEY (region_id) REFERENCES subdim_regions(id)
);

-- Categories (Hierarchy)
CREATE TABLE subdim_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_id INT,
    level INT DEFAULT 0,
    path VARCHAR(500),
    CONSTRAINT fk_category_parent
        FOREIGN KEY (parent_id) REFERENCES subdim_categories(id)
        ON DELETE CASCADE
);

-- Brands
CREATE TABLE subdim_brands (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    origin_country VARCHAR(50),
    description TEXT
);

-- Units
CREATE TABLE subdim_units (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    base_unit BOOLEAN DEFAULT FALSE
);

-- Customer Groups
CREATE TABLE subdim_customer_groups (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    min_purchase_amount DECIMAL(15,2) DEFAULT 0
);

-- Store Types
CREATE TABLE subdim_store_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL
);

-- Transaction Types
CREATE TABLE subdim_transaction_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    affects_stock INT NOT NULL CHECK (affects_stock IN (-1, 0, 1))
);

-- Roles
CREATE TABLE subdim_roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Permissions
CREATE TABLE subdim_permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    resource VARCHAR(50),
    action VARCHAR(20)
);

-- Role Permissions
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role
        FOREIGN KEY (role_id) REFERENCES subdim_roles(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission
        FOREIGN KEY (permission_id) REFERENCES subdim_permissions(id)
        ON DELETE CASCADE
);

-- =========================
-- LEVEL 1: MAIN DIMENSIONS
-- =========================

-- Time Dimension
CREATE TABLE dim_time (
    date_key DATE PRIMARY KEY,
    day_of_week INT NOT NULL,
    day_name VARCHAR(20),
    week_of_year INT,
    month INT NOT NULL,
    month_name VARCHAR(20),
    quarter INT NOT NULL,
    year INT NOT NULL,
    is_weekend BOOLEAN DEFAULT FALSE,
    is_holiday BOOLEAN DEFAULT FALSE,
    holiday_name VARCHAR(100)
);

-- Stores
CREATE TABLE dim_stores (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    store_type_id INT NOT NULL,
    city_id INT NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    manager_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_type
        FOREIGN KEY (store_type_id) REFERENCES subdim_store_types(id),
    CONSTRAINT fk_store_city
        FOREIGN KEY (city_id) REFERENCES subdim_cities(id)
);

-- Suppliers
CREATE TABLE dim_suppliers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    city_id INT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    tax_code VARCHAR(50),
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_supplier_city
        FOREIGN KEY (city_id) REFERENCES subdim_cities(id)
);

-- Customers
CREATE TABLE dim_customers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100),
    customer_group_id INT,
    city_id INT,
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    total_lifetime_value DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_group
        FOREIGN KEY (customer_group_id) REFERENCES subdim_customer_groups(id),
    CONSTRAINT fk_customer_city
        FOREIGN KEY (city_id) REFERENCES subdim_cities(id)
);

-- Products
CREATE TABLE dim_products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(300) NOT NULL,
    category_id INT NOT NULL,
    brand_id INT,
    unit_id INT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    has_variants BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id) REFERENCES subdim_categories(id),
    CONSTRAINT fk_product_brand
        FOREIGN KEY (brand_id) REFERENCES subdim_brands(id),
    CONSTRAINT fk_product_unit
        FOREIGN KEY (unit_id) REFERENCES subdim_units(id)
);

-- Product Variants (SKU)
CREATE TABLE dim_product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    variant_name VARCHAR(300),
    cost_price DECIMAL(15,2),
    selling_price DECIMAL(15,2) NOT NULL,
    attributes JSONB,
    weight DECIMAL(10,3),
    dimensions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_variant_product
        FOREIGN KEY (product_id) REFERENCES dim_products(id)
        ON DELETE CASCADE
);

-- Users
CREATE TABLE dim_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id INT NOT NULL,
    store_id INT,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_store
        FOREIGN KEY (store_id) REFERENCES dim_stores(id),
    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id) REFERENCES subdim_roles(id)
);

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
