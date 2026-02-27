-- =====================================================
-- BACKUP SCRIPT
-- Hướng dẫn backup/restore database
-- =====================================================
--
-- BACKUP COMMANDS (chạy từ terminal host):
-- =====================================================

-- 1. FULL BACKUP (schema + data)
-- docker exec minimart_postgres pg_dump -U admin -d minimart_db > backup_full_$(date +%Y%m%d).sql

-- 2. SCHEMA ONLY (không có data)
-- docker exec minimart_postgres pg_dump -U admin -d minimart_db --schema-only > backup_schema_$(date +%Y%m%d).sql

-- 3. DATA ONLY (không có schema)
-- docker exec minimart_postgres pg_dump -U admin -d minimart_db --data-only > backup_data_$(date +%Y%m%d).sql

-- 4. BACKUP SPECIFIC TABLES
-- docker exec minimart_postgres pg_dump -U admin -d minimart_db -t fact_orders -t fact_order_items > backup_orders_$(date +%Y%m%d).sql

-- 5. BACKUP dạng COMPRESSED (custom format)
-- docker exec minimart_postgres pg_dump -U admin -d minimart_db -Fc > backup_$(date +%Y%m%d).dump

-- =====================================================
-- RESTORE COMMANDS:
-- =====================================================

-- 1. RESTORE từ SQL file
-- docker exec -i minimart_postgres psql -U admin -d minimart_db < backup_full_20260227.sql

-- 2. RESTORE từ compressed dump
-- docker exec -i minimart_postgres pg_restore -U admin -d minimart_db backup_20260227.dump

-- 3. RESTORE chỉ specific tables
-- docker exec -i minimart_postgres pg_restore -U admin -d minimart_db -t fact_orders backup_20260227.dump

-- =====================================================
-- WINDOWS POWERSHELL COMMANDS:
-- =====================================================

-- Full backup (Windows):
-- $date = Get-Date -Format "yyyyMMdd"
-- docker exec minimart_postgres pg_dump -U admin -d minimart_db > "D:\supermarket\database\backups\backup_full_$date.sql"

-- Restore (Windows):
-- Get-Content "D:\supermarket\database\backups\backup_full_20260227.sql" | docker exec -i minimart_postgres psql -U admin -d minimart_db

-- =====================================================
-- AUTOMATED BACKUP SCRIPT (tạo file backup.ps1):
-- =====================================================
/*
# backup.ps1
$backupDir = "D:\supermarket\database\backups"
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupDir\backup_$date.sql"

# Tạo folder nếu chưa có
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Backup
docker exec minimart_postgres pg_dump -U admin -d minimart_db > $backupFile

# Xóa backup cũ hơn 30 ngày
Get-ChildItem $backupDir -Filter "backup_*.sql" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | 
    Remove-Item

Write-Host "✅ Backup completed: $backupFile"
Write-Host "📦 Size: $((Get-Item $backupFile).Length / 1MB) MB"
*/
