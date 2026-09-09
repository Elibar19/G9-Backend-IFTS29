const express = require('express');
const vistaController = require('../controllers/vistaController');

const router = express.Router();

router.get('/', vistaController.home);
router.get('/lotes', vistaController.lots);
router.get('/lotes/:id', vistaController.lotDetail);
router.get('/observaciones', vistaController.observations);
router.get('/observaciones/nueva', vistaController.newObservationForm);
router.post('/observaciones', vistaController.createObservation);

module.exports = router;
