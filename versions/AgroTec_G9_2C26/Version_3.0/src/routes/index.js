import express from 'express';
import authRoutes from './authRoutes.js';
import productorRoutes from './productorRoutes.js';
import loteRoutes from './loteRoutes.js';
import observacionRoutes from './observacionRoutes.js';
import tecnicoRoutes from './tecnicoRoutes.js';
import tipoCultivoRoutes from './tipoCultivoRoutes.js';
import vistaRoutes from './vistaRoutes.js';

const router = express.Router();

router.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AgroTec API en funcionamiento' });
});

router.use('/api/productores', productorRoutes);
router.use('/api/lotes', loteRoutes);
router.use('/api/observaciones', observacionRoutes);
router.use('/api/tecnicos', tecnicoRoutes);
router.use('/api/tipos-cultivo', tipoCultivoRoutes);
router.use('/', authRoutes);
router.use('/', vistaRoutes);

export default router;
