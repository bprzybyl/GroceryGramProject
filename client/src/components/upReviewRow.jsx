import React, { Component } from "react";
import AvgStarRating from "./common/avgStarRating";
import { FaPen, FaTrash } from "react-icons/fa";


class UPReviewRow extends Component {
  prettyDate = () => {
    let date = new Date(this.props.date);
    return date.toLocaleDateString();
  };

  render() {
    let starSize;
    if (this.props.starSize !== undefined) {
      starSize = this.props.starSize;
    } else {
      starSize = 50;
    }

    return (
      <React.Fragment>
        <div className="up-review-row">
          <div
            onClick={() => this.props.onDelete(this.props.review._id)}
            className="icon-container text-secondary"
            data-toggle="modal"
            data-target="#deleteModal"
          >
            <FaTrash></FaTrash>
          </div>
          <div
            onClick={() => this.props.onEdit(this.props.review)}
            className="icon-container text-secondary"
            data-toggle="modal"
            data-target="#editModal"
          >
            <FaPen></FaPen>
          </div>
          <p className="title-url">
            <a href={"/recipes/" + this.props.recipeId}>
              {this.props.recipeTitle}
            </a>
          </p>

          <AvgStarRating avgRating={this.props.rating} starSize={starSize} />
          <p className="up-review-date text-secondary">{this.prettyDate()}</p>
          <p>{this.props.comments}</p>
        </div>
      </React.Fragment>
    );
  }
}

export default UPReviewRow;
