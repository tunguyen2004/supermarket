-- =====================================================
-- MIGRATION TỔNG HỢP - Chạy 1 lần cho database cũ
-- Date: 2026-01-21
-- =====================================================
-- File này dùng cho những ai đã có database cũ và cần update
-- Nếu pull mới về và chạy docker-compose up lần đầu thì KHÔNG CẦN chạy file này
-- vì schema.sql đã bao gồm tất cả các cột mới

-- =====================================================
-- 1. MIGRATION: Login Security
-- =====================================================
ALTER TABLE dim_users
ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_locked_until ON dim_users(locked_until);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON dim_users(is_active);

-- =====================================================
-- 2. MIGRATION: User Profile Fields
-- =====================================================
ALTER TABLE dim_users 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS address TEXT;

-- =====================================================
-- 3. MIGRATION: Avatar
-- =====================================================
ALTER TABLE dim_users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT NULL;

-- =====================================================
-- DONE - Verify
-- =====================================================
-- Kiểm tra các cột đã được thêm
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'dim_users'
ORDER BY ordinal_position;
