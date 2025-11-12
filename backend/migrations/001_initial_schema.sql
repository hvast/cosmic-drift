-- MySQL Schema for Cosmic Drift

-- Users table
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar TEXT,
  role VARCHAR(20) DEFAULT 'explorer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT check_role CHECK (role IN ('creator', 'explorer', 'adopter'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Creatures table
CREATE TABLE creatures (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  species VARCHAR(200) NOT NULL,
  personality JSON NOT NULL,
  habitat TEXT NOT NULL,
  backstory TEXT,
  image_url TEXT NOT NULL,
  creator_id CHAR(36),
  adopter_id CHAR(36),
  status VARCHAR(20) DEFAULT 'drifting',
  emotion_value INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  adopted_at TIMESTAMP NULL,
  CONSTRAINT check_status CHECK (status IN ('drifting', 'adopted')),
  CONSTRAINT check_emotion_range CHECK (emotion_value >= 0 AND emotion_value <= 100),
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (adopter_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversations table
CREATE TABLE conversations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  creature_id CHAR(36),
  memory_type VARCHAR(20) DEFAULT 'temporary',
  affinity_score DECIMAL(5,2) DEFAULT 0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  message_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  CONSTRAINT check_memory_type CHECK (memory_type IN ('temporary', 'longterm')),
  CONSTRAINT check_affinity_range CHECK (affinity_score >= 0 AND affinity_score <= 100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (creature_id) REFERENCES creatures(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE messages (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  conversation_id CHAR(36),
  sender_id CHAR(36) NOT NULL,
  sender_type VARCHAR(10) NOT NULL,
  content TEXT NOT NULL,
  sentiment JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_sender_type CHECK (sender_type IN ('user', 'creature')),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FULLTEXT KEY idx_content_fulltext (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Affinity scores table
CREATE TABLE affinity_scores (
  user_id CHAR(36),
  creature_id CHAR(36),
  score DECIMAL(5,2) NOT NULL,
  metrics JSON NOT NULL,
  last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, creature_id),
  CONSTRAINT check_score_range CHECK (score >= 0 AND score <= 100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (creature_id) REFERENCES creatures(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adoption invitations table
CREATE TABLE adoption_invitations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  creature_id CHAR(36),
  user_id CHAR(36),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  CONSTRAINT check_invitation_status CHECK (status IN ('pending', 'accepted', 'declined')),
  FOREIGN KEY (creature_id) REFERENCES creatures(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cosmic log entries table
CREATE TABLE cosmic_log_entries (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  creature_id CHAR(36),
  conversation_id CHAR(36),
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  visibility VARCHAR(20) DEFAULT 'public',
  tags JSON,
  CONSTRAINT check_visibility CHECK (visibility IN ('public', 'unlisted')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (creature_id) REFERENCES creatures(id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reactions table
CREATE TABLE reactions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  log_entry_id CHAR(36),
  user_id CHAR(36),
  type VARCHAR(20) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_reaction_type CHECK (type IN ('resonate', 'moved', 'inspired')),
  UNIQUE KEY unique_reaction (log_entry_id, user_id),
  FOREIGN KEY (log_entry_id) REFERENCES cosmic_log_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily status table
CREATE TABLE daily_statuses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  creature_id CHAR(36),
  date DATE NOT NULL,
  emotion_value INTEGER NOT NULL,
  self_description TEXT NOT NULL,
  interaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_daily_emotion_range CHECK (emotion_value >= 0 AND emotion_value <= 100),
  UNIQUE KEY unique_creature_date (creature_id, date),
  FOREIGN KEY (creature_id) REFERENCES creatures(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Memory entries table (for long-term memory)
CREATE TABLE memory_entries (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  conversation_id CHAR(36),
  content TEXT NOT NULL,
  importance INTEGER NOT NULL,
  tags JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_importance_range CHECK (importance >= 0 AND importance <= 10),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for performance
CREATE INDEX idx_creatures_status ON creatures(status);
CREATE INDEX idx_creatures_creator ON creatures(creator_id);
CREATE INDEX idx_creatures_adopter ON creatures(adopter_id);
CREATE INDEX idx_creatures_emotion ON creatures(emotion_value);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_creature ON conversations(creature_id);
CREATE INDEX idx_conversations_affinity ON conversations(affinity_score DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_affinity_scores_score ON affinity_scores(score DESC);
CREATE INDEX idx_cosmic_log_published ON cosmic_log_entries(published_at DESC);
CREATE INDEX idx_daily_statuses_creature_date ON daily_statuses(creature_id, date DESC);
CREATE INDEX idx_memory_entries_conversation ON memory_entries(conversation_id);
CREATE INDEX idx_memory_entries_importance ON memory_entries(importance DESC);
CREATE INDEX idx_adoption_invitations_status ON adoption_invitations(status, created_at DESC);
