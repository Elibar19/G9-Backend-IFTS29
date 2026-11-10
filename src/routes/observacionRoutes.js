import express from 'express';
import * as observacionController from '../controllers/observacionController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireApiAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.use(requireApiAuth());

router.get('/', asyncHandler(observacionController.list));
router.get('/:id', asyncHandler(observacionController.getById));
router.post('/', requireApiAuth('admin'), asyncHandler(observacionController.create));
router.put('/:id', requireApiAuth('admin'), asyncHandler(observacionController.update));
// Regla de negocio (RF09): la eliminación siempre responde 403; el middleware deja afuera al no logueado con 401.
router.delete('/:id', requireApiAuth('admin'), asyncHandler(observacionController.delete));

export default router;
