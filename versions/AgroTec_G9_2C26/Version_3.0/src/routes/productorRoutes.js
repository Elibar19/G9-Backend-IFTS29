import express from 'express';
import * as productorController from '../controllers/productorController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireApiAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.use(requireApiAuth());

router.get('/', asyncHandler(productorController.list));
router.get('/:id', asyncHandler(productorController.getById));
router.get('/:id/lotes', asyncHandler(productorController.listLots));
router.post('/', requireApiAuth('admin'), asyncHandler(productorController.create));
router.put('/:id', requireApiAuth('admin'), asyncHandler(productorController.update));
router.delete('/:id', requireApiAuth('admin'), asyncHandler(productorController.delete));

export default router;
