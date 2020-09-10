import http from "./httpService";

const apiEndpoint = "/recipes";

function recipeUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getRecipe(recipeId) {
  return http.get(recipeUrl(recipeId));
}
export function updateRecipe(recipeId, recipe) {
  return http.patch(recipeUrl(recipeId), recipe);
}

export function getRecipes() {
  return http.get(apiEndpoint);
}

export function getPublishedRecipes() {
  return http.get(apiEndpoint)
}

export function deleteRecipe(recipeId) {
  return http.delete(recipeUrl(recipeId));
}

export function newRecipe(recipe) {
  return http.post(
    apiEndpoint,
    recipe
  ); 
}

export function getReviews(recipe) {
  let reviewsUrl = apiEndpoint + "/" + recipe + "/reviews";
  return http.get(reviewsUrl);
}