'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { BUSINESS_TYPES } = require('../shared/enums');

const restaurantSchema = Schema({
  _id: { type: Number },
  restaurantId: {type: String, required: true, unique: true},
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  url_db: { type: String, required: true, unique: true },
  businessType: { type: String, required: true, enum: [BUSINESS_TYPES.BAR, BUSINESS_TYPES.HOTEL] }
})

module.exports = mongoose.model('Restaurant', restaurantSchema)