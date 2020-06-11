'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const restaurantSchema = Schema({
  _id: { type: Number },
  restaurantId: {type: String, required: true, unique: true},
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  url_db: { type: String, required: true, unique: true }
})

module.exports = mongoose.model('Restaurant', restaurantSchema)