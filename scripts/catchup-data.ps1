# =====================================================
# CATCHUP DATA - Bắt kịp data đến ngày hiện tại
# Dùng khi thành viên mới join hoặc nghỉ vài ngày
# =====================================================

Write-Host "🔄 Supermarket Data Catchup" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will generate data for all missing days until today." -ForegroundColor Yellow
Write-Host ""

$sql = @"
DO \$\$
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
    SELECT MAX(date_key) INTO v_last_date FROM fact_orders;
    
    IF v_last_date IS NULL THEN
        v_start_date := v_today - INTERVAL '30 days';
        RAISE NOTICE 'No existing data. Starting from: %', v_start_date;
    ELSIF v_last_date >= v_today THEN
        RAISE NOTICE 'Data is up to date! Last date: %', v_last_date;
        RETURN;
    ELSE
        v_start_date := v_last_date + 1;
        RAISE NOTICE 'Last data: %. Generating from % to %', v_last_date, v_start_date, v_today;
    END IF;
    
    v_days_to_generate := v_today - v_start_date + 1;
    RAISE NOTICE 'Days to generate: %', v_days_to_generate;
    
    v_current := v_start_date;
    WHILE v_current <= v_today LOOP
        RAISE NOTICE '  Processing: %...', v_current;
        SELECT * INTO v_result FROM generate_daily_data(v_current);
        v_total_orders := v_total_orders + v_result.orders_created;
        v_total_revenue := v_total_revenue + v_result.total_revenue;
        v_current := v_current + 1;
    END LOOP;
    
    RAISE NOTICE 'CATCHUP COMPLETED! Days: %, Orders: %, Revenue: % VND',
        v_days_to_generate, v_total_orders, v_total_revenue;
END \$\$;

SELECT date_key, COUNT(*) AS orders, COALESCE(SUM(final_amount), 0)::BIGINT AS revenue
FROM fact_orders WHERE date_key >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date_key ORDER BY date_key DESC;
"@

docker exec -i minimart_postgres psql -U admin -d minimart_db -c $sql

Write-Host ""
Write-Host "✅ Catchup completed!" -ForegroundColor Green
