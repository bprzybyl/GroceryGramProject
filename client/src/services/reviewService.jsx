import http from "./httpService";

const apiEndpoint = "/reviews";

function reviewsUrl(id) {
    return `${apiEndpoint}/${id}`;
}

export function deleteReview(Id) {
    return http.delete(reviewsUrl(Id));
}

export function newReview(review) {
    return http.post(
        apiEndpoint,
        review
    );
}

export function updateReview(Id, review) {
    return http.patch(reviewsUrl(Id), review);
}