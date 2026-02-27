-- =====================================================
-- RESET SCRIPT
-- Reset toàn bộ database về trạng thái ban đầu
-- =====================================================
-- ⚠️  CẢNH BÁO: Script này sẽ XÓA TOÀN BỘ dữ liệu!
--
-- Cách dùng:
--   docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/reset.sql
--
-- Sau khi reset, chạy lại:
--   1. init/02_seed.sql     (seed data)
--   2. init/04_catchup.sql  (sinh data đến ngày hiện tại)
-- =====================================================

\echo '⚠️  WARNING: This will DELETE ALL data!'
\echo 'Press Ctrl+C within 5 seconds to cancel...'
SELECT pg_sleep(5);

\echo ''
\echo '🗑️  Starting database reset...'

-- 1. Truncate tất cả fact tables
\echo '  Truncating fact tables...'
TRUNCATE TABLE 
    fact_shipment_tracking, 
    fact_shipments, 
    fact_store_balances,
    fact_cashbook_transactions, 
    fact_discount_usages, 
    fact_order_items,
    fact_orders, 
    fact_inventory_transactions, 
    fact_inventory_stocks,
    fact_chat_history,
    fact_submitted_reports
CASCADE;

-- 2. Truncate dimension tables
\echo '  Truncating dimension tables...'
TRUNCATE TABLE 
    dim_bank_accounts, 
    dim_discounts, 
    dim_carriers, 
    dim_product_images,
    dim_product_variants,
    dim_products, 
    dim_users, 
    dim_customers, 
    dim_suppliers,
    dim_stores, 
    dim_time 
CASCADE;

-- 3. Truncate sub-dimension tables
\echo '  Truncating sub-dimension tables...'
TRUNCATE TABLE 
    role_permissions, 
    subdim_permissions, 
    subdim_roles, 
    subdim_shipment_statuses,
    subdim_payment_methods, 
    subdim_cashbook_types, 
    subdim_discount_types,
    subdim_transaction_types, 
    subdim_store_types, 
    subdim_customer_groups,
    subdim_units, 
    subdim_brands, 
    subdim_categories, 
    subdim_cities, 
    subdim_regions 
CASCADE;

-- 4. Reset all sequences
\echo '  Resetting sequences...'
DO $$
DECLARE
    seq_name TEXT;
BEGIN
    FOR seq_name IN 
        SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public'
    LOOP
        EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', seq_name);
    END LOOP;
    RAISE NOTICE '✅ All sequences reset to 1';
END $$;

\echo ''
\echo '✅ Database reset completed!'
\echo ''
\echo '📌 Next steps:'
\echo '  1. Run seed:    \i init/02_seed.sql'
\echo '  2. Run catchup: \i init/04_catchup.sql'
