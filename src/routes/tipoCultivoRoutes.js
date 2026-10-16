import express from 'express';
import * as tipoCultivoController from '../controllers/tipoCultivoController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(tipoCultivoController.list));
router.get('/:id', asyncHandler(tipoCultivoController.getById));
router.post('/', asyncHandler(tipoCultivoController.create));

export default router;
