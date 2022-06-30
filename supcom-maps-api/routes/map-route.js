// express
const express = require('express')
// controller
const mapRoutes = require('../controllers/map-controller.js')
// router
const router = express.Router()

// routes
router.route('/').get(mapRoutes.getMaps)
router.route('/:map_id').get(mapRoutes.getMap)

router.route('/refresh').get(mapRoutes.refreshMaps)
router.route('/:map_id/like').put(mapRoutes.likeMap)
router.route('/:map_id/unlike').put(mapRoutes.unlikeMap)

// export
module.exports = router