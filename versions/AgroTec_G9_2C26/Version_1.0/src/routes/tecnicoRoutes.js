const express = require('express');
const tecnicoController = require('../controllers/tecnicoController');

const router = express.Router();

router.get('/', tecnicoController.list);
router.get('/:id', tecnicoController.getById);
router.post('/', tecnicoController.create);

module.exports = router;
