import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:8800/api",
  withCredentials: true, // This allows cookies to be sent with requests
});