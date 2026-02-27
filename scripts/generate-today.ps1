# =====================================================
# GENERATE TODAY'S DATA
# Chạy script này để sinh data cho ngày hôm nay
# =====================================================

Write-Host "🚀 Supermarket Data Generator" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

$sql = @"
DO \$\$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_result RECORD;
    v_already_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM fact_orders WHERE date_key = v_today
    ) INTO v_already_exists;
    
    IF v_already_exists THEN
        RAISE NOTICE 'Data for % already exists. Skipping...', v_today;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Generating data for: %', v_today;
    SELECT * INTO v_result FROM generate_daily_data(v_today);
    
    RAISE NOTICE 'Completed! Orders: %, Items: %, Revenue: % VND',
        v_result.orders_created, v_result.items_created, v_result.total_revenue;
END \$\$;

SELECT 
    'Today Summary' AS info,
    COUNT(*) AS total_orders,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed,
    COALESCE(SUM(final_amount) FILTER (WHERE status = 'completed'), 0) AS revenue
FROM fact_orders 
WHERE date_key = CURRENT_DATE;
"@

docker exec -i minimart_postgres psql -U admin -d minimart_db -c $sql

Write-Host ""
Write-Host "✅ Done!" -ForegroundColor Green
