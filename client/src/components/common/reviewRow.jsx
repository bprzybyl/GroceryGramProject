import React, { Component } from "react";
import AvgStarRating from "./avgStarRating";

class ReviewRow extends Component {
  prettyDate = () => {
    let date = new Date(this.props.date);
    return date.toLocaleDateString();
  }

  render() {
    let starSize;
    if (this.props.starSize !== undefined) {
      starSize = this.props.starSize;
    } else {
      starSize = 50;
    }

    return (
      <React.Fragment>
        <div className="review-row">
          <img
            className="text-center rounded-circle"
            src={this.props.userImage}
            alt="User Profile"
            style={{width: "30px", height: "30px"}}
          />
          <p className="review-username">@{this.props.username}</p>
          <AvgStarRating
            avgRating={this.props.rating}
            starSize={starSize}
          />
          <span className="review-date">{this.prettyDate()}</span>
          <p>{this.props.comments}</p>
        </div>
      </React.Fragment>
    );
  }
}

export default ReviewRow;
