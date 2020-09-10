import http from "./httpService";

const apiEndpoint = "/users";

function userUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function register(user) {
  return http.post(apiEndpoint, {
    email: user.email,
    username: user.username,
    password: user.password,
  });
}

export function getUserData(userId) {
  return http.get(userUrl(userId));
}

export function getUserRecipes(id) {
  return http.get(userUrl(id) + "/recipes");
}

export function updateShoppingList(userId, addedItems, removedItems) {
  return http.patch(userUrl(userId), { addedItems, removedItems });
}

export function addToShoppingList(userId, itemsToAdd) {
  return http.post(userUrl(userId) + "/items", { itemsToAdd });
}

export function deleteItemFromShoppingList(userId, removedItems) {
  return http.patch(userUrl(userId), { removedItems });
}

export function clearAllFromShoppingList(userId, addedItems, removedItems) {
  return http.patch(userUrl(userId), { addedItems, removedItems });
}

export function updateUserProperty(userId, data) {
  return http.patch(userUrl(userId), data);
}

export function updateItemCounts(userId, itemCounts) {
  return http.patch(userUrl(userId), { itemCounts });
}

export function getUserReviews(id) {
  return http.get(userUrl(id) + "/reviews");
}