-- =====================================================
-- DAILY DATA RUNNER
-- Chạy file này để sinh data cho ngày hiện tại
-- =====================================================
-- 
-- Cách dùng trong Docker:
--   docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/daily_runner.sql
--
-- Hoặc dùng script:
--   ./scripts/generate-today.sh (Linux/Mac)
--   scripts\generate-today.ps1 (Windows)
--
-- =====================================================

DO $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_result RECORD;
    v_already_exists BOOLEAN;
BEGIN
    -- Check nếu đã có data cho hôm nay
    SELECT EXISTS(
        SELECT 1 FROM fact_orders WHERE date_key = v_today
    ) INTO v_already_exists;
    
    IF v_already_exists THEN
        RAISE NOTICE '⚠️  Data for % already exists. Skipping...', v_today;
        RAISE NOTICE '    Use generate_daily_data() directly if you want to add more.';
        RETURN;
    END IF;
    
    -- Sinh data cho hôm nay
    RAISE NOTICE '🚀 Generating data for: %', v_today;
    SELECT * INTO v_result FROM generate_daily_data(v_today);
    
    RAISE NOTICE '✅ Completed!';
    RAISE NOTICE '   Orders: %', v_result.orders_created;
    RAISE NOTICE '   Items: %', v_result.items_created;
    RAISE NOTICE '   Revenue: % VND', v_result.total_revenue;
END $$;

-- Show summary
SELECT 
    '📊 Today Summary' AS info,
    COUNT(*) AS total_orders,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed,
    COALESCE(SUM(final_amount) FILTER (WHERE status = 'completed'), 0) AS revenue
FROM fact_orders 
WHERE date_key = CURRENT_DATE;
