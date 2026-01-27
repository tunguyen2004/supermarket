-- Delete old data
DELETE FROM dim_time WHERE year >= 2026;

-- Insert data vào bảng dim_time
WITH RECURSIVE date_series AS (
  SELECT '2026-01-19'::DATE AS date
  UNION ALL
  SELECT (date + INTERVAL '1 day')::DATE
  FROM date_series
  WHERE date < '2028-01-18'::DATE
)
INSERT INTO dim_time (
  date_key, day_of_week, day_name, week_of_year, month, month_name, quarter, year,
  is_weekend, is_holiday, holiday_name
)
SELECT
  date AS date_key,
  EXTRACT(ISODOW FROM date)::INT AS day_of_week,
  TO_CHAR(date, 'FMDay') AS day_name,
  EXTRACT(WEEK FROM date)::INT AS week_of_year,
  EXTRACT(MONTH FROM date)::INT AS month,
  TO_CHAR(date, 'FMMonth') AS month_name,
  EXTRACT(QUARTER FROM date)::INT AS quarter,
  EXTRACT(YEAR FROM date)::INT AS year,
  CASE WHEN EXTRACT(ISODOW FROM date) >= 6 THEN TRUE ELSE FALSE END AS is_weekend,
  FALSE AS is_holiday,
  NULL AS holiday_name
FROM date_series
ON CONFLICT (date_key) DO NOTHING;

SELECT COUNT(*) as total_records FROM dim_time;
