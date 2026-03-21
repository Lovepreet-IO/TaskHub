import axios from "axios";
import { showError } from "../components/common/toast.ts";

const api = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true, // send cookies automatically
    headers: {
        "Content-Type": "application/json",
    },
});

const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token available");

    try {
        const res = await axios.post(
            "http://localhost:8000/auth/refresh",
            { refresh_token: refreshToken }, // send token in body
            { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = res.data.data.access_token;
        localStorage.setItem("access_token", newAccessToken);
        return newAccessToken;
    } catch (err) {
        showError("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login"; // redirect to login
        throw err;
    }
};

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Call the new refresh function
            const newToken = await refreshAccessToken();

            // Retry original request
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(originalRequest);
        }

        return Promise.reject(error);
    }
);

export default api;