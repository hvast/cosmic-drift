import { query } from '../config/database';
import { User, CreateUserDTO, UpdateUserDTO, UserStats } from '../models/User';

export class UserRepository {
  async create(userData: CreateUserDTO & { passwordHash: string }): Promise<User> {
    const { username, email, passwordHash, role = 'explorer' } = userData;

    // Generate UUID for the new user
    const uuidResult = await query(`SELECT UUID() as id`);
    const userId = uuidResult.rows[0].id;

    // Insert the user with the generated UUID
    await query(
      `INSERT INTO users (id, username, email, password_hash, role, created_at, last_active_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [userId, username, email, passwordHash, role]
    );

    // Fetch the newly created user
    const result = await query(
      `SELECT id, username, email, password_hash as passwordHash, avatar, role,
              created_at as createdAt, last_active_at as lastActiveAt
       FROM users WHERE id = $1`,
      [userId]
    );

    const user = result.rows[0];
    user.stats = {
      creaturesCreated: 0,
      conversationsStarted: 0,
      adoptedCreatures: []
    };

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const result = await query(
      `SELECT u.id, u.username, u.email, u.password_hash as passwordHash, u.avatar, u.role,
              u.created_at as createdAt, u.last_active_at as lastActiveAt,
              COUNT(DISTINCT c.id) as creatures_created,
              COUNT(DISTINCT conv.id) as conversations_started,
              COALESCE(
                JSON_ARRAYAGG(
                  CASE WHEN cr.adopter_id = u.id THEN cr.id ELSE NULL END
                ),
                JSON_ARRAY()
              ) as adopted_creatures
       FROM users u
       LEFT JOIN creatures c ON c.creator_id = u.id
       LEFT JOIN conversations conv ON conv.user_id = u.id
       LEFT JOIN creatures cr ON cr.adopter_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return this.mapRowToUser(row);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      `SELECT u.id, u.username, u.email, u.password_hash as passwordHash, u.avatar, u.role,
              u.created_at as createdAt, u.last_active_at as lastActiveAt,
              COUNT(DISTINCT c.id) as creatures_created,
              COUNT(DISTINCT conv.id) as conversations_started,
              COALESCE(
                JSON_ARRAYAGG(
                  CASE WHEN cr.adopter_id = u.id THEN cr.id ELSE NULL END
                ),
                JSON_ARRAY()
              ) as adopted_creatures
       FROM users u
       LEFT JOIN creatures c ON c.creator_id = u.id
       LEFT JOIN conversations conv ON conv.user_id = u.id
       LEFT JOIN creatures cr ON cr.adopter_id = u.id
       WHERE u.email = $1
       GROUP BY u.id`,
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return this.mapRowToUser(row);
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await query(
      `SELECT u.id, u.username, u.email, u.password_hash as passwordHash, u.avatar, u.role,
              u.created_at as createdAt, u.last_active_at as lastActiveAt,
              COUNT(DISTINCT c.id) as creatures_created,
              COUNT(DISTINCT conv.id) as conversations_started,
              COALESCE(
                JSON_ARRAYAGG(
                  CASE WHEN cr.adopter_id = u.id THEN cr.id ELSE NULL END
                ),
                JSON_ARRAY()
              ) as adopted_creatures
       FROM users u
       LEFT JOIN creatures c ON c.creator_id = u.id
       LEFT JOIN conversations conv ON conv.user_id = u.id
       LEFT JOIN creatures cr ON cr.adopter_id = u.id
       WHERE u.username = $1
       GROUP BY u.id`,
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return this.mapRowToUser(row);
  }

  async update(id: string, userData: UpdateUserDTO): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.username !== undefined) {
      fields.push(`username = $${paramCount++}`);
      values.push(userData.username);
    }
    if (userData.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }
    if (userData.avatar !== undefined) {
      fields.push(`avatar = $${paramCount++}`);
      values.push(userData.avatar);
    }
    if (userData.lastActiveAt !== undefined) {
      fields.push(`last_active_at = $${paramCount++}`);
      values.push(userData.lastActiveAt);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    return this.findById(id);
  }

  async updateLastActive(id: string): Promise<void> {
    await query(
      `UPDATE users SET last_active_at = NOW() WHERE id = $1`,
      [id]
    );
  }

  async emailExists(email: string): Promise<boolean> {
    const result = await query(
      `SELECT 1 FROM users WHERE email = $1`,
      [email]
    );
    return result.rows.length > 0;
  }

  async usernameExists(username: string): Promise<boolean> {
    const result = await query(
      `SELECT 1 FROM users WHERE username = $1`,
      [username]
    );
    return result.rows.length > 0;
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.passwordHash,
      avatar: row.avatar,
      role: row.role,
      createdAt: row.createdAt,
      lastActiveAt: row.lastActiveAt,
      stats: {
        creaturesCreated: parseInt(row.creatures_created) || 0,
        conversationsStarted: parseInt(row.conversations_started) || 0,
        adoptedCreatures: row.adopted_creatures || []
      }
    };
  }
}
