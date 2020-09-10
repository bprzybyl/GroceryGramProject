import React, { Component } from "react";
import _ from "lodash";
import {
  getUserData,
  getUserRecipes,
  updateShoppingList,
  deleteItemFromShoppingList,
  clearAllFromShoppingList,
  updateItemCounts,
} from "../services/userService";
import { getColor } from "../services/itemService";
import ItemSearch from "../components/itemSearch";
import PieChartAndLegend from "./pieChartAndLegend";
import { FaTrash } from "react-icons/fa";

class ShoppingList extends Component {
  state = {
    userData: null,
    addedItems: [],
    removedItems: null,
    activeIndex: null,
    staples: [],
    recipes: [],
    itemCounts: [],
    isLoading: true,
    errors: {},
  };

  constructor(props) {
    super(props);
    this.addBackRef = React.createRef();
  }

  async componentDidMount() {
    document.title = this.props.pageTitle;

    // Bind the this context to the handler function
    this.handleUpdate = this.handleUpdate.bind(this);

    // populate the users lists and recipes
    await this.expandShoppingLists();
  }

  async expandShoppingLists() {
    const { items, user } = this.props;

    if (!user) {
      console.log("User not logged in...", user);
      return;
    }

    if (items && !this.state.userData) {
      const { data: userData } = await getUserData(user._id);
      const { data: userRecipes } = await getUserRecipes(user._id);
      const itemCounts = userData.itemCounts;
      const addedItemIds = userData.addedItems;
      let addedItems = this.expandItems(addedItemIds, items);
      const removedItemIds = userData.removedItems;
      const removedItems = this.expandItems(removedItemIds, items);
      addedItems = this.sortItems(addedItems);
      setTimeout(() => {
        this.setState({
          addedItems,
          removedItems,
          userData,
          userRecipes,
          itemCounts,
          isLoading: false,
        });
      }, 100);

      this.updateMyStaples(itemCounts, addedItems);
    }
  }

  expandItemById = (itemId, itemsArr) => {
    for (let i = 0; i < itemsArr.length; i++) {
      if (itemsArr[i]._id === itemId) return itemsArr[i];
    }
    return null;
  };

  expandItems = (itemIds, allItems) => {
    let expanded = [];
    for (const itemId of itemIds) {
      const item = this.expandItemById(itemId, allItems);
      expanded.push(item);
    }
    return expanded;
  };

  sortItems = (items) => {
    return _.orderBy(items, ["category", "name"], ["asc", "asc"]);
  };

  handleAddItemFromSearchBox = async (item) => {
    // optimistic update, so save original state
    const prevAddedItems = [...this.state.addedItems];
    let newAddedItems = [...this.state.addedItems, item];
    newAddedItems = this.sortItems(newAddedItems);
    const newAddedItemIds = newAddedItems.map((item) => item._id);
    const removedItemIds = this.state.removedItems.map((item) => item._id);
    this.setState({ addedItems: newAddedItems });
    const itemCounts = [...this.state.itemCounts];
    this.updateMyStaples(itemCounts, newAddedItems);

    try {
      await updateShoppingList(
        this.props.user._id,
        newAddedItemIds,
        removedItemIds
      );
    } catch (err) {
      // revert state back to original
      this.setState({ addedItems: prevAddedItems });
      console.log("Something went wrong.", err);
    }
  };

  handleAddBackItem = async (itemIndex) => {
    this.moveItemsInLists(itemIndex, "addBack");
    this.updateMyStaples(this.state.itemCounts, this.state.addedItems);
  };

  handleRemoveItem = async (index) => {
    this.updateItemCount(this.state.addedItems[index]._id);
    this.setState({ activeIndex: index });

    setTimeout(() => {
      this.moveItemsInLists(index, "removeItem"); // need to change addBack
      this.setState({ activeIndex: null });
    }, 300);
  };

