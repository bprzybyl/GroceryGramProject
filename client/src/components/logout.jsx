import { Component } from "react";
import auth from "../services/authService";

class Logout extends Component {
  componentDidMount() {
    document.title = this.props.pageTitle;
    auth.logout();
    window.location = "/login"; // redirect to login page
  }

  render() {
    return null;
  }
}

export default Logout;
