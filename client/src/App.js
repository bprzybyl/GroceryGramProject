import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/protectedRoute";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ShoppingList from "./components/shoppingList";
import MyRecipes from "./components/myRecipes";
import ExploreRecipes from "./components/exploreRecipes";
import NotFound from "./components/notFound";
import RegisterForm from "./components/registerForm";
import RecipeDetail from "./components/recipeDetail";
import LoginForm from "./components/loginForm";
import Logout from "./components/logout";
import RecipeForm from "./components/recipeForm";
import UserProfile from "./components/userProfile";
import DevTeam from "./components/devTeam";
import ReviewEdit from "./components/reviewEdit";
import auth from "./services/authService";
import item from "./services/itemService";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

class App extends Component {
  state = {
    user: null,
    items: null,
    isLoading: true,
  };

  async componentDidMount() {
    const user = auth.getCurrentUser();
    const { data: items } = await item.getItems();
    this.setState({ user, items, isLoading: false });
  }

  render() {
    const { user, items, isLoading } = this.state;
    return (
      !isLoading && (
        <React.Fragment>
          <ToastContainer />
          <Navbar user={user} />
          <main className="container">
            <Switch>
              <Route
                path="/register"
                render={(props) => (
                  <RegisterForm {...props} pageTitle="Register - GroceryGram" />
                )}
              />
              <Route
                path="/login"
                render={(props) => (
                  <LoginForm {...props} pageTitle="Login - GroceryGram" />
                )}
              />
              <ProtectedRoute
                path={"/logout"}
                component={Logout}
                pageTitle={"Logout - GroceryGram"}
              />
              <ProtectedRoute
                path={"/my-recipes/:id"}
                component={RecipeForm}
                items={items}
                user={user}
                pageTitle={"My Recipe Page - GroceryGram"}
              />
              <ProtectedRoute
                path={"/my-recipes"}
                component={MyRecipes}
                user={user}
                pageTitle={"My Recipes - GroceryGram"}
              />
              <Route
                path="/explore-recipes"
                render={(props) => (
                  <ExploreRecipes
                    {...props}
                    user={user}
                    pageTitle={"Explore Recipes - GroceryGram"}
                  />
                )}
              />
              <Route
                path="/recipes/:id"
                render={(props) => (
                  <RecipeDetail
                    {...props}
                    user={user}
                    pageTitle={"Recipe Page - GroceryGram"}
                  />
                )}
              />
              <ProtectedRoute
                path={"/shopping-list"}
                component={ShoppingList}
                user={user}
                items={items}
                pageTitle={"Shopping List - GroceryGram"}
              />
              <ProtectedRoute
                path={"/profile"}
                component={UserProfile}
                history={this.props.history}
                user={user}
                pageTitle={"User Profile - GroceryGram"}
                appCDM={this.componentDidMount.bind(this)}
              />
              <ProtectedRoute
                path={"/review-edit"}
                component={ReviewEdit}
                history={this.props.history}
                user={user}
                pageTitle={"Review Edit Page - GroceryGram"}
              />
              <Route
                path="/development-team"
                render={(props) => (
                  <DevTeam
                    {...props}
                    pageTitle={"Meet the Development Team - GroceryGram"}
                  />
                )}
              />
              <Route
                path="/not-found"
                render={(props) => (
                  <NotFound
                    {...props}
                    pageTitle={"Page Not Found - GroceryGram"}
                  />
                )}
              />
              <Redirect
                exact
                from="/"
                to={
                  auth.isAuthenticated() ? "/shopping-list" : "/explore-recipes"
                }
              />
              <Redirect to="/not-found" />
            </Switch>
          </main>
          <Footer />
        </React.Fragment>
      )
    );
  }
}

export default App;
