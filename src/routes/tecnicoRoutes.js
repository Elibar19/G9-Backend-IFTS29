import express from 'express';
import * as tecnicoController from '../controllers/tecnicoController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(tecnicoController.list));
router.get('/:id', asyncHandler(tecnicoController.getById));
router.post('/', asyncHandler(tecnicoController.create));

export default router;
