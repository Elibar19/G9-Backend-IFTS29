const express = require('express');
const productorRoutes = require('./productorRoutes');
const loteRoutes = require('./loteRoutes');
const observacionRoutes = require('./observacionRoutes');
const tecnicoRoutes = require('./tecnicoRoutes');
const tipoCultivoRoutes = require('./tipoCultivoRoutes');
const vistaRoutes = require('./vistaRoutes');

const router = express.Router();

router.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AgroTec API en funcionamiento' });
});

router.use('/api/productores', productorRoutes);
router.use('/api/lotes', loteRoutes);
router.use('/api/observaciones', observacionRoutes);
router.use('/api/tecnicos', tecnicoRoutes);
router.use('/api/tipos-cultivo', tipoCultivoRoutes);
router.use('/', vistaRoutes);

module.exports = router;
