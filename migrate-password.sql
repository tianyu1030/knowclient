-- 为已有 users 表添加 password 列
ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER email;
