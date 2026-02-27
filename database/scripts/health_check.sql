-- =====================================================
-- HEALTH CHECK SCRIPT
-- Kiểm tra toàn diện sức khỏe database
-- =====================================================
-- Cách dùng:
--   docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/health_check.sql
-- =====================================================

\echo '=============================================='
\echo '🏥 DATABASE HEALTH CHECK'
\echo '=============================================='

-- 1. Kiểm tra tất cả bảng có tồn tại
\echo ''
\echo '📋 1. TABLE EXISTENCE CHECK'
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Đếm records mỗi bảng
\echo ''
\echo '📊 2. ROW COUNTS'
SELECT 
    schemaname || '.' || relname AS table_name,
    n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 3. Kiểm tra tồn kho âm
\echo ''
\echo '⚠️  3. NEGATIVE INVENTORY CHECK'
SELECT 
    fis.store_id, 
    s.name AS store_name,
    fis.variant_id, 
    p.name AS product_name,
    fis.quantity_on_hand
FROM fact_inventory_stocks fis
JOIN dim_stores s ON s.id = fis.store_id
JOIN dim_product_variants pv ON pv.id = fis.variant_id
JOIN dim_products p ON p.id = pv.product_id
WHERE fis.quantity_on_hand < 0
ORDER BY fis.quantity_on_hand;

-- 4. Kiểm tra orphan records
\echo ''
\echo '🔗 4. ORPHAN RECORDS CHECK'
SELECT 'Orders without valid customer' AS check_type,
    COUNT(*) AS count
FROM fact_orders o
LEFT JOIN dim_customers c ON c.id = o.customer_id
WHERE o.customer_id IS NOT NULL AND c.id IS NULL

UNION ALL

SELECT 'Order items without valid order',
    COUNT(*)
FROM fact_order_items oi
LEFT JOIN fact_orders o ON o.id = oi.order_id
WHERE o.id IS NULL

UNION ALL

SELECT 'Order items without valid variant',
    COUNT(*)
FROM fact_order_items oi
LEFT JOIN dim_product_variants pv ON pv.id = oi.variant_id
WHERE oi.variant_id IS NOT NULL AND pv.id IS NULL;

-- 5. Kiểm tra sequences
\echo ''
\echo '🔢 5. SEQUENCE STATUS'
SELECT 
    sequencename AS sequence_name,
    last_value
FROM pg_sequences
WHERE schemaname = 'public'
ORDER BY sequencename;

-- 6. Kiểm tra indexes
\echo ''
\echo '📇 6. INDEX STATUS'
SELECT 
    indexrelname AS index_name,
    relname AS table_name,
    idx_scan AS times_used,
    idx_tup_read AS rows_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 20;

-- 7. Database size
\echo ''
\echo '💾 7. DATABASE SIZE'
SELECT 
    pg_database.datname AS database_name,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database 
WHERE datname = 'minimart_db';

-- 8. Table sizes
\echo ''
\echo '📦 8. TABLE SIZES (Top 10)'
SELECT 
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS data_size,
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;

-- 9. Data Quality Summary
\echo ''
\echo '🔍 9. DATA QUALITY SUMMARY'
SELECT * FROM check_data_quality();

-- 10. Recent data check
\echo ''
\echo '📅 10. RECENT DATA (Last 7 days)'
SELECT 
    date_key,
    COUNT(*) AS orders,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed,
    COALESCE(SUM(final_amount) FILTER (WHERE status = 'completed'), 0)::BIGINT AS revenue
FROM fact_orders 
WHERE date_key >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date_key
ORDER BY date_key DESC;

\echo ''
\echo '=============================================='
\echo '✅ HEALTH CHECK COMPLETED'
\echo '=============================================='
