-- =====================================================
-- MIGRATION: Add avatar field to dim_users
-- Thêm trường avatar_url vào bảng dim_users
-- =====================================================

-- Thêm cột avatar_url vào bảng dim_users
ALTER TABLE dim_users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT NULL;

-- Comment cho cột
COMMENT ON COLUMN dim_users.avatar_url IS 'URL hoặc đường dẫn đến ảnh đại diện của người dùng';

-- Tạo index cho tìm kiếm nhanh (optional)
-- CREATE INDEX IF NOT EXISTS idx_users_avatar ON dim_users(avatar_url) WHERE avatar_url IS NOT NULL;
