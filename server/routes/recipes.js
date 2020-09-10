const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const _ = require("lodash");
const { Recipe, validate } = require("../models/recipe");
const { User } = require("../models/user");
const { Review } = require("../models/review");
const mongoose = require("mongoose");

// get all PUBLISHED recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.aggregate([
      { $match: { isPublished: true } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
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
          "user.savedRecipes": 0,
        },
      },
    ]);

    res.send(recipes);
  } catch (err) {
    res.status(500).send("Something failed");
  }
});

// get given recipe, ingredient item objects re
router.get("/:id", async (req, res) => {
  let recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).send("The recipeId could not be found.");

  try {
    // build aggregate pipeline to embed item object in ingredients array object
    recipe = await Recipe.aggregate([
      // filter to single result
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },

      // split into to multiple recipes with a single ingredient each
      { $unwind: "$ingredients" },

      // look up the item object and embed as new property 'item' in ingredients object
      {
        $lookup: {
          from: "items",
          localField: "ingredients.itemId",
          foreignField: "_id",
          as: "ingredients.item", // this is the name of the new property
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      // converts newly added 'item' property to a single object instead of an object array
      { $unwind: "$ingredients.item" },

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

    recipe[0].username = recipe[0].user[0].username;
    delete recipe[0].user;

    res.send(recipe);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something failed getting the recipe");
  }
});

router.post("/", auth, async (req, res) => {
  // validate request body
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // check to make sure the specified user exists
    let user = await User.findOne({ _id: req.body.userId });
    if (!user) return res.status(404).send("The userId does not exist");
    // create the recipe object from the request body and save
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(200).send(recipe); // send recipe back with response
  } catch (err) {
    console.log("POST /recipes error:", err);
    res.status(500).send("Something failed creating a new recipes.");
  }
});

// update given recipe's properties with properties sent in request body
router.patch("/:id", auth, async (req, res) => {
  console.log("req.body", req.body);
  const { error } = validate(req.body, true); // ignore required
  if (error) return res.status(400).send(error.details[0].message);

  // if editing recipe's userId, first ensure it is present in db
  if (req.body.userId) {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      if (!user) return res.status(404).send("The userId does not exist");
    } catch (err) {
      console.log("PATCH /recipes/:id Finding User Error=", err);
      res.status(500).send("Finding User Error.");
    }
  }

  // make requested updates to recipe
  try {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!recipe)
      return res
        .status(404)
        .send("The recipe with the given ID was not found.");

    res.send(recipe);
  } catch (err) {
    console.log("PATCH /recipes/:id Updating Recipe Error=", err);
    res.status(500).send("Something failed updating a recipe");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    //   check to make sure the specified recipe exists
    const recipe = await Recipe.findByIdAndRemove(req.params.id);
    if (!recipe)
      return res.status(404).send("The recipeId could not be found.");

    // remove this recipe from any user's savedRecipes
    await User.updateMany(
      { savedRecipes: req.params.id },
      { $pull: { savedRecipes: req.params.id } }
    );

    // remove any reviews for this recipe
    await Review.deleteMany({ recipeId: req.params.id });
    res.send(recipe);
  } catch (err) {
    res.status(500).send("Something failed.", err);
  }
});

router.get("/:id/reviews", auth, async (req, res) => {
  let recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).send("The recipeId could not be found.");

  const reviews = await Review.aggregate([
    { $match: { _id: { $in: recipe.reviews } } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
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
        "user.savedRecipes": 0,
      },
    },
  ]);

  // remove user data except username
  reviews.forEach((review) => {
    review.username = review.user[0].username;
    review.profileImageUrl = review.user[0].profileImageUrl;
    delete review.user;
  });

  res.json(reviews);
});

module.exports = router;
