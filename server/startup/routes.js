const express = require("express");
const users = require("../routes/users");
const recipes = require("../routes/recipes");
const items = require("../routes/items");
const auth = require("../routes/auth");
const img = require("../routes/img");
const reviews = require("../routes/reviews")
const headers = require("../middleware/headers");

module.exports = (app) => {
  app.use(headers);
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/recipes", recipes);
  app.use("/api/auth", auth);
  app.use("/api/items", items);
  app.use("/api/img", img);
  app.use("/api/reviews", reviews);
};
