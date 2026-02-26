-- =====================================================
-- SUPERMARKET MANAGEMENT SYSTEM
-- PostgreSQL 14+
-- Snowflake Schema (OLTP-friendly)
-- Version: 3.0 | Updated: 01/02/2026
-- =====================================================
-- =========================
-- LEVEL 3: SUB-SUB DIMENSIONS
-- =========================
-- Regions
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
    CONSTRAINT fk_city_region FOREIGN KEY (region_id) REFERENCES subdim_regions(id)
);

-- Categories (Hierarchy)
CREATE TABLE subdim_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_id INT,
    level INT DEFAULT 0,
    path VARCHAR(500),
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES subdim_categories(id) ON DELETE CASCADE
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
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    min_purchase_amount DECIMAL(15, 2) DEFAULT 0
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

-- Role Permissions (Junction Table)
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES subdim_roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES subdim_permissions(id) ON DELETE CASCADE
);

-- Discount Types
CREATE TABLE subdim_discount_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Cashbook Types
CREATE TABLE subdim_cashbook_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    transaction_direction INT NOT NULL CHECK (transaction_direction IN (1, -1)),
    description TEXT
);

-- Payment Methods
CREATE TABLE subdim_payment_methods (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Shipment Statuses
CREATE TABLE subdim_shipment_statuses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0
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
    CONSTRAINT fk_store_type FOREIGN KEY (store_type_id) REFERENCES subdim_store_types(id),
    CONSTRAINT fk_store_city FOREIGN KEY (city_id) REFERENCES subdim_cities(id)
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
    CONSTRAINT fk_supplier_city FOREIGN KEY (city_id) REFERENCES subdim_cities(id)
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
    total_lifetime_value DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_group FOREIGN KEY (customer_group_id) REFERENCES subdim_customer_groups(id),
    CONSTRAINT fk_customer_city FOREIGN KEY (city_id) REFERENCES subdim_cities(id)
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
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    has_variants BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES subdim_categories(id),
    CONSTRAINT fk_product_brand FOREIGN KEY (brand_id) REFERENCES subdim_brands(id),
    CONSTRAINT fk_product_unit FOREIGN KEY (unit_id) REFERENCES subdim_units(id)
);

-- Product Variants (SKU)
CREATE TABLE dim_product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    variant_name VARCHAR(300),
    cost_price DECIMAL(15, 2),
    selling_price DECIMAL(15, 2) NOT NULL,
    attributes JSONB,
    weight DECIMAL(10, 3),
    dimensions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES dim_products(id) ON DELETE CASCADE
);

-- Product Images (Gallery)
CREATE TABLE dim_product_images (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_image_product FOREIGN KEY (product_id) REFERENCES dim_products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product ON dim_product_images(product_id);

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
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_store FOREIGN KEY (store_id) REFERENCES dim_stores(id),
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES subdim_roles(id)
);

CREATE INDEX idx_users_locked_until ON dim_users(locked_until);

CREATE INDEX idx_users_is_active ON dim_users(is_active);

-- Discounts
CREATE TABLE dim_discounts (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    -- Type & Value
    discount_type_id INT NOT NULL,
    discount_value DECIMAL(15, 2) NOT NULL,
    max_discount_amount DECIMAL(15, 2),
    -- Conditions
    min_order_amount DECIMAL(15, 2) DEFAULT 0,
    max_uses_total INT,
    max_uses_per_customer INT DEFAULT 1,
    -- Scope
    applies_to VARCHAR(30) DEFAULT 'all',
    applicable_product_ids INT [],
    applicable_category_ids INT [],
    customer_group_ids INT [],
    -- Time
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    current_uses INT DEFAULT 0,
    -- Audit
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_discount_type FOREIGN KEY (discount_type_id) REFERENCES subdim_discount_types(id),
    CONSTRAINT fk_discount_created_by FOREIGN KEY (created_by) REFERENCES dim_users(id),
    CONSTRAINT chk_discount_dates CHECK (end_date > start_date),
    CONSTRAINT chk_discount_value CHECK (discount_value > 0)
);

CREATE INDEX idx_discounts_code ON dim_discounts(code);

CREATE INDEX idx_discounts_active ON dim_discounts(is_active);

CREATE INDEX idx_discounts_dates ON dim_discounts(start_date, end_date);

-- Carriers
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

-- Bank Accounts
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
    CONSTRAINT fk_bank_account_store FOREIGN KEY (store_id) REFERENCES dim_stores(id) ON DELETE
    SET
        NULL,
        CONSTRAINT fk_bank_account_creator FOREIGN KEY (created_by) REFERENCES dim_users(id)
);

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
    quantity_on_hand DECIMAL(15, 3) DEFAULT 0,
    quantity_reserved DECIMAL(15, 3) DEFAULT 0,
    quantity_available DECIMAL(15, 3) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    min_stock_level DECIMAL(15, 3) DEFAULT 0,
    max_stock_level DECIMAL(15, 3) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (store_id, variant_id),
    CONSTRAINT fk_stock_store FOREIGN KEY (store_id) REFERENCES dim_stores(id),
    CONSTRAINT fk_stock_variant FOREIGN KEY (variant_id) REFERENCES dim_product_variants(id)
);

