const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  title: { type: String, max: 128, required: true },
  userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  category: { type: String, max: 128, required: true },
  avgRating: { type: Number, min: 0, max: 5, default: 0.0 },
  numReviews: { type: Number, min: 0, default: 0 },
  images: [
    {
      type: new Schema({
        fullsizeHeight: {
          type: Number,
        },
        fullsizeWidth: {
          type: Number,
        },
        fullsizeUrl: {
          type: String,
        },
        thumbHeight: {
          type: Number,
        },
        thumbWidth: {
          type: Number,
        },
        thumbUrl: {
          type: String,
        },
      }),
    },
  ],
  isPublished: { type: Boolean, default: false },
  instructions: { type: String, max: 2048 },
  ingredients: [
    {
      type: new Schema({
        qty: {
          type: String,
        },
        itemId: {
          type: mongoose.Schema.ObjectId,
          required: true,
          ref: "Item",
        },
        unit: {
          type: String,
        },
        notes: {
          type: String,
          maxLength: 64,
        },
      }),
    },
  ],
  createdOn: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    }
  ],
});

const Recipe = mongoose.model("Recipe", recipeSchema);

validateRecipe = (recipe, ignoreRequiredFields = false) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(128).required(),
    userId: Joi.string().max(128).required(),
    category: Joi.string().max(128).required(),
    avgRating: Joi.number().min(0).max(5),
    numReviews: Joi.number().min(0),
    isPublished: Joi.boolean(),
    instructions: Joi.string().max(2048),
    ingredients: Joi.array(),
    images: Joi.array(),
    createdOn: Joi.date(),
  });

  if (ignoreRequiredFields) {
    const optionalSchema = schema.fork(
      ["title", "userId", "category"],
      (schema) => schema.optional()
    );
    return optionalSchema.validate(recipe);
  }
  return schema.validate(recipe);
};

exports.Recipe = Recipe;
exports.validate = validateRecipe;
