import React from 'react';
import Joi from "joi-browser";
import Form from './common/form';
import { getUserReviews } from "../services/userService";
import { updateReview, deleteReview } from '../services/reviewService';
import UPReviewRow from "./upReviewRow";
import StarRating from "./common/starRating";

class UserReviews extends Form {
  constructor(props) {
    super(props);

    this.state = {
      data: {
        
      },
      recipeModalTitle: "",
      reviewModalId: "",
      userReviews: [],
      reviewToDeleteId: "",
      errors: {},
    };
  }

  async componentDidMount() {
    this.populateReviews();
  }

  async populateReviews() {
    const reviews = await getUserReviews(this.props.user._id);
    this.setState({ userReviews: reviews.data });
  }

  schema = {
    reviewNotes: Joi.string().required().label("Review Notes"),
    reviewStars: Joi.number().min(0).max(5).required(),
  };

  doSubmit = async () => {
    let toSubmit = {};
    toSubmit.comments = this.state.data.reviewNotes;
    toSubmit.rating = this.state.data.reviewStars;

    await updateReview(this.state.reviewModalId, toSubmit);

    await this.populateReviews();

    const data = { ...this.state.data };
    data.reviewNotes = "";
    data.reviewStars = 0;
    this.setState({ data });
  };

  populateEditModal = (review) => {
    const recipeModalTitle = review.recipeTitle;
    const reviewModalId = review._id;
    const data = { ...this.state.data };
    data.reviewNotes = review.comments;
    data.reviewStars = review.rating;

    this.setState({ recipeModalTitle, reviewModalId, data });
  };

  handleStarChange = (clickedStars) => {
    const data = { ...this.state.data };
    data.reviewStars = clickedStars;
    this.setState({ data });
  };

  handleDeleteReview = async () => {
    await deleteReview(this.state.reviewToDeleteId);
    await this.populateReviews();
  }

  handleDelete = (reviewId) => {
    this.setState({ reviewToDeleteId: reviewId });
  }

  render() { 
    return (
      <React.Fragment>
        <div className="">
          <h3 className="up-heading">Your Reviews</h3>
        </div>
        {this.state.userReviews.map((review) => (
          <div key={review._id}>
            <UPReviewRow
              review={review}
              recipeId={review.recipeId}
              recipeTitle={review.recipeTitle}
              username={review.username}
              rating={review.rating}
              starSize={20}
              date={review.date}
              comments={review.comments}
              onEdit={this.populateEditModal}
              onDelete={this.handleDelete}
            />
          </div>
        ))}

        {/* Edit Review Modal */}
        <div
          className="modal fade"
          id="editModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="edit-modal"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title" id="exampleModalLabel">
                  Edit Review
                </h4>
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
                <p className="edit-review-title">
                  {this.state.recipeModalTitle}
                </p>
                <form onSubmit={this.handleSubmit}>
                  <StarRating
                    starSize={25}
                    onChange={this.handleStarChange}
                    currentStars={this.state.data.reviewStars}
                  />
                  <br></br>
                  {this.renderTextArea("reviewNotes", "", 3, "")}
                  <button
                    onClick={this.handleSubmit}
                    type="button"
                    className="btn btn-dark float-left mt-3"
                    data-dismiss="modal"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary float-left ml-2 mt-3"
                    data-dismiss="modal"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Review Modal */}
        <div
          className="modal fade"
          id="deleteModal"
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
                  This will permanently delete your review and cannot be undone.
                </p>
              </div>
              <div className="modal-footer d-flex justify-content-start">
                <button
                  onClick={this.handleDeleteReview}
                  type="button"
                  className="btn btn-danger"
                  data-dismiss="modal"
                >
                  Delete Review
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
  }
}
 
export default UserReviews;
