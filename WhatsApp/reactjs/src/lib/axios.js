import axios from "axios";
import config from "../config"; // adjust if named/default export differs

// create axios instance
export const axiosInstance = axios.create({
  baseURL: config.serverBaseUrl + "/api",
  withCredentials: true,
  headers: {
    Accept: "application/json, text/plain, */*",
  },
});

// add interceptor immediately after creation
axiosInstance.interceptors.request.use(
  (req) => {
    try {
      console.log("[axiosInstance] request interceptor running:", req.url);

      let token;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("accessToken");
      }

      if (token) {
        req.headers = req.headers || {};
        req.headers.Authorization = `Bearer ${token}`;
        console.log("[axiosInstance] attached token");
      } else {
        console.log("[axiosInstance] no token found in storage");
      }

      return req;
    } catch (err) {
      console.error("[axiosInstance] interceptor error", err);
      return req;
    }
  },
  (err) => {
    console.error("[axiosInstance] request interceptor rejected", err);
    return Promise.reject(err);
  }
);
