const Router = require('express');
const router = new Router();
const labelController = require('../controllers/labelController');

router.get('/', labelController.getAll);
router.delete('/:id', labelController.delete);

module.exports = router; 