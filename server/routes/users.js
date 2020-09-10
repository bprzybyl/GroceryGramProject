const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const { Recipe } = require("../models/recipe");
const { Review } = require("../models/review");
const mongoose = require("mongoose");

// create new user
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (user)
    return res
      .status(400)
      .send("A user with this email address is already registered.");

  user = await User.findOne({ username: req.body.username });
  if (user)
    return res
      .status(400)
      .send("A user with this username is already registered.");

  user = new User(_.pick(req.body, ["username", "email", "password"]));
  user.email = user.email.toLowerCase();
  user.addedItems = [];
  user.removedItems = [];
  user.itemCounts = [];
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(
      _.pick(user, [
        "_id",
        "username",
        "email",
        "addedItems",
        "removedItems",
        "itemCounts",
      ])
    );
});

router.post("/:id/items", auth, async (req, res) => {
  const { itemsToAdd } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { addedItems: itemsToAdd } }
    );
    res.sendStatus(201);
  } catch (err) {
    // id isn't valid mongo ID (e.g. ID isn't 24 chars)
    console.log("/get/:id Error:", err);
    res.status(500).send("Something failed.");
  }
});

// update given user's properties with properties sent in request body
router.patch("/:id", auth, async (req, res) => {
  const { error } = validate(req.body, true); // ignore required
  if (error) return res.status(400).send(error.details[0].message);

  // for email change: ensure requested email is unique in db
  if (req.body.email) {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user)
      return res
        .status(400)
        .send("A user with this email address is already registered.");
  }

  // for username change: ensure requested username is unique in db
  if (req.body.username) {
    const user = await User.findOne({ username: req.body.username });
    if (user)
      return res
        .status(400)
        .send("A user with this username is already registered.");
  }

  // make requested updates to user
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!user)
      return res.status(404).send("The user with the given ID was not found.");

    // Convert MongooseDB Object to JSON Object
    var userJSON = user.toObject();

    // Need to remove password key from output
    delete userJSON.password;

    // Add new JWT if user profile image was updated
    if (req.body.hasOwnProperty("profileImageUrl")) {
      newToken = await user.generateAuthToken();
      return res
        .header("x-auth-token", newToken)
        .header("access-control-expose-headers", "x-auth-token")
        .json(userJSON);
    }

    res.json(userJSON);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something failed");
  }
});

// get all users
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find().sort("username");
    res.send(
      _.map(
        users,
        _.partialRight(_.pick, [
          "_id",
          "username",
          "email",
          "addedItems",
          "removedItems",
          "itemCounts",
          "savedRecipes",
          "reviews",
        ])
      )
    );
  } catch (err) {
    res.status(500).send("Something failed");
  }
});

// get user with given id
router.get("/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).send("The user with the given ID was not found.");

    // Convert user object to JSON
    user = user.toJSON();

    if (!user.hasOwnProperty("profileImageUrl")) {
      user.profileImageUrl = "";
    }

    res.send(
      _.pick(user, [
        "_id",
        "username",
        "email",
        "addedItems",
        "removedItems",
        "itemCounts",
        "savedRecipes",
        "profileImageUrl",
      ])
    );
  } catch (err) {
    // id isn't valid mongo ID (e.g. ID isn't 24 chars)
    console.log("/get/:id Error:", err);
    res.status(500).send("Something failed.");
  }
});

// get all recipes for user with given id
router.get("/:id/recipes", auth, async (req, res) => {
  try {
    // check to make sure the user exists
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).send("The user with the given ID was not found.");

    // convert array of id strings to mongoose ObjectIds
    let ids = [...user.savedRecipes];
    ids = ids.map((id) => {
      return mongoose.Types.ObjectId(id);
    });

    const recipes = await Recipe.aggregate([
      // match recipes either created or saved by the user
      {
        $match: {
          $or: [
            { userId: mongoose.Types.ObjectId(user._id) },
            { _id: { $in: ids } },
          ],
        },
      },
      { $unwind: "$ingredients" },
      // lookup item in ingredients and return full object with response
      {
        $lookup: {
          from: "items",
          localField: "ingredients.itemId",
          foreignField: "_id",
          as: "ingredients.item", // this is the name of the new property to hold the item object
        },
      },
      // converts newly added 'item' property to a single object instead of an object array
      { $unwind: "$ingredients.item" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          avgRating: 1,
          numReviews: 1,
          isPublished: 1,
          userId: 1,
          category: 1,
          images: 1,
          instructions: 1,
          title: 1,
          ingredients: 1,
          createdOn: 1,
          "user.username": 1,
          "user._id": 1,
        },
      },
      // group everythign back together again into a single parent object
      {
        $group: {
          _id: "$_id",
          root: { $mergeObjects: "$$ROOT" },
          ingredients: { $push: "$ingredients" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$root", "$$ROOT"],
          },
        },
      },
      {
        $project: {
          root: 0,
        },
      },
    ]);

    res.send(recipes);
  } catch (err) {
    res.status(500).send("Something failed.");
  }
});

router.get("/:userId/reviews", auth, async (req, res) => {
  let user = await User.findById(req.params.userId);
  if (!user) return res.status(404).send("The userId could not be found.");

  let reviews = await Review.aggregate([
    { $match: { _id: { $in: user.reviews } } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "recipes",
        localField: "recipeId",
        foreignField: "_id",
        as: "recipe",
      },
    },
    {
      $project: {
        "user.password": 0,
        "user.addedItems": 0,
        "user.removedItems": 0,
        "user.email": 0,
        "user.itemCounts": 0,
        "user.date": 0,
        "user.reviews": 0,
        "user.savedRecipes": 0,
        "user.profileImageUrl": 0,
        "recipe.avgRating": 0,
        "recipe.numReviews": 0,
        "recipe.isPublished": 0,
        "recipe.userId": 0,
        "recipe.category": 0,
        "recipe.images": 0,
        "recipe.ingredients": 0,
        "recipe.reviews": 0,
        "recipe.instructions": 0,
        "recipe.createdOn": 0,
      },
    },
    { $unwind: "$user" },
    { $unwind: "$recipe" },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$user", "$$ROOT"],
        },
      },
    },
    { $project: { user: 0 } },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$recipe", "$$ROOT"],
        },
      },
    },
    { $project: { recipe: 0 } },
  ]);

  reviews.forEach((review) => {
    review.recipeTitle = review.title;
    delete review.title;
  });

  res.json(reviews);
});

module.exports = router;
