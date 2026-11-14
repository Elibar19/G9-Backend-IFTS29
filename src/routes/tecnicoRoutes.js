import express from 'express';
import * as tecnicoController from '../controllers/tecnicoController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireApiAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.use(requireApiAuth());

router.get('/', asyncHandler(tecnicoController.list));
router.get('/:id', asyncHandler(tecnicoController.getById));
router.post('/', requireApiAuth('admin'), asyncHandler(tecnicoController.create));

export default router;
