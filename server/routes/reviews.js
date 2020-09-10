const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const _ = require("lodash");
const { Review, validate } = require("../models/review");
const { User } = require("../models/user");
const { Recipe } = require("../models/recipe");

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // check to make sure the specified user exists
  let user = {};
  try {
    user = await User.findOne({ _id: req.body.userId });
    if (!user) return res.status(404).send("The specified user does not exist");
  } catch (err) {
    console.log("Problem Finding User.  Error:", err);
    return res.status(500).send("Problem with userId");
  }

  // check to make sure the specified recipe exists
  let recipe = {};
  try {
    recipe = await Recipe.findOne({ _id: req.body.recipeId });
    if (!recipe)
      return res.status(404).send("The specified recipe does not exist");
  } catch (err) {
    console.log("Problem Finding Recipe.  Error:", err);
    return res.status(500).send("Problem with recipeId");
  }

  // Try creating a review
  let review = {};
  try {
    review = new Review(req.body);
    await review.save();
    console.log("New review saved id=" + review._id);
  } catch (err) {
    return res.status(500).send("Problem saving recipe to db", err);
  }

  // Try updating user.reviews
  try {
    await User.findByIdAndUpdate(user._id, { $push: { reviews: review._id } });
  } catch (err) {
    console.log(err);
    res.status(500).send("Problem updating user reviews array");
  }

  // calculate average rating
  const avgRating =
    (recipe.numReviews * recipe.avgRating + review.rating) /
    (recipe.numReviews + 1);

  // Try updating recipe.reviews
  try {
    await Recipe.findByIdAndUpdate(recipe._id, {
      $push: { reviews: review._id },
      $inc: { numReviews: 1 },
      avgRating: avgRating,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Problem updating recipe reviews array");
  }

  res.status(201).json(review);
});

router.get("/", async (req, res) => {
  try {
    const reviews = await Review.aggregate([
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
      delete review.user;
    });

    res.send(reviews);
  } catch (err) {
    res.status(500).send("Error getting reviews");
  }
});

router.delete("/:id", auth, async (req, res) => {
  // check to make sure the specified review exists
  let review = {};
  try {
    review = await Review.findByIdAndRemove(req.params.id);
    if (!review) {
      return res.status(404).send("The reviewId could not be found.");
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something failed finding & deleting the review.");
  }
  // Remove review from the reviewers user.reviews
  try {
    await User.updateOne(
      { reviews: review._id },
      { $pull: { reviews: review._id } }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send("Something failed updating the user.");
  }

  // get the recipe from the review being deleted
  try {
    recipe = await Recipe.findOne({ _id: review.recipeId });
    if (!recipe) return res.status(404).send("The recipeId does not exist");
  } catch (err) {
    res.status(500).send("Something failed.", err);
  }

  // calculate new average rating

  const { avgRating, numReviews } = recipe;
  const removedRating = review.rating;
  const newRating =
    (numReviews * avgRating - removedRating) /
    (numReviews === 1 ? 1 : numReviews - 1); // avoid division by 0 if single review is being deleted

  // Remove the review from recipe.reviews and update new numReviews and avgRating
  try {
    await Recipe.updateOne(
      { reviews: review._id },
      {
        $pull: { reviews: review._id },
        $inc: { numReviews: -1 },
        avgRating: newRating,
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send("Something failed updating the recipe.");
  }

  res.sendStatus(204);
});

// update given recipe's properties with properties sent in request body
router.patch("/:id", auth, async (req, res) => {
  const { error } = validate(req.body, true); // ignore required
  if (error) return res.status(400).send(error.details[0].message);

  let review, recipe;

  // if editing review's userId, first ensure it is present in db
  if (req.body.userId) {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      if (!user) return res.status(404).send("The userId does not exist");
    } catch (err) {
      res.status(500).send("Something failed.", err);
    }
  }

  // get the original review
  try {
    review = await Review.findOne({ _id: req.params.id });
    if (!review) return res.status(404).send("The review does not exist");
  } catch (err) {
    res.status(500).send("Something failed.", err);
  }

  // get the recipeId from the review in case the body doesn't contain recipeId

  try {
    recipe = await Recipe.findOne({ _id: review.recipeId });
    if (!recipe) return res.status(404).send("The recipeId does not exist");
    console.log("recipe", recipe);
  } catch (err) {
    res.status(500).send("Something failed.", err);
  }

  // if editing review's recipeId, first ensure it is present in db
  if (req.body.recipeId) {
    try {
      recipe = await Recipe.findOne({ _id: req.body.recipeId });
      if (!recipe) return res.status(404).send("The recipeId does not exist");
      console.log("recipe", recipe);
    } catch (err) {
      res.status(500).send("Something failed.", err);
    }
  }

  // if rating is included in request body, recalculate the avgRating for the recipe
  if (req.body.rating && req.body.rating !== review.rating) {
    const oldRating = review.rating;
    const newRating = req.body.rating;
    const avgRating =
      (recipe.avgRating * recipe.numReviews - oldRating + newRating) /
      recipe.numReviews;

    // update the recipe
    try {
      await Recipe.findByIdAndUpdate(recipe._id, {
        avgRating,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Problem updating recipe avgRating");
    }
  }

  // make requested updates to review
  try {
    review = await Review.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!review)
      return res
        .status(404)
        .send("The review with the given ID was not found.");

    res.send(review);
  } catch (err) {
    res.status(500).send("Something failed", err);
  }
});

module.exports = router;
