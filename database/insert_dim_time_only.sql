-- =====================================================
-- INSERT DATA VÀO DIM_TIME (2 NĂMS: 2026-2028)
-- =====================================================
-- Tạo dữ liệu time dimension từ 19/01/2026 đến 18/01/2028 (2 năm)
-- Xóa dữ liệu cũ nếu có
DELETE FROM dim_time WHERE year >= 2026;

-- Insert data vào bảng dim_time
WITH RECURSIVE date_series AS (
  -- Ngày bắt đầu: 19/01/2026
  SELECT '2026-01-19'::DATE AS date
  
  UNION ALL
  
  -- Tăng thêm 1 ngày mỗi lần cho đến khi vượt quá 18/01/2028 (2 năm)
  SELECT (date + INTERVAL '1 day')::DATE
  FROM date_series
  WHERE date < '2028-01-18'::DATE
)
INSERT INTO dim_time (
  date_key,
  day_of_week,
  day_name,
  week_of_year,
  month,
  month_name,
  quarter,
  year,
  is_weekend,
  is_holiday,
  holiday_name
)
SELECT
  date AS date_key,
  
  -- Thứ trong tuần (1=Monday, 7=Sunday) -> ISO Standard
  EXTRACT(ISODOW FROM date)::INT AS day_of_week,
  
  -- Tên thứ
  TO_CHAR(date, 'FMDay') AS day_name,
  
  -- Tuần trong năm (ISO Week)
  EXTRACT(WEEK FROM date)::INT AS week_of_year,
  
  -- Tháng
  EXTRACT(MONTH FROM date)::INT AS month,
  
  -- Tên tháng
  TO_CHAR(date, 'FMMonth') AS month_name,
  
  -- Quý
  EXTRACT(QUARTER FROM date)::INT AS quarter,
  
  -- Năm
  EXTRACT(YEAR FROM date)::INT AS year,
  
  -- Kiểm tra có phải weekend không (Saturday=6, Sunday=7)
  CASE 
    WHEN EXTRACT(ISODOW FROM date) IN (6, 7) THEN TRUE
    ELSE FALSE
  END AS is_weekend,
  
  -- Đánh dấu các ngày lễ Việt Nam
  CASE
    WHEN (EXTRACT(MONTH FROM date) = 1 AND EXTRACT(DAY FROM date) = 1) THEN TRUE  -- Tết Dương lịch
    WHEN (EXTRACT(MONTH FROM date) = 4 AND EXTRACT(DAY FROM date) = 30) THEN TRUE -- Ngày Giải phóng
    WHEN (EXTRACT(MONTH FROM date) = 5 AND EXTRACT(DAY FROM date) = 1) THEN TRUE  -- Ngày Quốc tế Lao động
    WHEN (EXTRACT(MONTH FROM date) = 9 AND EXTRACT(DAY FROM date) = 2) THEN TRUE  -- Ngày Quốc khánh
    ELSE FALSE
  END AS is_holiday,
  
  -- Tên ngày lễ (nếu có)
  CASE
    WHEN (EXTRACT(MONTH FROM date) = 1 AND EXTRACT(DAY FROM date) = 1) THEN 'Tết Dương lịch'
    WHEN (EXTRACT(MONTH FROM date) = 4 AND EXTRACT(DAY FROM date) = 30) THEN 'Ngày Giải phóng (30/4)'
    WHEN (EXTRACT(MONTH FROM date) = 5 AND EXTRACT(DAY FROM date) = 1) THEN 'Ngày Quốc tế Lao động'
    WHEN (EXTRACT(MONTH FROM date) = 9 AND EXTRACT(DAY FROM date) = 2) THEN 'Ngày Quốc khánh Việt Nam'
    ELSE NULL
  END AS holiday_name

FROM date_series
ORDER BY date;

-- Kiểm tra dữ liệu sau khi insert
SELECT 
  COUNT(*) as total_records,
  MIN(date_key) as first_date,
  MAX(date_key) as last_date,
  COUNT(CASE WHEN is_weekend THEN 1 END) as weekend_count,
  COUNT(CASE WHEN is_holiday THEN 1 END) as holiday_count
FROM dim_time
WHERE year BETWEEN 2026 AND 2028;
