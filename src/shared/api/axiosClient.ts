import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/",
  headers: {
    "Content-Type": "application/json",
  }
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Let the browser set Content-Type automatically for FormData
    // (it must include the multipart boundary, which only the browser knows)
    if (config.data instanceof FormData) {
      delete (config.headers as any)["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;