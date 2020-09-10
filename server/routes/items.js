const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { Item, validate } = require("../models/item");

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let item = await Item.findOne({ name: req.body.name });
    if (item)
      return res
        .status(400)
        .send("An item with this name already exists in DB.");
  } catch (err) {
    res.status(500).send("Something failed.", err);
  }

  item = new Item(_.pick(req.body, ["name", "category", "price"]));

  try {
    await item.save();
    res.send(item);
  } catch (err) {
    res.status(500).send("Something failed.", err);
  }
});

router.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort("name");
    res.send(items);
  } catch (err) {
    res.status(500).send("Something failed.", err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item)
      return res.status(404).send("The item with the given ID was not found.");

    res.send(item);
  } catch (err) {
    // e.g. id isn't valid mongo ID (e.g. ID isn't 24 chars)
    res.status(500).send("Something failed.", err);
  }
});

module.exports = router;
