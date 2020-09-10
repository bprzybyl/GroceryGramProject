import React from "react";
import Form from "./common/form";
import Joi from "joi-browser";
import http from "../services/httpService";
import { getUnits } from "../services/unitService";
import { getQuantities } from "../services/qtyService";
import { getAllCategories } from "../services/categoryService";
import {
  getRecipe,
  deleteRecipe,
  updateRecipe,
  newRecipe,
} from "../services/recipeService";
import { FaTrash } from "react-icons/fa";
import ItemSearch from "../components/itemSearch";
import SortableComponent from "../components/sortableComponent";
import arrayMove from "array-move";

class RecipeForm extends Form {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      units: [],
      quantities: [],
      rows: [{}],
      ingredients: [],
      validateIngredientsRow: 0,
      data: {
        title: "",
        category: "",
        isPublished: false,
        instructions: "",
        recipeImages: [],
        ingredientCount: 0,
      },
    };
    this.handleThumbnailAdd = this.handleThumbnailAdd.bind(this);
    this.fileInput = React.createRef();
  }

  schema = {
    title: Joi.string().required().label("Recipe Name"),
    recipeImages: Joi.array().min(1).required().label("Recipe Images"),
    ingredientCount: Joi.number().min(1).required(),
    qty: Joi.string().label("Qty"),
    unit: Joi.string().label("Unit"),
    itemId: Joi.string().label("Item"),
    notes: Joi.string().label("Notes").optional(),
    category: Joi.string().required().label("Recipe Category"),
    instructions: Joi.string().required().label("Recipe Instructions"),
    isPublished: Joi.boolean().required().label("Recipe Published Slider"),
  };

  ingredientsSchema = {
    _id: Joi.any(),
    qty: Joi.string().label("Qty"),
    unit: Joi.string().label("Unit"),
    itemId: Joi.string().label("Item").required(),
    notes: Joi.string().label("Notes").allow(""),
  };

  async componentDidMount() {
    // Bind the this context to the handler function
    this.handleIngredientUpdate = this.handleIngredientUpdate.bind(this);
    this.handleDeleteRecipe = this.handleDeleteRecipe.bind(this);

    // load the recipe (unless new)
    await this.populateRecipe();

    // load the units and quantitiy options for select boxes into local state
    this.setState({ units: getUnits(), quantities: getQuantities() });

    document.title = "Shopping List - GroceryGram";
    if (this.props.match.params.id === "new") {
      document.title = "Create A Recipe - GroceryGram";
    } else {
      document.title = "Edit " + this.state.data.title + " - GroceryGram";
    }
  }

  // populates recipe in state if valid recipe id
  async populateRecipe() {
    try {
      const recipeId = this.props.match.params.id;
      if (recipeId === "new") return; 

      const { data: recipe } = await getRecipe(recipeId);
      console.log("recipe data", recipe);
      const data = { ...this.state.data };
      data.title = recipe[0].title;
      data.category = recipe[0].category;
      data.instructions = recipe[0].instructions;
      data.isPublished = recipe[0].isPublished;
      data.ingredientCount = recipe[0].ingredients.length;

      recipe[0].images.forEach((image) => {
        image.fileId = image.fullsizeUrl;
      });

      data.recipeImages = recipe[0].images;

      this.setState({
        data,
        recipeId: recipe[0]._id,
        ingredients: recipe[0].ingredients,
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  handleThumbnailAdd(e) {
    if (e.target.files.length === 0) {
      return;
    }

    let newFile = e.target.files[0];

    newFile.fileId = Date.now();

    let oldFiles = this.state.data.recipeImages;
    const data = { ...this.state.data };
    data.recipeImages = oldFiles.concat(newFile);

    let errors = { ...this.state.errors };
    if (errors.hasOwnProperty("recipeImages")) {
      delete errors.recipeImages;
    }

    this.setState({ data, errors });
  }

  handleThumbnailRemove = (e) => {
    const remainingFiles = this.state.data.recipeImages.filter((el) => {
      return el.fileId !== e.fileId;
    });
    const data = { ...this.state.data };
    data.recipeImages = remainingFiles;
    this.setState({ data });
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    const data = { ...this.state.data };
    data.recipeImages = arrayMove(data.recipeImages, oldIndex, newIndex);
    this.setState({ data });
  };

  renderDeleteButton() {
    if (this.props.match.params.id !== "new") {
      return this.renderButtonCustomHandler(
        "Delete Recipe"
      );
    }
  }

  async handleDeleteRecipe() {
    const { recipeId } = this.state;
    try {
      await deleteRecipe(recipeId);
      this.props.history.push("/my-recipes");
    } catch (err) {
      console.log("Delete recipe failed", err);
    }
  }

  renderHeader() {
    if (this.props.match.params.id === "new") {
      return <h2>Create A Recipe</h2>;
    } else {
      return <h2>Edit Recipe</h2>;
    }
  }

  // handle adding a new row to the ingredients table
  handleAddRow = (e) => {
    e.preventDefault();
    const ingredient = {
      qty: "",
      unit: "",
      item: "",
      notes: "",
    };
    const ingredients = [...this.state.ingredients, ingredient];
    const data = { ...this.state.data };
    data.ingredientCount = ingredients.length;
    this.setState({ ingredients, validateIngredientsRow: null, data });
  };

  // handle deleting a row from the ingredients table
  handleRemoveSpecificRow = (idx) => () => {
    console.log("deleting ingredient");
    const ingredients = [...this.state.ingredients];
    ingredients.splice(idx, 1);
    const data = { ...this.state.data };
    data.ingredientCount = ingredients.length;
    this.setState({ ingredients, validateIngredientsRow: null, data });
  };

  // handle updating ingredients from child itemSearch component
  // updates itemId
  handleIngredientUpdate(value, row) {
    const ingredients = [...this.state.ingredients];
    ingredients[row].itemId = value;
    this.setState({ ingredients });
  }

  triggerInputFile = (event) => {
    event.preventDefault();
    this.fileInput.click();
  };

  validateIngredients = (row) => {
    const options = { abortEarly: true };
    const ingredient = this.state.ingredients[row];
    delete ingredient.item;
    const { error } = Joi.validate(
      ingredient,
      this.ingredientsSchema,
      options
    );
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  doSubmit = async () => {
    const { ingredients } = this.state;
    let ingredientsValidationFailed = false;
    if (ingredients.length > 0) {
      ingredients.forEach((ingredient, row) => {
        const errors = this.validateIngredients(row);
        console.log("errors = ", errors);
        this.setState({ errors: errors || {} });
        if (errors) {
          ingredientsValidationFailed = true;
          this.setState({ validateIngredientsRow: row });
          return;
        }
        this.setState({ validateIngredientsRow: null });
      });
    }

    if (ingredientsValidationFailed) {
      console.log("I stopped at ingredientsValidationFailed");
      return;
    }

    console.log("maded it past state errosr!");

    let imageLinks = [];

    for (const imageFile of this.state.data.recipeImages) {
      if (imageFile instanceof File) {
        var formData = new FormData();
        formData.append("name", "file");
        formData.append("file", imageFile);

        const imageData = await http.post(
          process.env.REACT_APP_API_URL + "/img",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        imageLinks.push(imageData.data);
      } else {
        imageLinks.push(imageFile);
      }
    }

    let recipeRecord = {
      title: this.state.data.title,
      userId: this.props.user._id,
      category: this.state.data.category,
      images: imageLinks,
      isPublished: this.state.data.isPublished,
      instructions: this.state.data.instructions,
      ingredients: this.state.ingredients,
    };

    let redirectRecipeId = "";
    try {
      if (this.props.match.params.id === "new") {
        const createdRecipe = await newRecipe(recipeRecord);
        redirectRecipeId = createdRecipe.data._id;
      } else {
        // update an existing record via patch
        const updatedRecipe = await updateRecipe(
          this.props.match.params.id,
          recipeRecord
        );
        redirectRecipeId = updatedRecipe.data._id;
      }
      // redirect to my-recipes page
      this.props.history.push("/recipes/" + redirectRecipeId);
    } catch (ex) {
      console.log("Something went wrong with uploading a recipe");
      console.log(ex);
    }
  };

  render() {
    const { ingredients } = this.state;

    return (
      <React.Fragment>
        <div className="hiddenInputWrapper">
          <input
            id="myInput"
            type="file"
            ref={(fileInput) => (this.fileInput = fileInput)}
            onChange={this.handleThumbnailAdd}
          />
        </div>
        <section id="add-recipe-form">
          <div className="row rf-hdr">
            <div className="col">{this.renderHeader()}</div>
          </div>
          <hr className="divider" />
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("title", "Title")}

            <div className="form-group">
              <label htmlFor="addImg" style={{ display: "block" }}>
                Recipe Images{" "}
                <small>
                  <em>(First image is thumbnail, click an image to remove)</em>
                </small>
              </label>
              <SortableComponent
                images={this.state.data.recipeImages}
                imgClick={this.handleThumbnailRemove}
                onSortEnd={this.onSortEnd}
              />
              <button
                name="addImage"
                className="btn btn-outline-dark"
                onClick={(event) => {
                  this.triggerInputFile(event);
                }}
                style={{ display: "block" }}
              >
                Add Image +
              </button>
              <div className="hiddenInputWrapper">
                {this.renderInput("recipeImages")}
              </div>
            </div>

            <div className="form-group mb-4 mt-4 ingredients-form">
              <div>
                <label className="ingredients-label">Ingredients</label>
              </div>
              {ingredients.length > 0 && (
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th className="pl-2"> Qty </th>
                      <th className="pl-2"> Unit </th>
                      <th className="pl-2"> Item </th>
                      <th className="pl-2"> Notes </th>
                      <th className=""> </th>
                    </tr>
                  </thead>

                  <tbody>
                    {[...Array(ingredients.length)].map((row, i) => {
                      return (
                        (this.state.recipeId ||
                          this.props.match.params.id === "new") && (
                          <tr key={i}>
                            <td className="qty">
                              {this.renderMultiRowSelect(
                                "qty",
                                null,
                                i,
                                "ingredients",
                                this.state.quantities
                              )}
                            </td>
                            <td className="unit">
                              {this.renderMultiRowSelect(
                                "unit",
                                null,
                                i,
                                "ingredients",
                                this.state.units
                              )}
                            </td>
                            <td className="item">
                              <ItemSearch
                                items={this.props.items}
                                update={this.handleIngredientUpdate}
                                row={i}
                                initialValue={
                                  ingredients[i].item
                                    ? ingredients[i].item.name
                                    : ""
                                }
                              />
                              {this.state.validateIngredientsRow === i &&
                                this.state.errors.itemId && (
                                  <div className="alert alert-danger">
                                    {this.state.errors.itemId}
                                  </div>
                                )}
                            </td>
                            <td className="notes">
                              {this.renderMultiRowInput(
                                "notes",
                                null,
                                i,
                                "ingredients",
                                "text",
                                "Notes"
                              )}
                            </td>
                            <td className="delete">
                              <FaTrash
                                className="hover-icon"
                                onClick={this.handleRemoveSpecificRow(i)}
                              />
                            </td>
                          </tr>
                        )
                      );
                    })}
                  </tbody>
                </table>
              )}
              <div className="hiddenInputWrapper">
                {this.renderInput("ingredientCount")}
              </div>
              <button
                onClick={this.handleAddRow}
                className="btn btn-outline-dark"
              >
                Add Ingredient +
              </button>
            </div>

            {this.renderSelect("category", "Category", getAllCategories())}

            {this.renderTextArea("instructions", "Recipe Instructions", 5)}

            {this.renderSlider(
              "isPublished",
              "Publish",
              this.state.data.isPublished
            )}

            {this.renderButton("Save Recipe")}

            {this.props.match.params.id !== "new" && (
              <button
                className="btn btn-dark mt-2 mr-2"
                onClick={(e) => e.preventDefault()}
                data-toggle="modal"
                data-target="#deleteRecipeModal"
              >
                Delete Recipe
              </button>
            )}
          </form>
        </section>
        {/* Delete Recipe Modal */}
        <div
          className="modal fade"
          id="deleteRecipeModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Are you sure?
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>This will permanently delete the recipe.</p>
              </div>
              <div className="modal-footer d-flex justify-content-start">
                <button
                  onClick={() => this.handleDeleteRecipe()}
                  type="button"
                  className="btn btn-danger"
                  data-dismiss="modal"
                >
                  Delete Recipe
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default RecipeForm;