-- Inventory Transactions
CREATE TABLE fact_inventory_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    date_key DATE NOT NULL,
    transaction_type_id INT NOT NULL,
    store_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity_change DECIMAL(15, 3) NOT NULL,
    balance_before DECIMAL(15, 3) NOT NULL,
    balance_after DECIMAL(15, 3) NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    unit_cost DECIMAL(15, 2),
    total_value DECIMAL(15, 2) GENERATED ALWAYS AS (ABS(quantity_change) * unit_cost) STORED,
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
    subtotal DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    shipping_fee DECIMAL(15, 2) DEFAULT 0,
    final_amount DECIMAL(15, 2) DEFAULT 0,
    payment_method VARCHAR(30),
    shipping_address TEXT,
    customer_note TEXT,
    internal_note TEXT,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
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
    variant_id INT,
    quantity DECIMAL(15, 3) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    discount_per_item DECIMAL(15, 2) DEFAULT 0,
    custom_product_name VARCHAR(300),
    line_subtotal DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    line_total DECIMAL(15, 2) GENERATED ALWAYS AS ((quantity * unit_price) - discount_per_item) STORED,
    CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id) REFERENCES fact_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_orderitem_variant FOREIGN KEY (variant_id) REFERENCES dim_product_variants(id)
);

-- Discount Usages
CREATE TABLE fact_discount_usages (
    id BIGSERIAL PRIMARY KEY,
    discount_id INT NOT NULL,
    order_id INT NOT NULL,
    customer_id INT,
    discount_amount DECIMAL(15, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usage_discount FOREIGN KEY (discount_id) REFERENCES dim_discounts(id),
    CONSTRAINT fk_usage_order FOREIGN KEY (order_id) REFERENCES fact_orders(id),
    CONSTRAINT fk_usage_customer FOREIGN KEY (customer_id) REFERENCES dim_customers(id)
);

CREATE INDEX idx_discount_usages_discount ON fact_discount_usages(discount_id);

CREATE INDEX idx_discount_usages_customer ON fact_discount_usages(customer_id);

-- Cashbook Transactions
CREATE TABLE fact_cashbook_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    date_key DATE NOT NULL,
    store_id INT NOT NULL,
    cashbook_type_id INT NOT NULL,
    payment_method_id INT,
    amount DECIMAL(15, 2) NOT NULL,
    running_balance DECIMAL(15, 2),
    reference_type VARCHAR(50),
    reference_id INT,
    description TEXT,
    recipient_name VARCHAR(200),
    recipient_phone VARCHAR(20),
    attachment_url VARCHAR(500),
    created_by INT NOT NULL,
    approved_by INT,
    approved_at TIMESTAMP,
    status VARCHAR(30) DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'rejected', 'cancelled')
    ),
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

CREATE INDEX idx_cashbook_date ON fact_cashbook_transactions(date_key);

CREATE INDEX idx_cashbook_store ON fact_cashbook_transactions(store_id);

CREATE INDEX idx_cashbook_type ON fact_cashbook_transactions(cashbook_type_id);

CREATE INDEX idx_cashbook_status ON fact_cashbook_transactions(status);

CREATE INDEX idx_cashbook_reference ON fact_cashbook_transactions(reference_type, reference_id);

-- Store Balances (snapshot)
CREATE TABLE fact_store_balances (
    store_id INT NOT NULL,
    date_key DATE NOT NULL,
    opening_balance DECIMAL(15, 2) DEFAULT 0,
    total_income DECIMAL(15, 2) DEFAULT 0,
    total_expense DECIMAL(15, 2) DEFAULT 0,
    closing_balance DECIMAL(15, 2) DEFAULT 0,
    transaction_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (store_id, date_key),
    CONSTRAINT fk_balance_store FOREIGN KEY (store_id) REFERENCES dim_stores(id),
    CONSTRAINT fk_balance_date FOREIGN KEY (date_key) REFERENCES dim_time(date_key)
);

