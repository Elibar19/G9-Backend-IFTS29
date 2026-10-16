import express from 'express';
import * as observacionController from '../controllers/observacionController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(observacionController.list));
router.get('/:id', asyncHandler(observacionController.getById));
router.post('/', asyncHandler(observacionController.create));
router.put('/:id', asyncHandler(observacionController.update));
router.delete('/:id', asyncHandler(observacionController.delete));

export default router;
