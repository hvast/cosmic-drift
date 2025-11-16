import api from './api';
import { CreatureProfile, CreatureCreationRequest } from '../types/creature';

export const creatureService = {
  /**
   * Create a new creature
   */
  async createCreature(request: CreatureCreationRequest): Promise<CreatureProfile> {
    // TEMPORARILY DISABLED AUTH FOR TESTING
    return await api.post<CreatureProfile>('/api/creatures', request, false);
  },

  /**
   * Get creature by ID
   */
  async getCreatureById(id: string): Promise<CreatureProfile> {
    return await api.get<CreatureProfile>(`/api/creatures/${id}`);
  },

  /**
   * Get all creatures (with pagination)
   */
  async getCreatures(page: number = 1, limit: number = 50): Promise<{
    creatures: CreatureProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return await api.get<any>(`/api/creatures?page=${page}&limit=${limit}`);
  },

  /**
   * Get user's creatures
   */
  async getMyCreatures(): Promise<{ creatures: CreatureProfile[]; total: number }> {
    // TEMPORARILY DISABLED AUTH FOR TESTING
    return await api.get<any>('/api/creatures/my/list', false);
  },

  /**
   * Get random creature
   */
  async getRandomCreature(): Promise<CreatureProfile> {
    return await api.get<CreatureProfile>('/api/creatures/random');
  },

  /**
   * Update creature
   */
  async updateCreature(
    id: string,
    updates: { name?: string; backstory?: string; emotionValue?: number }
  ): Promise<CreatureProfile> {
    // TEMPORARILY DISABLED AUTH FOR TESTING
    return await api.put<CreatureProfile>(`/api/creatures/${id}`, updates, false);
  },

  /**
   * Delete creature
   */
  async deleteCreature(id: string): Promise<void> {
    // TEMPORARILY DISABLED AUTH FOR TESTING
    await api.delete<void>(`/api/creatures/${id}`, false);
  },

  /**
   * Get contour data for a creature (if not already loaded)
   * This is useful for lazy loading contour data
   */
  async getCreatureContour(id: string): Promise<{ contourData: any }> {
    const creature = await this.getCreatureById(id);
    return { contourData: creature.contourData };
  },
};

export default creatureService;
