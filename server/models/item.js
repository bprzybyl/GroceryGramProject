const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  name: { type: String, min: 2, max: 255, unique: true, required: true },
  category: { type: String, min: 2, max: 64, required: true },
  price: { type: Number, min: 0, max: 10000, required: true },
});

const Item = mongoose.model("Item", itemSchema);

validateItem = (item) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    category: Joi.string().min(2).max(64).required(),
    price: Joi.number().min(0).max(10000).required(),
  });
  return schema.validate(item);
};

exports.Item = Item;
exports.validate = validateItem;
