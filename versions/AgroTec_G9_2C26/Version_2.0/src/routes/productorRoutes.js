import express from 'express';
import * as productorController from '../controllers/productorController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(productorController.list));
router.get('/:id', asyncHandler(productorController.getById));
router.get('/:id/lotes', asyncHandler(productorController.listLots));
router.post('/', asyncHandler(productorController.create));
router.put('/:id', asyncHandler(productorController.update));
router.delete('/:id', asyncHandler(productorController.delete));

export default router;
