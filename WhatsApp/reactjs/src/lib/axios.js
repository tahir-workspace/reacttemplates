import axios from "axios";
import config from "../config";
import Cookies from "js-cookie";

export const axiosInstance = axios.create({
  baseURL: config.serverBaseUrl + "/api",
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (req) => {
    const token = Cookies.get("jwt");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (err) => Promise.reject(err)
);
