import ImageAnalysisService from './ImageAnalysisService';
import ProfileGeneratorService from './ProfileGeneratorService';
import StorageService from './StorageService';
import ContourExtractionService from './ContourExtractionService';
import CreatureRepository from '../repositories/CreatureRepository';
import { Creature } from '../models/Creature';
import { CreatureCreationRequest } from '../types/creature';

class CreatureService {
  /**
   * Create a new creature with AI-generated profile
   */
  async createCreature(
    request: CreatureCreationRequest,
    userId: string | null = null
  ): Promise<Creature> {
    const startTime = Date.now();

    try {
      // Step 1: Validate image data
      const validation = StorageService.validateImageData(request.imageData);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Step 2: Save image
      const imageUrl = await StorageService.saveImage(request.imageData, userId || 'anonymous');

      // Step 2.5: Extract contour data from image
      console.log('Extracting contour data from image...');
      const contourData = await ContourExtractionService.extractContour(request.imageData);
      console.log(`Contour extraction completed: ${contourData.points.length} points`);

      // Check if user provided complete manual customization (story is optional)
      const hasCompleteCustomization = request.userCustomization && 
        request.userCustomization.name &&
        request.userCustomization.species &&
        request.userCustomization.habitat;

      let finalProfile;

      if (hasCompleteCustomization) {
        // User provided complete data, skip AI generation
        console.log('Using user-provided complete customization');
        finalProfile = {
          name: request.userCustomization!.name!,
          species: request.userCustomization!.species!,
          personality: request.userCustomization!.personality || [],
          habitat: request.userCustomization!.habitat!,
          backstory: request.userCustomization!.story! || '这个生命的故事尚未被书写...',
          emotionValue: request.userCustomization!.emotionValue,
        };
      } else {
        // Use AI to generate or fill missing fields
        console.log('Using AI to generate profile');
        const analysisResult = await ImageAnalysisService.analyzeImage(request.imageData);
        
        finalProfile = await ProfileGeneratorService.generateProfile(
          analysisResult.visualFeatures,
          analysisResult.suggestedProfile,
          request.userCustomization
        );

        // Validate AI-generated profile
        if (!ProfileGeneratorService.validateProfile(finalProfile)) {
          throw new Error('Generated profile is invalid');
        }
      }

      // Step 3: Save to database
      const creature = await CreatureRepository.create({
        name: finalProfile.name,
        species: finalProfile.species,
        personality: finalProfile.personality,
        habitat: finalProfile.habitat,
        backstory: finalProfile.backstory,
        imageUrl,
        creatorId: userId,
        emotionValue: (finalProfile as any).emotionValue || request.userCustomization?.emotionValue || 50,
        contourData,
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
   * Get or generate contour data for a creature
   * If contour data doesn't exist, extract it from the image and save it
   */
  async getOrGenerateContour(id: string): Promise<any | null> {
    try {
      // Get creature from database
      const creature = await CreatureRepository.findById(id);
      
      if (!creature) {
        console.error(`Creature ${id} not found`);
        return null;
      }

      // If contour data already exists, return it
      if (creature.contourData && creature.contourData.points && creature.contourData.points.length > 0) {
        console.log(`Returning cached contour data for creature ${id}`);
        return creature.contourData;
      }

      // Generate contour data from image
      console.log(`Generating contour data for creature ${id} from image: ${creature.imageUrl}`);
      
      // Extract contour from image URL
      const contourData = await ContourExtractionService.extractContour(creature.imageUrl);
      console.log(`Contour extracted: ${contourData.points.length} points`);

      // Save contour data to database for future use
      await CreatureRepository.updateContourData(id, contourData);
      console.log(`Contour data saved to database for creature ${id}`);

      return contourData;
    } catch (error) {
      console.error(`Error generating contour for creature ${id}:`, error);
      return null;
    }
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
    userId: string | null,
    updates: {
      name?: string;
      backstory?: string;
      emotionValue?: number;
    }
  ): Promise<Creature> {
    // Verify creature exists and user is the creator
    const creature = await CreatureRepository.findById(id);
    if (!creature) {
      throw new Error('Creature not found');
    }

    // Skip authorization check if no user system
    if (userId !== null && creature.creatorId !== userId) {
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
  async deleteCreature(id: string, userId: string | null): Promise<void> {
    // Verify creature exists and user is the creator
    const creature = await CreatureRepository.findById(id);
    if (!creature) {
      throw new Error('Creature not found');
    }

    // Skip authorization check if no user system
    if (userId !== null && creature.creatorId !== userId) {
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
