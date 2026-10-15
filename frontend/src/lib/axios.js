import axios from "axios";
import { store } from "../main.jsx";
import { setLogout } from "../state/state";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

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
