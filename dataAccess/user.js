'use strict'
const User = require('../models/user');

//////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////DATA ACCESS METHODS//////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

async function getUserById(userId) {
  try {
    let user = await User.findById(userId).select('-password -salt');
    return user;
  }
  catch (err) {
    handleUserError(err);
  }
}

async function getById(userId) {
  try {
    let user = await User.findById(userId);
    return user;
  }
  catch (err) {
    handleUserError(err);
  }
}

/**
 * @description Recupera el usuario que cumpla con la query dada como parámetro. Si hay mas de uno devuelve 
 * el primero encuentra.
 * @param {JSON} query 
 */
async function getUserByQuery(query) {
  try {
    let user = await User.findOne(query).select('-salt');
    return user;
  }
  catch (err) {
    handleUserError(err);
  }
}

/**
 * @description Guarda el usuario dado como parámetro en la base de datos.
 * @param {User} user
 */
async function save(user) {
  try {
    if (user === null || user === undefined) {
      throw new Error('El usuario que se quiere guardar en la base de datos no puede ser nulo');
    }
    
    console.log("save => user:", user);
    return await user.save();
  } catch (err) {
    handleUserError(err);
  }
}

/**
 * @description Elmina el usuario dado como parámetro de la base de datos.
 * @param {User} user
 * @param {JSON} opts
 */
async function remove(user, opts = {}) {
  try {
    if (user === null || user === undefined) {
      throw new Error('El usuario que se quiere eliminar de la base de datos no puede ser nulo');
    }

    await user.remove(opts);
  } catch (err) {
    handleUserError(err);
  }
}

/**
 * Updetea el usuario en la base de datos segun el id dado.
 * @param {ObjectID} userId 
 * @param {JSON} bodyUpdate 
 * @param {JSON} opts
 */
async function updateUserById(userId, bodyUpdate, opts = {}) {
  try {
    if (userId === null || userId === undefined) {
      throw new Error('El id del usuario a actualizar no puede ser nulo');
    }

    let userUpdated = await User.findByIdAndUpdate(userId, bodyUpdate, opts);
    return userUpdated;
  } catch (err) {
    handleUserError(err);
  }
}

function handleUserError(err) {
  if (err.code === 11000) {
    if (err.keyPattern.email !== null && err.keyPattern.email !== undefined) {
      throw new Error(`El mail ya se encuentra en uso por otro usuario. Ingrese uno distinto por favor.`);
    } else {
      throw new Error(err.message);
    }
  } else {
    throw new Error(err.message);
  }
}

module.exports = {
  getUserById,
  getUserByQuery,
  save,
  remove,
  getById,
  updateUserById
}