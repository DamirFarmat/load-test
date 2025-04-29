const Router = require('express');
const router = new Router();
const loadController = require("../controllers/loadController");
const checkRole = require("../middleware/checkRoleMiddleware");

router.post('/create', checkRole('ADMIN'), loadController.create);
router.post('/delete', checkRole('ADMIN'), loadController.delete);
router.get('/', loadController.getAll);
router.get('/:id', loadController.getOne);

module.exports = router;