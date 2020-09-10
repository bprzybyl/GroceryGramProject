import React from "react";
import { Link } from "react-router-dom";
import Joi from "joi-browser";
import ImageGallery from "react-image-gallery";
import { toast } from "react-toastify";
import Form from "./common/form";
import Like from "./common/like";
import ReviewRow from "./common/reviewRow";
import AvgStarRating from "./common/avgStarRating";
import StarRating from "./common/starRating";
import { getUserData } from "../services/userService";
import { FaPen } from "react-icons/fa";
import { getRecipe, getReviews } from "../services/recipeService";
import { newReview } from "../services/reviewService";
import "react-image-gallery/styles/css/image-gallery.css";
import { updateUserProperty, addToShoppingList } from "../services/userService";

class RecipeDetail extends Form {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        reviewNotes: "",
        reviewStars: 0,
        title: "",
        userId: "",
        author: "",
        category: "",
        isPublished: false,
        instructions: "",
        ingredients: [],
      },
      reviews: [],
      isSaved: null,
      errors: {},
    };
  }

  schema = {
    reviewNotes: Joi.string().required().label("Review Notes"),
    reviewStars: Joi.number().min(0).max(5).required(),
    userId: Joi.any(),
    _id: Joi.any(),
    reviews: Joi.any(),
    images: Joi.any(),
    author: Joi.any(),
    title: Joi.any(),
    category: Joi.any(),
    isPublished: Joi.any(),
    instructions: Joi.any(),
    avgRating: Joi.any(),
    numReviews: Joi.any(),
    ingredients: Joi.any(),
  };

  async componentDidMount() {
    // Load the Page
    await this.populateRecipe();
    if (this.props.user) {
      // Load the user
      const { data: userData } = await getUserData(this.props.user._id);

      // figure out if the recipe is saved
      const isSaved = userData.savedRecipes.includes(this.state.data._id);
      this.setState({ savedRecipes: userData.savedRecipes, isSaved, userData });
    }

    document.title = this.state.data.title + " - GroceryGram";
    // Load the reviews
    await this.populateReviews();
  }

  // populates reviews in state if valid recipe id
  async populateRecipe() {
    try {
      const recipeId = this.props.match.params.id;

      const { data: recipe } = await getRecipe(recipeId);

      const data = { ...this.state.data };
      data.title = recipe[0].title;
      data.category = recipe[0].category;
      data.instructions = recipe[0].instructions;
      data.ingredients = recipe[0].ingredients;
      data.isPublished = recipe[0].isPublished;
      data.author = recipe[0].username;
      data._id = recipe[0]._id;
      data.userId = recipe[0].userId;
      data.avgRating = recipe[0].avgRating;
      data.numReviews = recipe[0].numReviews;
      data.images = recipe[0].images;
      data.reviews = recipe[0].reviews;

      data.ingredients.map((ingredient) => (ingredient.addToList = true));

      this.setState({ data });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  // populates reviews in state if valid recipe id
  async populateReviews() {
    try {
      const recipeId = this.props.match.params.id;

      const { data: reviews } = await getReviews(recipeId);
      this.setState({ reviews });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  handleStarChange = (clickedStars) => {
    const data = { ...this.state.data };
    data.reviewStars = clickedStars;
    this.setState({ data });
  };

  doSubmit = async () => {
    let toSubmit = {};
    toSubmit.comments = this.state.data.reviewNotes;
    toSubmit.rating = this.state.data.reviewStars;
    toSubmit.userId = this.props.user._id;
    toSubmit.recipeId = this.props.match.params.id;
    await newReview(toSubmit);

    // Get the page again
    await this.populateReviews();
    await this.populateRecipe();

    const data = { ...this.state.data };
    data.reviewNotes = "";
    data.reviewStars = 0;
    this.setState({ data });
  };

  returnImgArray = () => {
    if (this.state.data.images) {
      const images = this.state.data.images.map((i) => {
        let imgObject = {};
        imgObject.original = i.fullsizeUrl;
        imgObject.thumbnail = i.thumbUrl;
        return imgObject;
      });

      return images;
    }
  };

  handleSaveRecipe = async () => {
    const {
      isSaved,
      data: recipe,
      //   savedRecipes,
      savedRecipes: origSavedRecipes,
    } = this.state;
    let savedRecipes = [];
    this.setState({ isSaved: !isSaved });

    if (isSaved) {
      // remove from saved recipes
      savedRecipes = this.state.savedRecipes.filter((r) => r !== recipe._id);
    } else {
      // add to saved recipes
      savedRecipes = [...this.state.savedRecipes, recipe._id];
    }

    this.setState({ savedRecipes });

    try {
      await updateUserProperty(this.props.user._id, {
        savedRecipes,
      });
    } catch (err) {
      this.setState({ origSavedRecipes });
    }
  };

  renderIcon = () => {
    if (this.state.data.userId === this.props.user._id) {
      return (
        <div>
          <Link to={"/my-recipes/" + this.props.match.params.id}>
            <FaPen className="text-secondary" />
          </Link>
        </div>
      );
    }

    return (
      <React.Fragment>
        {this.state.isSaved ? "Recipe Saved " : "Save Recipe "}
        <Like liked={this.state.isSaved} onClick={this.handleSaveRecipe} />
      </React.Fragment>
    );
  };

  handleIngredientCick = (ingredientIndex, isChecked) => {
    let data = this.state.data;
    data.ingredients[ingredientIndex].addToList = isChecked;
    this.setState({ data });
  };

  toastMsg = (msg, type) => {
    toast[type](msg, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  async handleAddIngredients() {
    try {
      let newAddedItemIds = [];
      let numChecked = 0;
      let numAdded = 0;
      const { addedItems } = this.state.userData;
      console.log("addedItems", addedItems);
      this.state.data.ingredients.forEach((ingredient) => {
        console.log("ingredient._id", ingredient._id);
        console.log(
          "!addedItems.includes(ingredient.itemId)",
          !addedItems.includes(ingredient._id)
        );
        if (ingredient.addToList) {
          numChecked++;
          // only add items not already in shopping list
          if (!addedItems.includes(ingredient.itemId)) {
            newAddedItemIds.push(ingredient.itemId);
            numAdded++;
          }
        }
      });

      if (numChecked === 0) {
        return this.toastMsg(
          "No items selected to add to shopping list",
          "info"
        );
      }

      if (numAdded === 0) {
        return this.toastMsg(
          "All selected ingredients are already in your shopping cart",
          "info"
        );
      }

      await addToShoppingList(this.props.user._id, newAddedItemIds);
      this.toastMsg(
        numAdded +
          (numAdded > 1 ? " items " : " item ") +
          "added to Shopping List!",
        "success"
      );
    } catch (err) {
      // revert state back to original
      console.log("Adding Ingredients Error", err);
    }
  }

  render() {
    const { data } = this.state;

    return (
      <React.Fragment>
        <section className="recipe-detail-header">
          <h2>{data.title}</h2>
          <p>{"by " + data.author}</p>
          <div>
            <AvgStarRating
              avgRating={data.avgRating}
              numReviews={data.numReviews}
              starSize={25}
            />
          </div>
          {this.props.user ? (
            <span
              className="save-recipe"
              style={{ float: "right", marginTop: "-25px" }}
            >
              {this.state.savedRecipes && this.renderIcon()}
            </span>
          ) : null}
        </section>
        <section className="image-gallery">
          {data.images && (
            <ImageGallery
              items={this.returnImgArray()}
              showPlayButton={false}
              showThumbnails={data.images.length > 1}
            />
          )}
        </section>
        <section className="recipe-body">
          <div className="row">
            <div className="col-md-6 order-md-12">
              <h3>Ingredients</h3>
              <table className="table table-striped">
                <tbody>
                  {this.state.data.ingredients.map((ingredient, index) => (
                    <tr key={index}>
                      {this.props.user ? (
                        <td>
                          <input
                            type="checkbox"
                            onChange={(checkbox) =>
                              this.handleIngredientCick(
                                index,
                                checkbox.target.checked
                              )
                            }
                            checked={ingredient.addToList}
                          />
                        </td>
                      ) : null}
                      <td>{ingredient.qty}</td>
                      <td>{ingredient.unit}</td>
                      <td>{ingredient.item.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {this.props.user
                ? this.renderButtonCustomHandler(
                    "Add to Shopping List",
                    this.handleAddIngredients.bind(this)
                  )
                : null}
            </div>
            <div className="col-md-6">
              <h3>Preparation</h3>
              <p style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
                {this.state.data.instructions}
              </p>
            </div>
          </div>
        </section>
        <section className="reviews">
          <hr className="divider" />
          {this.props.user ? (
            <div>
              <h3 className="my-3">Review This Recipe</h3>
              <form onSubmit={this.handleSubmit}>
                <StarRating
                  starSize={25}
                  onChange={this.handleStarChange}
                  currentStars={this.state.data.reviewStars}
                />
                <br></br>
                {this.renderTextArea(
                  "reviewNotes",
                  "",
                  3,
                  "Add your review here"
                )}
                {this.renderButton("Submit Review")}
              </form>
            </div>
          ) : (
            <h3 className="my-3">Reviews</h3>
          )}

          <div className="review-list">
            {this.state.reviews.map((review) => (
              <ReviewRow
                key={review._id}
                username={review.username}
                comments={review.comments}
                userImage={
                  review.profileImageUrl ||
                  process.env.REACT_APP_SERVER_URL + "/images/blank-profile.png"
                }
                date={review.date}
                rating={review.rating}
                starSize={20}
              />
            ))}
          </div>
        </section>
      </React.Fragment>
    );
  }
}

export default RecipeDetail;
