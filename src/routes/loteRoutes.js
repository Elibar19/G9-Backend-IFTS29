import express from 'express';
import * as loteController from '../controllers/loteController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireApiAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.use(requireApiAuth());

router.get('/', asyncHandler(loteController.list));
router.get('/:id', asyncHandler(loteController.getById));
router.get('/:id/observaciones', asyncHandler(loteController.getHistory));
router.post('/', requireApiAuth('admin'), asyncHandler(loteController.create));
router.put('/:id', requireApiAuth('admin'), asyncHandler(loteController.update));
router.delete('/:id', requireApiAuth('admin'), asyncHandler(loteController.delete));

export default router;
