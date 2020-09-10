import React, { Component } from "react";
import { Link } from "react-router-dom";
import AvgStarRating from "./common/avgStarRating";
import { FaPen, FaHeart } from "react-icons/fa";

class RecipeBlock extends Component {

  getUsername() {
    if (this.props.forExplore === true) {
      return this.props.recipe.user[0].username;
    }
    return this.props.recipe.user.username;
  }

  placeholderOrImage() {
    if (this.props.recipe.images && this.props.recipe.images[0].thumbUrl) {
      return (
        <img
          className="card-img-top"
          src={this.props.recipe.images[0].thumbUrl}
          alt="the thing"
        />
      );
    } else {
      return (
        <img
          className="card-img-top"
          src={"https://picsum.photos/200/300"}
          alt="the thing"
        />
      );
    }
  }

  renderHeartOrPencilOrNone() {
    // Case if user is not logged in
    if (this.props.userId === undefined) {
      return null;
    }
    // Case if user owns this recipe
    else if (this.props.recipe.userId === this.props.userId) {
      return (
        <div className="edit-icon">
          <Link to={"/my-recipes/" + this.props.recipe._id}>
            <FaPen></FaPen>
          </Link>
        </div>
      );
    }
    // Case if user does not own this recipe
    else if (this.props.recipe.userId !== this.props.userId) {
      return (
        <div className="saved-icon">
          <FaHeart
            style={{ cursor: "pointer" }}
            data-toggle="modal"
            data-target="#unsaveModal"
            onClick={() =>
              this.props.unSave(
                this.props.recipe._id,
                this.props.recipe.title
              )
            }
          ></FaHeart>
        </div>
      );
    }
  }

  render(props) {
    return (
      <React.Fragment>
        <div className="col-md-4 col-lg-3 mb-4 recipe-block">
          <div className="card">
            <Link
              to={"/recipes/" + this.props.recipe._id}
              className="card-link"
            >
              <div className="img-hover-zoom">{this.placeholderOrImage()}</div>
              <div className="card-body bg-secondary text-white">
                <h5 className="card-title">{this.props.recipe.title}</h5>
                <p className="card-text">By {this.getUsername()}</p>
                <AvgStarRating
                  avgRating={this.props.recipe.avgRating}
                  numReviews={this.props.recipe.numReviews}
                  starSize={16}
                />
              </div>
            </Link>
            {!this.props.forExplore && this.renderHeartOrPencilOrNone()}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default RecipeBlock;
