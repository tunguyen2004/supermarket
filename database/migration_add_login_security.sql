-- =====================================================
-- MIGRATION: Thêm cột theo dõi đăng nhập sai
-- =====================================================
-- Thêm các cột để xử lý security:
-- - failed_login_attempts: Số lần đăng nhập sai liên tiếp
-- - locked_until: Thời điểm mở khóa tài khoản

-- Kiểm tra và thêm cột (nếu chưa có)
ALTER TABLE dim_users
ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- Thêm index cho tối ưu hóa query
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON dim_users(locked_until);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON dim_users(is_active);

-- Ví dụ dữ liệu sau migration
-- dim_users:
-- - id: 1
-- - username: admin
-- - email: admin@supermarket.com
-- - password_hash: $2b$10$...
-- - full_name: Administrator
-- - role_id: 1
-- - store_id: 1
-- - is_active: true
-- - last_login: 2026-01-20 12:00:00
-- - failed_login_attempts: 0         ← THÊMMỚI
-- - locked_until: NULL                ← THÊM MỚI
-- - created_at: 2026-01-19 10:00:00
