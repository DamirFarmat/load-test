const Router = require('express');
const router = new Router();
const monitoringController = require('../controllers/monitoringController');

router.post('/monitor', monitoringController.monitor);

module.exports = router;