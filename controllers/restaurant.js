'use strict'

const Restaurant = require('../models/restaurant')

function getRestaurants (req, res) {
  Restaurant.find({}, (err, restaurants) => {
    if (err) return res.status(500).send({ message: `Error al realizar la petición al servidor ${err}`})
    if (!restaurants) return res.status(404).send({ message: `No existen bares registrados en la base de datos.`})

    res.status(200).send({ restaurants })
  })
}

function getRestaurant (req, res) {
  let restaurantId = req.params.restaurantId

  Restaurant.findById(restaurantId, (err, restaurant) => {
    if (err) return res.status(500).send({ message: `Error al realizar la petición al servidor ${err}`})
    if (!restaurant) return res.status(404).send({ message: `El bar ${restaurantId} no existe`})

    res.status(200).send({ restaurant }) //Cuando la clave y el valor son iguales
  })
}

function saveRestaurant (req, res) {
  console.log('POST /api/restaurant')
  console.log(req.body)

  let restaurant = new Restaurant()
  restaurant._id = req.body.id
  restaurant.name = req.body.name
  restaurant.phone = req.body.phone
  restaurant.address = req.body.address
  restaurant.url_db = req.body.url_db

  restaurant.save((err, restaurantStored) => {
    if(err) return res.status(500).send({ message: `Error al guardar en la base de datos: ${err}` })

    res.status(200).send({ restaurant: restaurantStored })
  })
}

function updateRestaurant (req, res) {
  let restaurantId = req.params.restaurantId
  let bodyUpdate = req.body

  Restaurant.findByIdAndUpdate(restaurantId, bodyUpdate, (err, restaurantUpdated) => {
    if (err) return res.status(500).send({ message: `Error al querer actualizar el bar: ${err}`})

    res.status(200).send({ restaurant: restaurantUpdated })
  })
}

function deleteRestaurant (req, res) {
  let restaurantId = req.params.restaurantId

  Restaurant.findById(restaurantId, (err, restaurant) => {
    if (err) return res.status(500).send({ message: `Error al querer borrar el bar: ${err}`})

    restaurant.remove(err => {
      if (err) return res.status(500).send({ message: `Error al querer borrar el bar: ${err}`})
      res.status(200).send({message: `El bar ha sido eliminado de la base de datos`})
    })
  })
}

module.exports = {
  getRestaurant,
  getRestaurants,
  saveRestaurant,
  updateRestaurant,
  deleteRestaurant
}