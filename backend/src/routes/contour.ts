import { Router } from 'express';
import ContourController from '../controllers/ContourController';
import { validateExtractContour } from '../validators/contourValidator';

const router = Router();

// POST /api/contour/extract - Extract contour from image
router.post('/extract', validateExtractContour, ContourController.extractContour.bind(ContourController));

export default router;
