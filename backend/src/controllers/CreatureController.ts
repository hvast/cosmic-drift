import { Request, Response } from 'express';
import CreatureService from '../services/CreatureService';

class CreatureController {
  /**
   * Create a new creature
   * POST /api/creatures
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { imageData, userCustomization } = req.body;
      // TEMPORARILY DISABLED AUTH - Use default test user
      // TODO: Re-enable authentication after core features are working
      const userId = req.user?.id || 'test-user-id';

      // if (!userId) {
      //   res.status(401).json({ error: 'Unauthorized' });
      //   return;
      // }

      if (!imageData) {
        res.status(400).json({ error: 'Image data is required' });
        return;
      }

      const creature = await CreatureService.createCreature(
        { imageData, userCustomization },
        userId
      );

      res.status(201).json(creature);
    } catch (error) {
      console.error('Error in create creature:', error);
      const message = error instanceof Error ? error.message : 'Failed to create creature';
      res.status(500).json({ error: message });
    }
  }

  /**
   * Get creature by ID
   * GET /api/creatures/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const creature = await CreatureService.getCreatureById(id);

      if (!creature) {
        res.status(404).json({ error: 'Creature not found' });
        return;
      }

      res.json(creature);
    } catch (error) {
      console.error('Error in get creature:', error);
      res.status(500).json({ error: 'Failed to get creature' });
    }
  }

  /**
   * Get all creatures (with pagination and filters)
   * GET /api/creatures
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const creatorId = req.query.creatorId as string;

      if (creatorId) {
        const creatures = await CreatureService.getCreaturesByCreator(creatorId);
        res.json({ creatures, total: creatures.length });
        return;
      }

      const result = await CreatureService.getDriftingCreatures(page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error in get creatures:', error);
      res.status(500).json({ error: 'Failed to get creatures' });
    }
  }

  /**
   * Get user's creatures
   * GET /api/creatures/my
   */
  async getMy(req: Request, res: Response): Promise<void> {
    try {
      // TEMPORARILY DISABLED AUTH - Use default test user
      const userId = req.user?.id || 'test-user-id';

      // if (!userId) {
      //   res.status(401).json({ error: 'Unauthorized' });
      //   return;
      // }

      const creatures = await CreatureService.getCreaturesByCreator(userId);
      res.json({ creatures, total: creatures.length });
    } catch (error) {
      console.error('Error in get my creatures:', error);
      res.status(500).json({ error: 'Failed to get creatures' });
    }
  }

  /**
   * Get random creature
   * GET /api/creatures/random
   */
  async getRandom(req: Request, res: Response): Promise<void> {
    try {
      const creature = await CreatureService.getRandomCreature();

      if (!creature) {
        res.status(404).json({ error: 'No creatures available' });
        return;
      }

      res.json(creature);
    } catch (error) {
      console.error('Error in get random creature:', error);
      res.status(500).json({ error: 'Failed to get random creature' });
    }
  }

  /**
   * Update creature
   * PATCH /api/creatures/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, backstory } = req.body;
      // TEMPORARILY DISABLED AUTH - Use default test user
      const userId = req.user?.id || 'test-user-id';

      // if (!userId) {
      //   res.status(401).json({ error: 'Unauthorized' });
      //   return;
      // }

      const creature = await CreatureService.updateCreature(id, userId, {
        name,
        backstory,
      });

      res.json(creature);
    } catch (error) {
      console.error('Error in update creature:', error);
      const message = error instanceof Error ? error.message : 'Failed to update creature';
      
      if (message.includes('not found')) {
        res.status(404).json({ error: message });
      } else if (message.includes('Unauthorized')) {
        res.status(403).json({ error: message });
      } else {
        res.status(500).json({ error: message });
      }
    }
  }

  /**
   * Delete creature
   * DELETE /api/creatures/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // TEMPORARILY DISABLED AUTH - Use default test user
      const userId = req.user?.id || 'test-user-id';

      // if (!userId) {
      //   res.status(401).json({ error: 'Unauthorized' });
      //   return;
      // }

      await CreatureService.deleteCreature(id, userId);

      res.status(204).send();
    } catch (error) {
      console.error('Error in delete creature:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete creature';
      
      if (message.includes('not found')) {
        res.status(404).json({ error: message });
      } else if (message.includes('Unauthorized')) {
        res.status(403).json({ error: message });
      } else {
        res.status(500).json({ error: message });
      }
    }
  }
}

export default new CreatureController();
