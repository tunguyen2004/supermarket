# =====================================================
# BACKFILL DATA - Sinh data cho khoảng thời gian cụ thể
# =====================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$StartDate,
    
    [Parameter(Mandatory=$true)]
    [string]$EndDate
)

Write-Host "📊 Supermarket Data Backfill" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "From: $StartDate" -ForegroundColor Yellow
Write-Host "To:   $EndDate" -ForegroundColor Yellow
Write-Host ""

# Tạo SQL command
$sql = "SELECT * FROM backfill_daily_data('$StartDate'::date, '$EndDate'::date, TRUE);"

# Chạy trong container
docker exec -i minimart_postgres psql -U admin -d minimart_db -c "$sql"

Write-Host ""
Write-Host "✅ Backfill completed!" -ForegroundColor Green
