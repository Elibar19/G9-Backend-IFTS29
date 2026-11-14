import express from 'express';
import * as loteController from '../controllers/loteController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(loteController.list));
router.get('/:id', asyncHandler(loteController.getById));
router.get('/:id/observaciones', asyncHandler(loteController.getHistory));
router.post('/', asyncHandler(loteController.create));
router.put('/:id', asyncHandler(loteController.update));
router.delete('/:id', asyncHandler(loteController.delete));

export default router;