-- Shipments
CREATE TABLE fact_shipments (
    id BIGSERIAL PRIMARY KEY,
    shipment_code VARCHAR(100) UNIQUE NOT NULL,
    order_id INT NOT NULL,
    carrier_id INT,
    tracking_code VARCHAR(100),
    status_id INT NOT NULL,
    -- Sender information
    sender_store_id INT NOT NULL,
    sender_name VARCHAR(200),
    sender_phone VARCHAR(20),
    sender_address TEXT,
    -- Recipient information
    recipient_name VARCHAR(200) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_address TEXT NOT NULL,
    recipient_city_id INT,
    recipient_district VARCHAR(100),
    recipient_ward VARCHAR(100),
    -- Package information
    package_weight DECIMAL(10, 2),
    package_length DECIMAL(10, 2),
    package_width DECIMAL(10, 2),
    package_height DECIMAL(10, 2),
    items_description TEXT,
    -- Costs
    shipping_fee DECIMAL(15, 2) DEFAULT 0,
    cod_amount DECIMAL(15, 2) DEFAULT 0,
    insurance_fee DECIMAL(15, 2) DEFAULT 0,
    total_fee DECIMAL(15, 2) DEFAULT 0,
    -- Timeline
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

CREATE INDEX idx_shipment_order ON fact_shipments(order_id);

CREATE INDEX idx_shipment_carrier ON fact_shipments(carrier_id);

CREATE INDEX idx_shipment_status ON fact_shipments(status_id);

CREATE INDEX idx_shipment_tracking ON fact_shipments(tracking_code);

CREATE INDEX idx_shipment_created_at ON fact_shipments(created_at);

CREATE INDEX idx_tracking_shipment ON fact_shipment_tracking(shipment_id);

-- =========================
-- VIEWS
-- =========================
-- VIEW: Daily Cashbook Summary
CREATE
OR REPLACE VIEW vw_daily_cashbook_summary AS
SELECT
    ct.date_key,
    ct.store_id,
    s.name as store_name,
    SUM(
        CASE
            WHEN cbt.transaction_direction = 1 THEN ct.amount
            ELSE 0
        END
    ) as total_income,
    SUM(
        CASE
            WHEN cbt.transaction_direction = -1 THEN ct.amount
            ELSE 0
        END
    ) as total_expense,
    SUM(
        CASE
            WHEN cbt.transaction_direction = 1 THEN ct.amount
            ELSE - ct.amount
        END
    ) as net_amount,
    COUNT(*) as transaction_count
FROM
    fact_cashbook_transactions ct
    JOIN subdim_cashbook_types cbt ON ct.cashbook_type_id = cbt.id
    JOIN dim_stores s ON ct.store_id = s.id
WHERE
    ct.status = 'approved'
GROUP BY
    ct.date_key,
    ct.store_id,
    s.name;

-- =========================
-- CHATBOT: CHAT HISTORY
-- =========================
CREATE TABLE fact_chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES dim_users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    user_message TEXT NOT NULL,
    bot_reply TEXT NOT NULL,
    intent VARCHAR(50),
    response_type VARCHAR(50),
    processing_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_history_user_id ON fact_chat_history(user_id);

CREATE INDEX idx_chat_history_session_id ON fact_chat_history(session_id);

CREATE INDEX idx_chat_history_created_at ON fact_chat_history(created_at DESC);

CREATE INDEX idx_chat_history_intent ON fact_chat_history(intent);

-- =========================
-- SUBMITTED REPORTS (Staff nộp báo cáo cuối ngày)
-- =========================
CREATE TABLE fact_submitted_reports (
    id SERIAL PRIMARY KEY,
    report_code VARCHAR(30) NOT NULL UNIQUE,
    report_type VARCHAR(30) NOT NULL DEFAULT 'end_of_day',
    title VARCHAR(200) NOT NULL,
    period_from DATE NOT NULL,
    period_to DATE NOT NULL,
    staff_filter_id INTEGER REFERENCES dim_users(id),
    submitted_by INTEGER NOT NULL REFERENCES dim_users(id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,

    -- Snapshot data (JSONB)
    revenue_summary JSONB,
    actual_summary JSONB,
    by_payment_method JSONB,
    by_staff JSONB,
    products_summary JSONB,
    top_products JSONB,
    returns_data JSONB,

    -- Quick-access summary
    total_orders INTEGER DEFAULT 0,
    net_revenue NUMERIC(15,2) DEFAULT 0,
    total_discount NUMERIC(15,2) DEFAULT 0,
    unique_customers INTEGER DEFAULT 0,
    grand_total NUMERIC(15,2) DEFAULT 0,

    status VARCHAR(20) DEFAULT 'submitted',
    reviewed_by INTEGER REFERENCES dim_users(id),
    reviewed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submitted_reports_code ON fact_submitted_reports(report_code);
CREATE INDEX idx_submitted_reports_submitted_by ON fact_submitted_reports(submitted_by);
CREATE INDEX idx_submitted_reports_date ON fact_submitted_reports(period_from, period_to);
CREATE INDEX idx_submitted_reports_status ON fact_submitted_reports(status);

-- =========================
-- COMPLETION MESSAGE
-- =========================
DO $$
BEGIN
    RAISE NOTICE 'Schema created successfully!';
    RAISE NOTICE '   Sub-dimensions: 11 tables (regions, cities, categories, brands, units, etc.)';
    RAISE NOTICE '   Dimensions: 10 tables (stores, suppliers, customers, products, users, etc.)';
    RAISE NOTICE '   Fact tables: 9 tables (orders, inventory, cashbook, shipments, chat_history, etc.)';
    RAISE NOTICE '   Views: 1 (vw_daily_cashbook_summary)';
    RAISE NOTICE '   Total: 36 tables + indexes';
END $$;