import express from 'express';
import * as vistaController from '../controllers/vistaController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireLogin, requireRole } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/', requireLogin, asyncHandler(vistaController.home));
router.get('/lotes', requireLogin, asyncHandler(vistaController.lots));
router.get('/lotes/:id', requireLogin, asyncHandler(vistaController.lotDetail));
router.get('/observaciones', requireLogin, asyncHandler(vistaController.observations));
router.get('/observaciones/nueva', requireLogin, requireRole('admin'), asyncHandler(vistaController.newObservationForm));
router.post('/observaciones', requireLogin, requireRole('admin'), asyncHandler(vistaController.createObservation));

export default router;
