import { Router } from 'express';
import CreatureController from '../controllers/CreatureController';
import { authenticate } from '../middleware/auth';
import { validateCreateCreature, validateUpdateCreature } from '../validators/creatureValidator';

const router = Router();

// Public routes
router.get('/', CreatureController.getAll.bind(CreatureController));
router.get('/random', CreatureController.getRandom.bind(CreatureController));
router.get('/:id', CreatureController.getById.bind(CreatureController));

// Protected routes - TEMPORARILY DISABLED AUTH FOR TESTING
// TODO: Re-enable authentication after core features are working
router.post('/', /* authenticate, */ validateCreateCreature, CreatureController.create.bind(CreatureController));
router.get('/my/list', /* authenticate, */ CreatureController.getMy.bind(CreatureController));
router.patch('/:id', /* authenticate, */ validateUpdateCreature, CreatureController.update.bind(CreatureController));
router.put('/:id', /* authenticate, */ validateUpdateCreature, CreatureController.update.bind(CreatureController)); // 同时支持 PUT
router.delete('/:id', /* authenticate, */ CreatureController.delete.bind(CreatureController));

export default router;
