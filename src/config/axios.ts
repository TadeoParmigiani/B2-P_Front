import axios from "axios";
import { auth } from "@/firebase/firebase";

const firebaseAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

firebaseAxios.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      const newToken = await user.getIdToken(true);
      localStorage.setItem("token", newToken);
      config.headers.Authorization = `Bearer ${newToken}`;
    } else {
      const token = localStorage.getItem("token")?.replaceAll('""', "");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

firebaseAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true);
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return firebaseAxios(originalRequest);
        }
      } catch (error) {
        console.error(error);
      }
    }

    return Promise.reject(error);
  }
);

export { firebaseAxios };