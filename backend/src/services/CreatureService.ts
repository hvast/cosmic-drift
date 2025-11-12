import ImageAnalysisService from './ImageAnalysisService';
import ProfileGeneratorService from './ProfileGeneratorService';
import StorageService from './StorageService';
import CreatureRepository from '../repositories/CreatureRepository';
import { Creature } from '../models/Creature';
import { CreatureCreationRequest } from '../types/creature';

class CreatureService {
  /**
   * Create a new creature with AI-generated profile
   */
  async createCreature(
    request: CreatureCreationRequest,
    userId: string
  ): Promise<Creature> {
    const startTime = Date.now();

    try {
      // Step 1: Validate image data
      const validation = StorageService.validateImageData(request.imageData);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Step 2: Analyze image (parallel with storage)
      const [analysisResult, imageUrl] = await Promise.all([
        ImageAnalysisService.analyzeImage(request.imageData),
        StorageService.saveImage(request.imageData, userId),
      ]);

      // Step 3: Generate profile using AI
      const generatedProfile = await ProfileGeneratorService.generateProfile(
        analysisResult.visualFeatures,
        analysisResult.suggestedProfile,
        request.userCustomization
      );

      // Validate profile
      if (!ProfileGeneratorService.validateProfile(generatedProfile)) {
        throw new Error('Generated profile is invalid');
      }

      // Step 4: Save to database
      const creature = await CreatureRepository.create({
        name: generatedProfile.name,
        species: generatedProfile.species,
        personality: generatedProfile.personality,
        habitat: generatedProfile.habitat,
        backstory: generatedProfile.backstory,
        imageUrl,
        creatorId: userId,
        emotionValue: 50,
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      console.log(`Creature created successfully in ${processingTime}ms`);

      // Log warning if processing took too long
      if (processingTime > 10000) {
        console.warn(`Creature creation took ${processingTime}ms, exceeding 10s target`);
      }

      return creature;
    } catch (error) {
      console.error('Error creating creature:', error);
      throw error;
    }
  }

  /**
   * Get creature by ID
   */
  async getCreatureById(id: string): Promise<Creature | null> {
    return CreatureRepository.findById(id);
  }

  /**
   * Get creatures by creator
   */
  async getCreaturesByCreator(creatorId: string): Promise<Creature[]> {
    return CreatureRepository.findByCreator(creatorId);
  }

  /**
   * Get drifting creatures (paginated)
   */
  async getDriftingCreatures(page: number = 1, limit: number = 50): Promise<{
    creatures: Creature[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const [creatures, total] = await Promise.all([
      CreatureRepository.findDrifting(limit, offset),
      CreatureRepository.count('drifting'),
    ]);

    return {
      creatures,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update creature profile
   */
  async updateCreature(
    id: string,
    userId: string,
    updates: {
      name?: string;
      backstory?: string;
    }
  ): Promise<Creature> {
    // Verify creature exists and user is the creator
    const creature = await CreatureRepository.findById(id);
    if (!creature) {
      throw new Error('Creature not found');
    }

    if (creature.creatorId !== userId) {
      throw new Error('Unauthorized: You can only update your own creatures');
    }

    // Update creature
    const updated = await CreatureRepository.update(id, updates);
    if (!updated) {
      throw new Error('Failed to update creature');
    }

    return updated;
  }

  /**
   * Delete creature
   */
  async deleteCreature(id: string, userId: string): Promise<void> {
    // Verify creature exists and user is the creator
    const creature = await CreatureRepository.findById(id);
    if (!creature) {
      throw new Error('Creature not found');
    }

    if (creature.creatorId !== userId) {
      throw new Error('Unauthorized: You can only delete your own creatures');
    }

    const deleted = await CreatureRepository.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete creature');
    }
  }

  /**
   * Get random creature for encounter
   */
  async getRandomCreature(): Promise<Creature | null> {
    const creatures = await CreatureRepository.findDrifting(100, 0);
    if (creatures.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * creatures.length);
    return creatures[randomIndex];
  }
}

export default new CreatureService();
