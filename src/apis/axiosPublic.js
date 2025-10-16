import axios from "axios";

const axiosPublic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URI_BACKEND + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosPublic;
