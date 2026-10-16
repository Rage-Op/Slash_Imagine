import axios from "axios";
import { store } from "../state/store";
import { setLogout } from "../state/state";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user?.token;
    if (token) {
      config.headers["x-access-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(setLogout());
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
