import axios from "axios";
import { base } from "../constants/base"; // "http://localhost:5173"

export const axiosPrivate = axios.create({
    baseURL: `${base}/`,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

export const axiosPublic = axios.create({
    baseURL: `${base}/`,
    headers: { "Content-Type": "application/json" },
});
