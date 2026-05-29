-- ============================================================
-- 知客 KnowClient — MySQL 5.7 建表脚本
-- 执行方式：mysql -u root -p knowclient < init.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS knowclient
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE knowclient;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  avatar VARCHAR(500),
  weekly_report TEXT,
  weekly_report_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 客户表（核心业务表）
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(200),
  title VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  stage ENUM('新线索','初步接触','需求确认','报价','谈判','已成交','维护') NOT NULL DEFAULT '新线索',
  probability INT,
  ai_summary TEXT,
  ai_tags JSON,
  last_follow_at DATETIME,
  follow_interval INT DEFAULT 3,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX user_stage_idx (user_id, stage),
  INDEX user_follow_idx (user_id, last_follow_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 沟通记录表
CREATE TABLE IF NOT EXISTS notes (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255),
  user_id VARCHAR(255) NOT NULL,
  content_raw TEXT NOT NULL,
  content_ai TEXT,
  type VARCHAR(20) DEFAULT 'note',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 待办事项表
CREATE TABLE IF NOT EXISTS todos (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  client_id VARCHAR(255),
  title VARCHAR(500) NOT NULL,
  due_date DATETIME,
  done INT DEFAULT 0,
  auto_created INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI跟进建议表
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  suggestion TEXT NOT NULL,
  priority ENUM('urgent','high','normal') DEFAULT 'normal',
  dismissed INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI事件日志
CREATE TABLE IF NOT EXISTS ai_events (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  client_id VARCHAR(255),
  event_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
