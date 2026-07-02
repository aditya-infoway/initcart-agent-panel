import axios from "axios";

const BASE_URL = "https://api.initcart.in"; // Change this to your backend URL

// Public axios instance (no auth required)
export const publicAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Private axios instance (with JWT token)
export const privateAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
privateAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
privateAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        if (response.data.access) {
          localStorage.setItem("accessToken", response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return privateAxios(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - redirect to login
        const { useAuthStore } = await import("../store/authStore");
        useAuthStore.getState().logoutAndRedirect();
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);