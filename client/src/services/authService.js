import http from "./httpService";
import jwtDecode from "jwt-decode";
const apiEndpoint = "/auth";
const tokenKey = "token";

http.setJwt(getJwt());

export async function login(email, password) {
  const res = await http.post(apiEndpoint, { email, password });
  localStorage.setItem(tokenKey, res.headers["x-auth-token"]);
}

export async function changePassword(email, oldPassword, newPassword) {
  const res = await http.patch(apiEndpoint, { email, oldPassword, newPassword });
  localStorage.setItem(tokenKey, res.headers["x-auth-token"]);
  return res;
}

export function loginWithJwt(jwt) {
  localStorage.setItem(tokenKey, jwt);
}
export function logout() {
  localStorage.removeItem(tokenKey);
}

export function getCurrentUser() {
  try {
    const jwt = localStorage.getItem(tokenKey);
    return jwtDecode(jwt);
  } catch (ex) {
    return null;
  }
}

export function getJwt() {
  return localStorage.getItem(tokenKey);
}

export function isAuthenticated() {
  return localStorage.getItem(tokenKey) != null;
}

export default {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getJwt,
  isAuthenticated,
};
