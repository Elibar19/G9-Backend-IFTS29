const express = require('express');
const observacionController = require('../controllers/observacionController');

const router = express.Router();

router.get('/', observacionController.list);
router.get('/:id', observacionController.getById);
router.post('/', observacionController.create);
router.put('/:id', observacionController.update);
router.delete('/:id', observacionController.delete);

module.exports = router;
