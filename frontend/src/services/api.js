import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

let credentials = null;

export function setCredentials(username, password) {
  credentials = { username, password };
}

export function clearCredentials() {
  credentials = null;
}

api.interceptors.request.use((config) => {
  if (credentials) config.auth = credentials;
  return config;
});

export default api;
