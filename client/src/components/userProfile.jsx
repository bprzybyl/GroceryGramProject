import React from "react";
import Form from "./common/form";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import http from "../services/httpService";
import { updateUserProperty } from "../services/userService";
import { loginWithJwt, changePassword } from "../services/authService";
import UserReviews from "./userReviews";

class UserProfile extends Form {
  constructor(props) {
    super(props);

    this.state = {
      profileImageUrl:
        process.env.REACT_APP_SERVER_URL + "/images/blank-profile.png",
      data: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      errors: {},
    };

    this.handleImageSubmit = this.handleImageSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  // define schema for input validation in browser
  schema = {
    oldPassword: Joi.string().required().label("Password"),
    newPassword: Joi.string().required().min(5).label("Password"),

    // check that passwords match with custom error message
    confirmPassword: Joi.any()
      .valid(Joi.ref("newPassword"))
      .required()
      .label("Confirm Password")
      .options({
        language: { any: { allowOnly: "does not match" } },
      }),
  };

  doSubmit = async () => {
    try {
      const res = await changePassword(
        this.props.user.email,
        this.state.data.oldPassword,
        this.state.data.newPassword
      );
      if (res.status === 200) {
        toast.success(res.data, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.username = ex.response.data;
        this.setState({ errors });

        toast.error(ex.response.data, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  async handleImageSubmit(e) {

    if (e.target.files.length === 0) {
      return;
    }

    var formData = new FormData();
    formData.append("name", "file");
    formData.append("file", e.target.files[0]);

    const imageData = await http.post(
      process.env.REACT_APP_API_URL + "/img",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    this.setState({ profileImageUrl: imageData.data.thumbUrl });


    const newUserData = await updateUserProperty(this.props.user._id, {
      profileImageUrl: this.state.profileImageUrl,
    });

    // Need to send image url to mongodb field profileImageUrl
    loginWithJwt(newUserData.headers["x-auth-token"]);

    await this.props.appCDM();

    toast.success("Profile Image Updated!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  async componentDidMount() {
    document.title = this.props.pageTitle;

    if (this.props.user.profileImageUrl) {
      this.setState({ profileImageUrl: this.props.user.profileImageUrl });
    }
  }

  triggerInputFile = (event) => {
    event.preventDefault();
    this.fileInput.click();
  };

  render() {
    return (
      <React.Fragment>
        <div className="up-heading">
          <h2>
            My Profile
          </h2>
        </div>
        <hr className="divider" />
        <section className="user-profile">
          <div className="mx-auto mt-4 row">
            <div className="col-md-6 left-col bg-info p-4 border">
              <h3 className="text-center">
                <span className="up-hdg-user text-white">
                  {this.props.user.username}
                </span>
              </h3>
              <div className="text-center">
                <img
                  className="rounded-circle m-3 border bg-white"
                  style={{ maxWidth: "55%" }}
                  src={this.state.profileImageUrl}
                  alt="user profile"
                />
              </div>
              <div style={{ width: "100%" }}>
                <input
                  id="myInput"
                  type="file"
                  style={{ display: "none" }}
                  onChange={(event) => this.handleImageSubmit(event)}
                  ref={(fileInput) => (this.fileInput = fileInput)}
                />
              </div>
              <div className="btn-container">
                {this.renderButtonCustomHandler(
                  "Change Profile Picture",
                  this.triggerInputFile
                )}
              </div>
            </div>
            <div className="col-md-6 right-col p-4 border">
              <h3 className="text-center">Change Password</h3>
              <form onSubmit={this.handleSubmit}>
                {this.renderInput("oldPassword", "Old Password", "password")}
                {this.renderInput("newPassword", "New Password", "password")}
                {this.renderInput(
                  "confirmPassword",
                  "Confirm Password",
                  "password"
                )}
                {this.renderButton("Change Password")}
              </form>
            </div>
          </div>
        </section>
        <UserReviews
          user={this.props.user}
        />
      </React.Fragment>
    );
  }
}

export default UserProfile;
