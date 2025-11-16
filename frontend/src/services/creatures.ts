import apiClient from './api';
import { CreatureProfile, ContourData } from '../types/creature';

/**
 * Get creature contour data
 * If contour data doesn't exist, the backend will generate it from the image
 */
export async function getCreatureContour(creatureId: string): Promise<ContourData> {
  console.log(`📡 API Call: GET /api/creatures/${creatureId}/contour`);
  try {
    const contourData = await apiClient.get<ContourData>(
      `/api/creatures/${creatureId}/contour`
    );
    console.log('📡 API Response:', contourData);
    return contourData;
  } catch (error) {
    console.error('📡 API Error:', error);
    throw error;
  }
}

/**
 * Get creature by ID
 */
export async function getCreatureById(creatureId: string): Promise<CreatureProfile> {
  try {
    const creature = await apiClient.get<CreatureProfile>(
      `/api/creatures/${creatureId}`
    );
    return creature;
  } catch (error) {
    console.error('Failed to get creature:', error);
    throw error;
  }
}
