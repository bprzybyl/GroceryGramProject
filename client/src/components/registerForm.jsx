import React from "react";
import Form from "./common/form";
import Joi from "joi-browser";
import * as userService from "../services/userService";
import auth from "../services/authService";

class RegisterForm extends Form {
  state = {
    data: { username: "", email: "", password: "", confirmPassword: "" },
    errors: {},
  };

  // define schema for input validation in browser
  schema = {
    email: Joi.string().email().required().label("Email"),
    username: Joi.string().required().label("Username"),
    password: Joi.string().required().min(5).label("Password"),

    // check that passwords match with custom error message
    confirmPassword: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .label("Confirm Password")
      .options({
        language: { any: { allowOnly: "does not match" } },
      }),
  };

  componentDidMount() {
    document.title = this.props.pageTitle;
  }

  // this function is called in the hamdleSubmit function of the forms base component
  doSubmit = async () => {
    try {
      // register the user with the backend
      const res = await userService.register(this.state.data);

      // log the user in with jwt returned in response
      auth.loginWithJwt(res.headers["x-auth-token"]);

      // reload the application so that the user is added to state on componentDidMount() in app.js
      const { state } = this.props.location;

      window.location = state ? state.from.pathname : "/";
    } catch (ex) {
      // display 400 responses in form  by adding to errors property of state
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        if (ex.response.data.includes("email")) errors.email = ex.response.data;
        else errors.username = ex.response.data;
        // all other validation error cases are handled in browser
        this.setState({ errors });
      }
    }
  };

  render() {
    return (
      <React.Fragment>
        <section id="register-form">
          <div className="col-lg-8 col-xl-7 mx-auto modal-form row">
            <div className="col-md-5 left-col bg-info"></div>
            <div className="col-md-7 right-col">
              <h2>Let's Get Started</h2>
              <form onSubmit={this.handleSubmit}>
                {this.renderInput("email", "Email")}
                {this.renderInput("username", "Username")}
                {this.renderInput("password", "Password", "password")}
                {this.renderInput(
                  "confirmPassword",
                  "Confirm Password",
                  "password"
                )}
                {this.renderButton("Create Account")}
              </form>
            </div>
          </div>
        </section>
      </React.Fragment>
    );
  }
}

export default RegisterForm;
