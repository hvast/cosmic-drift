-- 创建对话表
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  creature_id VARCHAR(255) NOT NULL,
  memory_type VARCHAR(20) DEFAULT 'temporary',
  affinity_score DECIMAL(5,2) DEFAULT 0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  message_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (creature_id) REFERENCES creatures(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_creature_id (creature_id),
  INDEX idx_last_message_at (last_message_at)
);

-- 创建消息表
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  sender_id VARCHAR(255) NOT NULL,
  sender_type VARCHAR(10) NOT NULL,
  content TEXT NOT NULL,
  sentiment JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_timestamp (timestamp)
);
