import { Request, Response } from 'express';
import ContourExtractionService from '../services/ContourExtractionService';

class ContourController {
  /**
   * Extract contour from image
   * POST /api/contour/extract
   */
  async extractContour(req: Request, res: Response): Promise<void> {
    try {
      const { imageData } = req.body;

      if (!imageData) {
        res.status(400).json({ error: 'Image data is required' });
        return;
      }

      console.log('Extracting contour from image data...');
      
      // Call ContourExtractionService to extract contour
      const contourData = await ContourExtractionService.extractContour(imageData);

      console.log(`Contour extraction successful: ${contourData.points.length} points`);

      // Return contour data as JSON
      res.json({
        success: true,
        contourData: {
          points: contourData.points,
          boundingBox: contourData.boundingBox,
          pointCount: contourData.points.length,
        },
      });
    } catch (error) {
      console.error('Error in extract contour:', error);
      const message = error instanceof Error ? error.message : 'Failed to extract contour';
      res.status(500).json({ 
        success: false,
        error: message 
      });
    }
  }
}

export default new ContourController();
