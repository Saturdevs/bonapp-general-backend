'use strict'

const express = require('express')
const restaurantCtrl = require('../controllers/restaurant')
const restaurantRouter = express.Router()
const auth = require('../middlewares/passport')
const passport = require('passport')

restaurantRouter.get('/', restaurantCtrl.getRestaurants)
restaurantRouter.get('/:restaurantId', restaurantCtrl.getRestaurant)
restaurantRouter.get('/byRestaurantId/:restaurantId', restaurantCtrl.getByRestaurantId)
restaurantRouter.post('/', restaurantCtrl.saveRestaurant)
restaurantRouter.put('/:restaurantId', restaurantCtrl.updateRestaurant)
restaurantRouter.delete('/:restaurantId', restaurantCtrl.deleteRestaurant)

module.exports = restaurantRouter