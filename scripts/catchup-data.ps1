# =====================================================
# CATCHUP DATA - Bắt kịp data đến ngày hiện tại
# Dùng khi thành viên mới join hoặc nghỉ vài ngày
# =====================================================

Write-Host "🔄 Supermarket Data Catchup" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will generate data for all missing days until today." -ForegroundColor Yellow
Write-Host ""

# Copy files vào container
docker cp database/catchup_runner.sql minimart_postgres:/tmp/

# Chạy SQL
docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/catchup_runner.sql

Write-Host ""
Write-Host "✅ Catchup completed!" -ForegroundColor Green
