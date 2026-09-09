const express = require('express');
const tipoCultivoController = require('../controllers/tipoCultivoController');

const router = express.Router();

router.get('/', tipoCultivoController.list);
router.get('/:id', tipoCultivoController.getById);
router.post('/', tipoCultivoController.create);

module.exports = router;
