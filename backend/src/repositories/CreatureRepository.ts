import { query } from '../config/database';
import { Creature, CreateCreatureData } from '../models/Creature';

class CreatureRepository {
  /**
   * Create a new creature
   */
  async create(data: CreateCreatureData): Promise<Creature> {
    // Generate UUID for the new creature
    const uuidResult = await query(`SELECT UUID() as id`);
    const creatureId = uuidResult.rows[0].id;

    const insertQuery = `
      INSERT INTO creatures (
        id, name, species, personality, habitat, backstory,
        image_url, creator_id, emotion_value, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const values = [
      creatureId,
      data.name,
      data.species,
      JSON.stringify(data.personality),
      data.habitat,
      data.backstory,
      data.imageUrl,
      data.creatorId,
      data.emotionValue || 50,
      'drifting',
    ];

    await query(insertQuery, values);

    // Fetch the newly created creature
    const selectQuery = `
      SELECT
        id, name, species, personality, habitat, backstory,
        image_url as imageUrl, creator_id as creatorId,
        adopter_id as adopterId, status, emotion_value as emotionValue,
        created_at as createdAt, adopted_at as adoptedAt
      FROM creatures
      WHERE id = $1
    `;

    const result = await query(selectQuery, [creatureId]);
    const row = result.rows[0];

    return {
      ...row,
      personality: typeof row.personality === 'string'
        ? JSON.parse(row.personality)
        : row.personality,
    };
  }

  /**
   * Find creature by ID
   */
  async findById(id: string): Promise<Creature | null> {
    const selectQuery = `
      SELECT
        id, name, species, personality, habitat, backstory,
        image_url as imageUrl, creator_id as creatorId,
        adopter_id as adopterId, status, emotion_value as emotionValue,
        created_at as createdAt, adopted_at as adoptedAt
      FROM creatures
      WHERE id = $1
    `;

    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      personality: typeof row.personality === 'string'
        ? JSON.parse(row.personality)
        : row.personality,
    };
  }

  /**
   * Find all creatures by creator
   */
  async findByCreator(creatorId: string | null): Promise<Creature[]> {
    if (creatorId === null) {
      // Return all creatures with null creator_id
      const selectQuery = `
        SELECT
          id, name, species, personality, habitat, backstory,
          image_url as imageUrl, creator_id as creatorId,
          adopter_id as adopterId, status, emotion_value as emotionValue,
          created_at as createdAt, adopted_at as adoptedAt
        FROM creatures
        WHERE creator_id IS NULL
        ORDER BY created_at DESC
      `;

      const result = await query(selectQuery, []);

      return result.rows.map((row) => ({
        ...row,
        personality: typeof row.personality === 'string'
          ? JSON.parse(row.personality)
          : row.personality,
      }));
    }

    const selectQuery = `
      SELECT
        id, name, species, personality, habitat, backstory,
        image_url as imageUrl, creator_id as creatorId,
        adopter_id as adopterId, status, emotion_value as emotionValue,
        created_at as createdAt, adopted_at as adoptedAt
      FROM creatures
      WHERE creator_id = $1
      ORDER BY created_at DESC
    `;

    const result = await query(selectQuery, [creatorId]);

    return result.rows.map((row) => ({
      ...row,
      personality: typeof row.personality === 'string'
        ? JSON.parse(row.personality)
        : row.personality,
    }));
  }

  /**
   * Find all drifting creatures (paginated)
   */
  async findDrifting(limit: number = 50, offset: number = 0): Promise<Creature[]> {
    const selectQuery = `
      SELECT
        id, name, species, personality, habitat, backstory,
        image_url as imageUrl, creator_id as creatorId,
        adopter_id as adopterId, status, emotion_value as emotionValue,
        created_at as createdAt, adopted_at as adoptedAt
      FROM creatures
      WHERE status = 'drifting'
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await query(selectQuery, [limit, offset]);

    return result.rows.map((row) => ({
      ...row,
      personality: typeof row.personality === 'string'
        ? JSON.parse(row.personality)
        : row.personality,
    }));
  }

  /**
   * Update creature
   */
  async update(id: string, data: Partial<CreateCreatureData>): Promise<Creature | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.species !== undefined) {
      fields.push(`species = $${paramCount++}`);
      values.push(data.species);
    }
    if (data.personality !== undefined) {
      fields.push(`personality = $${paramCount++}`);
      values.push(JSON.stringify(data.personality));
    }
    if (data.habitat !== undefined) {
      fields.push(`habitat = $${paramCount++}`);
      values.push(data.habitat);
    }
    if (data.backstory !== undefined) {
      fields.push(`backstory = $${paramCount++}`);
      values.push(data.backstory);
    }
    if (data.imageUrl !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(data.imageUrl);
    }
    if (data.emotionValue !== undefined) {
      fields.push(`emotion_value = $${paramCount++}`);
      values.push(data.emotionValue);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const updateQuery = `
      UPDATE creatures
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
    `;

    await query(updateQuery, values);

    // Fetch and return the updated creature
    return this.findById(id);
  }

  /**
   * Delete creature
   */
  async delete(id: string): Promise<boolean> {
    const deleteQuery = 'DELETE FROM creatures WHERE id = $1';
    const result = await query(deleteQuery, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Count total creatures
   */
  async count(status?: 'drifting' | 'adopted'): Promise<number> {
    let countQuery = 'SELECT COUNT(*) as count FROM creatures';
    const values: any[] = [];

    if (status) {
      countQuery += ' WHERE status = $1';
      values.push(status);
    }

    const result = await query(countQuery, values);
    return parseInt(result.rows[0].count, 10);
  }
}

export default new CreatureRepository();
