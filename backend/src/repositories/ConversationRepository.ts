import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { Conversation, CreateConversationData, Message, CreateMessageData } from '../models/Conversation';

export class ConversationRepository {
  /**
   * 创建新对话
   */
  async create(data: CreateConversationData): Promise<Conversation> {
    const connection = await pool.getConnection();
    try {
      const id = this.generateId();
      const now = new Date();

      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO conversations 
        (id, user_id, creature_id, memory_type, affinity_score, started_at, last_message_at, message_count, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.userId,
          data.creatureId,
          data.memoryType || 'temporary',
          0,
          now,
          now,
          0,
          false
        ]
      );

      return {
        id,
        userId: data.userId,
        creatureId: data.creatureId,
        memoryType: data.memoryType || 'temporary',
        affinityScore: 0,
        startedAt: now,
        lastMessageAt: now,
        messageCount: 0,
        isPublished: false
      };
    } finally {
      connection.release();
    }
  }

  /**
   * 查找用户与生物之间的对话
   */
  async findByUserAndCreature(userId: string, creatureId: string): Promise<Conversation | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM conversations 
         WHERE user_id = ? AND creature_id = ?
         ORDER BY last_message_at DESC
         LIMIT 1`,
        [userId, creatureId]
      );

      if (rows.length === 0) return null;

      return this.mapRowToConversation(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * 根据ID查找对话
   */
  async findById(id: string): Promise<Conversation | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM conversations WHERE id = ?',
        [id]
      );

      if (rows.length === 0) return null;

      return this.mapRowToConversation(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * 更新对话
   */
  async update(id: string, updates: Partial<Conversation>): Promise<void> {
    const connection = await pool.getConnection();
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.affinityScore !== undefined) {
        fields.push('affinity_score = ?');
        values.push(updates.affinityScore);
      }
      if (updates.lastMessageAt !== undefined) {
        fields.push('last_message_at = ?');
        values.push(updates.lastMessageAt);
      }
      if (updates.messageCount !== undefined) {
        fields.push('message_count = ?');
        values.push(updates.messageCount);
      }
      if (updates.memoryType !== undefined) {
        fields.push('memory_type = ?');
        values.push(updates.memoryType);
      }
      if (updates.isPublished !== undefined) {
        fields.push('is_published = ?');
        values.push(updates.isPublished);
      }

      if (fields.length === 0) return;

      values.push(id);

      await connection.execute(
        `UPDATE conversations SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    } finally {
      connection.release();
    }
  }

  /**
   * 创建消息
   */
  async createMessage(data: CreateMessageData): Promise<Message> {
    const connection = await pool.getConnection();
    try {
      const id = this.generateId();
      const now = new Date();

      await connection.execute<ResultSetHeader>(
        `INSERT INTO messages 
        (id, conversation_id, sender_id, sender_type, content, sentiment, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.conversationId,
          data.senderId,
          data.senderType,
          data.content,
          data.sentiment ? JSON.stringify(data.sentiment) : null,
          now
        ]
      );

      // 更新对话的最后消息时间和消息计数
      await connection.execute(
        `UPDATE conversations 
         SET last_message_at = ?, message_count = message_count + 1
         WHERE id = ?`,
        [now, data.conversationId]
      );

      return {
        id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderType: data.senderType,
        content: data.content,
        timestamp: now,
        sentiment: data.sentiment
      };
    } finally {
      connection.release();
    }
  }

  /**
   * 获取对话的消息列表
   */
  async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM messages 
         WHERE conversation_id = ?
         ORDER BY timestamp ASC
         LIMIT ${limit}`,
        [conversationId]
      );

      return rows.map(row => this.mapRowToMessage(row));
    } finally {
      connection.release();
    }
  }

  /**
   * 获取最近的消息（用于上下文）
   */
  async getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM messages 
         WHERE conversation_id = ?
         ORDER BY timestamp DESC
         LIMIT ${limit}`,
        [conversationId]
      );

      return rows.map(row => this.mapRowToMessage(row)).reverse();
    } finally {
      connection.release();
    }
  }

  /**
   * 获取用户的所有对话
   */
  async findByUserId(userId: string, limit: number = 20): Promise<Conversation[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM conversations 
         WHERE user_id = ?
         ORDER BY last_message_at DESC
         LIMIT ${limit}`,
        [userId]
      );

      return rows.map(row => this.mapRowToConversation(row));
    } finally {
      connection.release();
    }
  }

  /**
   * 删除对话及其所有消息
   */
  async delete(id: string): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 删除所有消息
      await connection.execute('DELETE FROM messages WHERE conversation_id = ?', [id]);

      // 删除对话
      await connection.execute('DELETE FROM conversations WHERE id = ?', [id]);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private mapRowToConversation(row: RowDataPacket): Conversation {
    return {
      id: row.id,
      userId: row.user_id,
      creatureId: row.creature_id,
      memoryType: row.memory_type,
      affinityScore: parseFloat(row.affinity_score),
      startedAt: new Date(row.started_at),
      lastMessageAt: new Date(row.last_message_at),
      messageCount: row.message_count,
      isPublished: Boolean(row.is_published)
    };
  }

  private mapRowToMessage(row: RowDataPacket): Message {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      senderType: row.sender_type,
      content: row.content,
      timestamp: new Date(row.timestamp),
      sentiment: row.sentiment ? JSON.parse(row.sentiment) : undefined
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
