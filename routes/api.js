const express = require('express')
const customerInfo = require('../src/controllers/customerInfo.controller.js')

const router = express.Router()

/* recent phone routes */
router.post('/phone/recent/add', customerInfo.addRecentPhone)
router.post('/phone/recent/list', customerInfo.listRecentPhone)
router.post('/phone/recent/remove', customerInfo.removeRecentPhone)

module.exports = router