const Router = require('express');
const router = new Router();
const sshController = require('../controllers/sshController');
const checkRole = require("../middleware/checkRoleMiddleware");

router.post('/execute', checkRole('ADMIN'), sshController.executeCommand);
router.post('/execute/:id', checkRole('ADMIN'), sshController.executeCommandForOne);
router.post('/payload', checkRole('ADMIN'), sshController.payloadCommand);


module.exports = router;
