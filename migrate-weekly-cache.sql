-- 周报缓存字段
ALTER TABLE users ADD COLUMN weekly_report TEXT AFTER avatar;
ALTER TABLE users ADD COLUMN weekly_report_at TIMESTAMP NULL AFTER weekly_report;
