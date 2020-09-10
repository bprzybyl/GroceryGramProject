import React, { Component } from "react";
import { getPublishedRecipes } from "../services/recipeService";
import { getCategories } from "../services/categoryService";
import RecipeBlock from "./recipeBlock";
import Pagination from "./common/pagination";
import { paginate } from "../utils/paginate";
import SearchBox from "./searchBox";

class ExploreRecipes extends Component {
  state = {
    data: "",
    recipes: [],
    pageSize: 12,
    currentPage: 1,
    selectValue: "",
    searchQuery: "",
  };

  getInitialSelectVal() {
    return "Select a Category";
  }

  async componentDidMount() {
    document.title = this.props.pageTitle;
    
    this.setState({ selectValue: this.getInitialSelectVal() });

    try {
      const { data: recipes } = await getPublishedRecipes();
      this.setState({ recipes });
    } catch (ex) {
      console.log("Something failed", ex);
    }
  }

  renderExploreRecipeBlocks(recipes, userId) {
    let items = [];
    if (recipes) {
      recipes.forEach(function (recipe) {
        items.push(
          <RecipeBlock
            userId={userId}
            key={recipe._id}
            recipe={recipe}
            forExplore={true}
          />
        );
      });
    }
    return items;
  }

  handleFilterByCategory = (event) => {
    this.setState({
      selectValue: event.target.value,
      currentPage: 1,
      searchQuery: "",
    });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSearch = (query) => {
    this.setState({
      searchQuery: query,
      currentPage: 1,
      selectValue: this.getInitialSelectVal(),
    });
  };

  render() {
    const {
      recipes: allRecipes,
      selectValue,
      pageSize,
      currentPage,
      searchQuery,
    } = this.state;

    const options = getCategories(allRecipes);

    let filtered = allRecipes;
    if (searchQuery) {
      filtered = allRecipes.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    else if (
      selectValue === this.getInitialSelectVal() ||
      selectValue === "All Categories"
    ) {
      filtered = allRecipes;
    } else {
      filtered = allRecipes.filter((r) => r.category === selectValue);
    }

    const recipes = paginate(filtered, currentPage, pageSize);

    return (
      <React.Fragment>
        <div className="row sl-page-heading">
          <h2>Explore Recipes</h2>
        </div>
        <hr className="divider" />
        <div className="row list-group-row">
          <div className="col-md-6">
            <select
              className="form-control owner-filter"
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
          <div className="col-md-6">
            <SearchBox value={searchQuery} onChange={this.handleSearch} />
          </div>
        </div>
        <div className="row">
          {this.renderExploreRecipeBlocks(recipes, this.props.user ? this.props.user._id : undefined)}
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

export default ExploreRecipes;
