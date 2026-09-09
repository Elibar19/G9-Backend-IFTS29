const express = require('express');
const loteController = require('../controllers/loteController');

const router = express.Router();

router.get('/', loteController.list);
router.get('/:id', loteController.getById);
router.get('/:id/observaciones', loteController.getHistory);
router.post('/', loteController.create);
router.put('/:id', loteController.update);
router.delete('/:id', loteController.delete);

module.exports = router;
