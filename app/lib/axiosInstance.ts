import axios from "axios";

const axiosInstance = axios.create({
  // You can set base URL or default headers here
  // baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default axiosInstance;
