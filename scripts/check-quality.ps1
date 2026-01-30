# =====================================================
# CHECK DATA QUALITY - Kiem tra chat luong du lieu
# =====================================================

Write-Host "Data Quality Check" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""

# Chay check
$sql1 = "SELECT * FROM check_data_quality();"
docker exec -i minimart_postgres psql -U admin -d minimart_db -c $sql1

Write-Host ""

# Show summary
$sql2 = @"
SELECT 
    'Summary' AS info,
    (SELECT COUNT(*) FROM fact_orders) AS total_orders,
    (SELECT COUNT(*) FROM fact_order_items) AS total_items,
    (SELECT COUNT(*) FROM fact_inventory_transactions) AS total_inv_trans,
    (SELECT MIN(date_key) FROM fact_orders) AS first_date,
    (SELECT MAX(date_key) FROM fact_orders) AS last_date;
"@
docker exec -i minimart_postgres psql -U admin -d minimart_db -c $sql2

Write-Host ""
Write-Host "Quality check completed!" -ForegroundColor Green
