import { useAuthStore } from "@/hooks/authStore";
import axios from "axios";

const axiosPrivate = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URI_BACKEND + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosPrivate.interceptors.request.use(
  (config) => {
    const token =
      useAuthStore.getState().token || localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Entro al intercepto");
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      console.log("Entro al if dado que no es autorizado");
      originalRequest._retry = true;

      const refresh_token = localStorage.getItem("refresh_token");
      const token = localStorage.getItem("token");

      if (!refresh_token || !token) {
        console.error("Token y refresh token no válidos");
        return Promise.reject(error);
      }

      try {
        console.log("Token y refresh token validos");
        if (!refreshPromise) {
          refreshPromise = axios.post(
            process.env.NEXT_PUBLIC_URI_BACKEND +
              "/api" +
              process.env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN,
            {
              refresh_token: refresh_token,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        }

        const response = await refreshPromise;
        refreshPromise = null;

        const newToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        useAuthStore.getState().setTokens(newToken, newRefreshToken);

        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosPrivate(originalRequest);
      } catch (err) {
        console.error("Error actualizando token:", err);
        useAuthStore.getState().logout();
        window.location.href = "/";
      }
    }
    // else {
    //   console.error("Token y refresh token no validos!");
    //   useAuthStore.getState().logout();
    //   window.location.href = "/";
    // }

    return Promise.reject(error);
  }
);

export default axiosPrivate;
