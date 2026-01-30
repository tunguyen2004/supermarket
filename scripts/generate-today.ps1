# =====================================================
# GENERATE TODAY'S DATA
# Chạy script này để sinh data cho ngày hôm nay
# =====================================================

Write-Host "🚀 Supermarket Data Generator" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Copy file vào container
docker cp database/daily_runner.sql minimart_postgres:/tmp/

# Chạy SQL
docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/daily_runner.sql

Write-Host ""
Write-Host "✅ Done!" -ForegroundColor Green
