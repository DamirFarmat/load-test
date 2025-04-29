const Router = require('express')
const router = new Router()
const usersController = require("../controllers/usersController")
const authMiddleware = require("../middleware/authMiddleware")
const checkRole = require("../middleware/checkRoleMiddleware")

router.post('/create', authMiddleware, checkRole('ADMIN'), usersController.createUser);  
router.post('/registration', usersController.registration)
router.post('/login', usersController.login)
router.get('/auth', authMiddleware, usersController.check)
router.post('/change-password', authMiddleware, usersController.changePassword)
router.get('/all', authMiddleware, checkRole('ADMIN'), usersController.getAllUsers)
router.post('/change-role', authMiddleware, checkRole('ADMIN'), usersController.changeRole)
router.post('/delete', authMiddleware, checkRole('ADMIN'), usersController.deleteUser)

module.exports = router