const Router = require('express')
const router = new Router()

const usersRouter = require('./usersRouter.js')
const serversRouter = require('./serversRouter.js')
const sshRouter = require('./sshRouter.js')
const attackRouter = require('./attackRouter.js')
const loadRouter = require('./loadRouter.js')
const monitoringRouter = require('./monitorRouter')
const labelRouter = require('./labelRouter')

router.use('/user', usersRouter)
router.use('/servers', serversRouter)
router.use('/ssh', sshRouter)
router.use('/attack', attackRouter)
router.use('/load', loadRouter)
router.use('/monitoring', monitoringRouter)
router.use('/label', labelRouter)

module.exports = router