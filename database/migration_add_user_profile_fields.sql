-- =====================================================
-- MIGRATION: Add profile fields to dim_users
-- Date: 2026-01-21
-- Description: Thêm các trường ngày sinh, giới tính, địa chỉ vào bảng dim_users
-- =====================================================

-- Thêm cột date_of_birth (ngày sinh)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dim_users' AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE dim_users ADD COLUMN date_of_birth DATE;
        RAISE NOTICE 'Column date_of_birth added to dim_users';
    ELSE
        RAISE NOTICE 'Column date_of_birth already exists in dim_users';
    END IF;
END $$;

-- Thêm cột gender (giới tính)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dim_users' AND column_name = 'gender'
    ) THEN
        ALTER TABLE dim_users ADD COLUMN gender VARCHAR(10);
        RAISE NOTICE 'Column gender added to dim_users';
    ELSE
        RAISE NOTICE 'Column gender already exists in dim_users';
    END IF;
END $$;

-- Thêm cột address (địa chỉ)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dim_users' AND column_name = 'address'
    ) THEN
        ALTER TABLE dim_users ADD COLUMN address TEXT;
        RAISE NOTICE 'Column address added to dim_users';
    ELSE
        RAISE NOTICE 'Column address already exists in dim_users';
    END IF;
END $$;

-- Thêm comment cho các cột mới
COMMENT ON COLUMN dim_users.date_of_birth IS 'Ngày sinh của nhân viên';
COMMENT ON COLUMN dim_users.gender IS 'Giới tính: male, female, other';
COMMENT ON COLUMN dim_users.address IS 'Địa chỉ của nhân viên';
