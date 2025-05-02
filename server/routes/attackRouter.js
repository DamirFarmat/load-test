const Router = require('express');
const router = new Router();
const attackController = require("../controllers/attackController");
const checkRole = require("../middleware/checkRoleMiddleware");
const startAttackController = require("../controllers/startAttackController");

router.post('/create', checkRole('ADMIN'), attackController.create);
router.post('/delete', checkRole('ADMIN'), attackController.delete);
router.get('/', attackController.getAll);
router.get('/:id', attackController.getOne);
router.post('/start', checkRole('ADMIN'), startAttackController.startAttack);
router.post('/stop', checkRole('ADMIN'), startAttackController.stopAttack);
router.post('/save-chart', checkRole('ADMIN'), attackController.saveChart);
router.put('/edit', checkRole('ADMIN'), attackController.update);
router.post('/duplicate', checkRole('ADMIN'), attackController.duplicate);

module.exports = router;