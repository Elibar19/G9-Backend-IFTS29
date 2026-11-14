import express from 'express';
import * as tipoCultivoController from '../controllers/tipoCultivoController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireApiAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.use(requireApiAuth());

router.get('/', asyncHandler(tipoCultivoController.list));
router.get('/:id', asyncHandler(tipoCultivoController.getById));
router.post('/', requireApiAuth('admin'), asyncHandler(tipoCultivoController.create));

export default router;
