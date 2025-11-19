-- 插入测试用户
-- 密码: test123 (已加密)
INSERT INTO users (
  id, 
  username, 
  email, 
  password_hash, 
  role, 
  created_at, 
  last_active_at
) VALUES (
  'test-user-id',
  'testuser',
  'test@example.com',
  '$2b$10$YourHashedPasswordHere',  -- 需要替换为实际的bcrypt哈希
  'explorer',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE id=id;

-- 初始化用户统计数据
INSERT INTO user_stats (
  user_id,
  creatures_created,
  conversations_started,
  adopted_creatures
) VALUES (
  'test-user-id',
  0,
  0,
  '[]'
) ON DUPLICATE KEY UPDATE user_id=user_id;
