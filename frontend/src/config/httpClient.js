import axios from "axios";
import { getApiUrl } from "@/config/apiUrl";
import { isMockDataEnabled } from "@/config/dataSource";
import { mockAdapter } from "@/mockServer";

const httpClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    config.baseURL = getApiUrl();

    if (isMockDataEnabled()) {
      config.adapter = mockAdapter;
    } else {
      delete config.adapter;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!isMockDataEnabled() && error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default httpClient;
