-- =====================================================
-- CATCHUP DATA RUNNER  
-- Sinh data cho tất cả các ngày còn thiếu (từ ngày cuối cùng đến hôm nay)
-- =====================================================
--
-- Dùng khi:
--   - Thành viên mới join project
--   - Đã nghỉ vài ngày không chạy
--   - Muốn "bắt kịp" data đến ngày hiện tại
--
-- =====================================================

DO $$
DECLARE
    v_last_date DATE;
    v_today DATE := CURRENT_DATE;
    v_start_date DATE;
    v_current DATE;
    v_days_to_generate INT;
    v_result RECORD;
    v_total_orders INT := 0;
    v_total_revenue DECIMAL := 0;
BEGIN
    -- Tìm ngày cuối cùng có data
    SELECT MAX(date_key) INTO v_last_date FROM fact_orders;
    
    IF v_last_date IS NULL THEN
        -- Không có data, bắt đầu từ 30 trước
        v_start_date := v_today - INTERVAL '30 days';
        RAISE NOTICE '📅 No existing data. Starting from: %', v_start_date;
    ELSIF v_last_date >= v_today THEN
        RAISE NOTICE '✅ Data is up to date! Last date: %', v_last_date;
        RETURN;
    ELSE
        v_start_date := v_last_date + 1;
        RAISE NOTICE '📅 Last data date: %', v_last_date;
        RAISE NOTICE '📅 Will generate from: % to %', v_start_date, v_today;
    END IF;
    
    v_days_to_generate := v_today - v_start_date + 1;
    RAISE NOTICE '📊 Days to generate: %', v_days_to_generate;
    RAISE NOTICE '----------------------------------------';
    
    -- Generate từng ngày
    v_current := v_start_date;
    WHILE v_current <= v_today LOOP
        RAISE NOTICE '  Processing: %...', v_current;
        
        SELECT * INTO v_result FROM generate_daily_data(v_current);
        
        v_total_orders := v_total_orders + v_result.orders_created;
        v_total_revenue := v_total_revenue + v_result.total_revenue;
        
        v_current := v_current + 1;
    END LOOP;
    
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE '✅ CATCHUP COMPLETED!';
    RAISE NOTICE '   Total days: %', v_days_to_generate;
    RAISE NOTICE '   Total orders: %', v_total_orders;
    RAISE NOTICE '   Total revenue: % VND', v_total_revenue;
END $$;

-- Show recent data
SELECT 
    date_key,
    COUNT(*) AS orders,
    COALESCE(SUM(final_amount), 0)::BIGINT AS revenue
FROM fact_orders 
WHERE date_key >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date_key
ORDER BY date_key DESC;