  moveItemsInLists = async (itemIndex, action) => {
    // optimistic update
    // store current state in case we need to revert
    const { removedItems: prevRemovedItems, addedItems: prevAddedItems } = {
      ...this.state,
    };

    let currExtractFromItems;
    let currAddToItems;
    // addBack: extract from removed, add into added
    if (action === "addBack") {
      currExtractFromItems = prevRemovedItems;
      currAddToItems = prevAddedItems;
    } // removeItem: extract from added, add into removed
    else if (action === "removeItem") {
      currExtractFromItems = prevAddedItems;
      currAddToItems = prevRemovedItems;
    }
    // extract item from currExtractFromItems
    let newExtractFromItems = [];
    const newExtractFromItemIds = [];
    let newAddToItems = [];

    currExtractFromItems.forEach((item, index) => {
      if (index !== itemIndex) {
        newExtractFromItems.push(item);
        newExtractFromItemIds.push(item._id);
      } else newAddToItems.push(item);
    });
    // push currAddToItems into newAddToItems
    newAddToItems.push(...currAddToItems);
    const newAddToItemIds = newAddToItems.map((item) => item._id);

    // sort and set state according to action, forces a re-render
    if (action === "addBack") {
      newAddToItems = this.sortItems(newAddToItems);
      this.setState({
        addedItems: newAddToItems,
        removedItems: newExtractFromItems,
      });
      this.updateMyStaples(this.state.itemCounts, newAddToItems);
    } else {
      // removeItem
      newExtractFromItems = this.sortItems(newExtractFromItems);
      this.setState({
        addedItems: newExtractFromItems,
        removedItems: newAddToItems,
      });
      this.updateMyStaples(this.state.itemCounts, newExtractFromItems);
    }

    // handle user shopping list in backend according to action
    // on failure revert state
    let newAddedItemIds;
    let newRemovedItemIds;
    if (action === "addBack") {
      newAddedItemIds = newAddToItemIds;
      newRemovedItemIds = newExtractFromItemIds;
    } else {
      newAddedItemIds = newExtractFromItemIds;
      newRemovedItemIds = newAddToItemIds;
    }

    try {
      await updateShoppingList(
        this.props.user._id,
        newAddedItemIds,
        newRemovedItemIds
      );
    } catch (err) {
      // revert state back to original
      this.setState({
        addedItems: prevAddedItems,
        removedItems: prevRemovedItems,
      });
      console.log("Something went wrong.", err);
    }
  };

  // handle update from itemSearch
  handleUpdate(value, row = null) {
    console.log("handling update");
    console.log(value);
    const items = [...this.props.items];
    if (value) {
      const item = this.expandItemById(value, items);
      this.handleAddItemFromSearchBox(item);
    }
  }

  updateItemCount = async (itemId) => {
    const itemCounts = [...this.state.itemCounts];
    const idx = itemCounts.findIndex((i) => i._id === itemId);

    if (idx === -1) {
      const result = { _id: itemId, count: 1 };
      itemCounts.push(result);
    } else {
      itemCounts[idx].count++;
    }

    this.setState({ itemCounts });
    this.updateMyStaples(itemCounts, this.state.addedItems);
    try {
      await updateItemCounts(this.props.user._id, itemCounts);
    } catch (err) {}
  };

  updateMyStaples = (itemCounts, addedItems) => {
    addedItems = [...addedItems].map((i) => i._id);
    const allItems = [...this.props.items];

    // only include items not already present in addedItems
    const filtered = itemCounts.filter((item) => {
      return !addedItems.includes(item._id);
    });
    const staples = filtered
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((i) => {
        return allItems.find((item) => item._id === i._id);
      });
    this.setState({ staples });
  };

  handleAddRecipeIngredients = async (recipe) => {
    let itemsToAdd = recipe.ingredients.map((ingredient) => {
      return ingredient.item;
    });

    const prevAddedItems = [...this.state.addedItems];
    const prevAddedItemIds = prevAddedItems.map((item) => item._id);
    itemsToAdd = itemsToAdd.filter((item) => {
      return !prevAddedItemIds.includes(item._id);
    });

    let newAddedItems = [...this.state.addedItems, ...itemsToAdd];

    newAddedItems = this.sortItems(newAddedItems);
    const newAddedItemIds = newAddedItems.map((item) => item._id);

    this.setState({ addedItems: newAddedItems });
    const itemCounts = [...this.state.itemCounts];
    this.updateMyStaples(itemCounts, newAddedItems);

    try {
      await updateShoppingList(this.props.user._id, newAddedItemIds);
    } catch (err) {
      // revert state back to original
      this.setState({ addedItems: prevAddedItems });
      console.log("Something went wrong.", err);
    }
  };

  handlePermDelete = async (idx) => {
    const prevRemovedItems = [...this.state.removedItems];
    const newRemovedItems = [...this.state.removedItems];
    newRemovedItems.splice(idx, 1);
    const newRemovedItemsIds = newRemovedItems.map((item) => item._id);
    this.setState({ removedItems: newRemovedItems });
    try {
      await deleteItemFromShoppingList(this.props.user._id, newRemovedItemsIds);
    } catch (err) {
      // revert state back to original
      this.setState({ removedItems: prevRemovedItems });
      console.log("Something went wrong.", err);
    }
  };

