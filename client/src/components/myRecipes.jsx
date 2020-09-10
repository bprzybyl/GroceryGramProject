import React, { Component } from "react";
import {
  getUserRecipes,
  getUserData,
  updateUserProperty,
} from "../services/userService";
import RecipeBlock from "./recipeBlock";
import { getCategories } from "../services/categoryService";
import Pagination from "./common/pagination";
import { paginate } from "../utils/paginate";
import ListGroup from "./common/listGroup";
import SearchBox from "./searchBox";

class MyRecipes extends Component {
  state = {
    data: "",
    userData: {},
    recipes: [],
    pageSize: 12,
    currentPage: 1,
    listGroupLabels: ["All", "Saved", "My Own"],
    selectedOwnerType: "All",
    selectValue: "",
    options: [],
    searchQuery: "",
    recipeIdForUnsave: "",
    recipeTitleForUnsave: "",
  };

  getInitialSelectVal() {
    return "Select a Category";
  }

  onNewRecipe = () => {
    window.location = "/my-recipes/new";
  };

  async componentDidMount() {
    document.title = this.props.pageTitle;
    this.setState({ selectValue: this.getInitialSelectVal() });

    try {
      const user = this.props.user;
      if (user) {
        const { data: recipes } = await getUserRecipes(user._id);
        const { data: userData } = await getUserData(user._id);
        const options = getCategories(recipes);
        this.setState({ recipes, options, userData });
      }
    } catch (ex) {
      console.log("Something failed", ex);
    }
  }

  handleOwnerSelect = (ownerType) => {
    this.setState({
      selectedOwnerType: ownerType,
      currentPage: 1,
      selectValue: this.getInitialSelectVal(),
    });
  };

  handleFilterByCategory = (event) => {
    this.setState({ selectValue: event.target.value, currentPage: 1 });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSearch = (query) => {
    this.setState({
      searchQuery: query,
      currentPage: 1,
      selectedOwnerType: "All",
      selectValue: this.getInitialSelectVal(),
    });
  };

  handleUnsaveRecipe = async (recipeId) => {
    const recipes = [...this.state.recipes];
    const filtered = recipes.filter((r) => r._id !== recipeId);
    this.setState({ recipes: filtered });

    // call backend to remove from saved recipes
    let userData = { ...this.state.userData };
    const oldSavedRecipes = [...userData.savedRecipes];
    const savedRecipes = oldSavedRecipes.filter((r) => {
      return r !== recipeId;
    });
    userData.savedRecipes = savedRecipes;
    this.setState({ userData })

    try {
      await updateUserProperty(this.state.userData._id, { savedRecipes });
    } catch (ex) {
      this.setState({ recipes });
      console.log("Something failed", ex);
    }
  };

  setRecipeForUnsave = (recipeIdForUnsave, recipeTitleForUnsave) => {
    this.setState({ recipeIdForUnsave, recipeTitleForUnsave });
  };

  render() {
    const {
      recipes: allRecipes,
      pageSize,
      currentPage,
      listGroupLabels,
      selectedOwnerType,
      selectValue,
      searchQuery,
    } = this.state;

    let options = getCategories(allRecipes); // start with combined cats

    const { user } = this.props;

    let filtered = allRecipes;
    if (searchQuery) {
      filtered = allRecipes.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (selectedOwnerType) {
      if (selectedOwnerType === "Saved") {
        filtered = allRecipes.filter((r) => r.userId !== user._id);
      } else if (selectedOwnerType === "My Own") {
        filtered = allRecipes.filter((r) => r.userId === user._id);
      } else {
        filtered = allRecipes;
      }
      options = getCategories(filtered);
    }

    let filteredByCat = filtered;
    if (
      selectValue === this.getInitialSelectVal() ||
      selectValue === "All Categories"
    ) {
      filteredByCat = filtered;
    } else {
      filteredByCat = filtered.filter((r) => r.category === selectValue);
    }

    const recipes = paginate(filteredByCat, currentPage, pageSize);

    return (
      <React.Fragment>
        <div className="row sl-page-heading">
          <h2>My Recipes</h2>
          <button
            onClick={this.onNewRecipe}
            className="btn btn-dark new-recipe"
          >
            New Recipe +
          </button>
        </div>
        <hr className="divider" />
        <div className="row list-group-row">
          <div className="col-md-4">
            <ListGroup
              items={listGroupLabels}
              selectedItem={selectedOwnerType}
              onItemSelect={this.handleOwnerSelect}
            />
          </div>
          <div className="col-md-4 owner-filter">
            <select
              className="form-control"
              id="mr-category"
              name="mr-category"
              onChange={this.handleFilterByCategory}
              value={selectValue}
            >
              <option disabled>{this.getInitialSelectVal()}</option>
              {options.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <SearchBox value={searchQuery} onChange={this.handleSearch} />
          </div>
        </div>
        <div className="row">
          {recipes &&
            recipes.map((recipe) => {
              return (
                <React.Fragment
                  key = { recipe._id }                
                >
                  <RecipeBlock
                    unSave={this.setRecipeForUnsave}
                    userId={this.props.user._id}                    
                    recipe={recipe}
                    forExplore={false}
                  />
                  {/* Confirm Modal */}
                  <div
                    className="modal fade"
                    id="unsaveModal"
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
                          <p>
                            This will un-save your saved{" "}
                            <span style={{ fontWeight: "bold" }}>
                              {this.state.recipeTitleForUnsave}
                            </span>{" "}
                            recipe. But you can always save it again later.
                          </p>
                        </div>
                        <div className="modal-footer d-flex justify-content-start">
                          <button
                            onClick={() =>
                              this.handleUnsaveRecipe(
                                this.state.recipeIdForUnsave
                              )
                            }
                            type="button"
                            className="btn btn-danger"
                            data-dismiss="modal"
                          >
                            Unsave Recipe
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
            })}
        </div>
        <Pagination
          recipesCount={filtered.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={this.handlePageChange}
        />
      </React.Fragment>
    );
  }
}

export default MyRecipes;
