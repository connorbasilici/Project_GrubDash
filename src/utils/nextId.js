// Exports the nextId function. Use this function anytime you need to assign a new id. You will not need to make changes to this file.

/*
 * Anytime you need to assign a new id to an order or dish, use the nextId function exported from src/utils/nextId.js
 */

const crypto = require("crypto");

function nextId() {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = nextId;
