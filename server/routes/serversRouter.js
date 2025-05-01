const Router = require('express')
const router = new Router()
const serversController = require("../controllers/serversController")
const checkRole = require("../middleware/checkRoleMiddleware")
const { checkServerStatus, checkServerStatusOne } = require('../controllers/serverStatusController');



router.post('/create', checkRole('ADMIN'), serversController.create)
router.post('/delete', checkRole('ADMIN'), serversController.delete)
router.get('/', serversController.getAll)
router.get('/status', checkServerStatus)
router.get('/:id', serversController.getOne)
router.get('/:id/status', checkServerStatusOne)
router.put('/:id', checkRole('ADMIN'), serversController.update);



module.exports = router