  handleClearAll = async () => {
    const prevAddedItems = [...this.state.addedItems];
    const prevRemovedItems = [...this.state.removedItems];
    this.setState({ addedItems: [], removedItems: [] });

    try {
      await clearAllFromShoppingList(this.props.user._id, [], []);
    } catch (err) {
      // revert state back to original
      this.setState({
        addedItems: prevAddedItems,
        removedItems: prevRemovedItems,
      });
      console.log("Something went wrong.", err);
    }
  };

  render() {
    const {
      addedItems,
      removedItems,
      staples,
      userRecipes,
      isLoading,
    } = this.state;

    let numAllItems = 0;
    if (addedItems) numAllItems += addedItems.length;
    if (removedItems) numAllItems += removedItems.length;

    return (
      <React.Fragment>
        <div className="row sl-page-heading">
          <h2>Shopping List</h2>
        </div>
        <hr className="divider" />
        <div className="row">
          <div className="col-md-5   order-md-4 shop-list">
            <div className="itemSearch pb-4">
              <ItemSearch
                items={this.props.items}
                update={this.handleUpdate}
                clearOnBlur={true}
                initialValue={""}
              />
            </div>
            <div className="list-group lst-grp-hover lst-grp-striped">
              {!addedItems
                ? null
                : addedItems.map((item, index) => (
                    <li
                      key={index}
                      onClick={this.handleRemoveItem.bind(this, index)}
                      style={{
                        borderTop: 0,
                        borderBottom: 0,
                        borderRight: 0,
                        borderLeft: `15px solid ${getColor(item.category)}`,
                      }}
                      className="list-group-item"
                    >
                      <span
                        className={
                          this.state.activeIndex === index ? "strike" : ""
                        }
                      >
                        {item.name}
                      </span>
                      <span className="sl-price">${item.price.toFixed(2)}</span>
                    </li>
                  ))}
            </div>
            <div className="list-group lst-grp-hover lst-grp-removed">
              {!removedItems
                ? null
                : removedItems.map((item, index) => (
                    <li
                      key={index}
                      className="list-group-item"
                      style={{
                        borderTop: 0,
                        borderBottom: 0,
                        borderRight: 0,
                        borderLeft: "15px solid #fff",
                      }}
                    >
                      <span
                        className="removed"
                        ref={this.addBackRef}
                        onClick={() => this.handleAddBackItem(index)}
                      >
                        {item.name}
                      </span>
                      <span className="perm-delete">
                        <FaTrash
                          className="hover-icon"
                          onClick={() => this.handlePermDelete(index)}
                        />
                      </span>
                    </li>
                  ))}
              {numAllItems > 0 && (
                <React.Fragment>
                  <button
                    type="button"
                    data-toggle="modal"
                    data-target="#warnClearAll"
                    className="btn btn-secondary clear-all"
                  >
                    Clear All
                  </button>
                  <div
                    className="modal fade"
                    id="warnClearAll"
                    tabIndex="-1"
                    role="dialog"
                    aria-labelledby="warnClearAll"
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
                          This will delete all items in your Shopping List
                          including your lined-through items. This cannot be
                          undone.
                        </div>
                        <div className="modal-footer d-flex justify-content-start">
                          <button
                            onClick={() => this.handleClearAll()}
                            type="button"
                            data-dismiss="modal"
                            className="btn btn-danger"
                          >
                            Clear All
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
              )}
            </div>
          </div>
          <div className="col-md-4 order-md-12 pie">
            <PieChartAndLegend addedItems={this.state.addedItems} />
          </div>
          <div className="col-md-3 order-md-1">
            {!isLoading && <h5>My Staples</h5>}
            <div className="list-group lst-grp-hover myStaples">
              {!isLoading &&
                staples &&
                staples.map(
                  (item, i) =>
                    item && (
                      <li
                        key={i}
                        className="list-group-item border-0"
                        onClick={() => this.handleAddItemFromSearchBox(item)}
                      >
                        {item.name}
                      </li>
                    )
                )}
            </div>
            {!isLoading && <h5 className="my-recipes-header">My Recipes</h5>}
            <div className="list-group lst-grp-hover myRecipes">
              {!isLoading &&
                userRecipes &&
                userRecipes.map(
                  (recipe, i) =>
                    recipe && (
                      <li
                        key={i}
                        className="list-group-item border-0"
                        onClick={() => this.handleAddRecipeIngredients(recipe)}
                      >
                        {recipe.title}
                      </li>
                    )
                )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default ShoppingList;
