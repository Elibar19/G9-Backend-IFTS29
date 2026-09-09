const express = require('express');
const productorController = require('../controllers/productorController');

const router = express.Router();

router.get('/', productorController.list);
router.get('/:id', productorController.getById);
router.get('/:id/lotes', productorController.listLots);
router.post('/', productorController.create);
router.put('/:id', productorController.update);
router.delete('/:id', productorController.delete);

module.exports = router;
