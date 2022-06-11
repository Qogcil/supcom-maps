// express
const express = require('express')
// controller
const mapRoutes = require('../controllers/map-controller.js')
// router
const router = express.Router()

// routes
router.route('/').get(mapRoutes.getMaps)

router.route('/refresh').get(mapRoutes.refreshMaps)

// export
module.exports = router