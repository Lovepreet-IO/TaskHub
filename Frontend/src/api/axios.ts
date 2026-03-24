import axios from "axios";
import {showError} from "../components/common/toast";

const api = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true, // send cookies automatically
    headers: {
        "Content-Type": "application/json",
    },
});

let isRedirecting = false;
const forceLogout = (message?: string) => {
    if (isRedirecting) return; // already handling it — don't run twice
    isRedirecting = true;

    localStorage.clear();
    if (message) showError(message);
    window.location.href = "/login";
};


const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
        forceLogout("Session expired. Please login again.");
        throw new Error("No refresh token available");
    }

    try {
        const res = await axios.post(
            "http://localhost:8000/auth/refresh",
            {refresh_token: refreshToken}, // send token in body
            {headers: {"Content-Type": "application/json"}}
        );

        const newAccessToken = res.data.data.access_token;
        localStorage.setItem("access_token", newAccessToken);
        return newAccessToken;
    } catch (err) {
        forceLogout("Session expired due to "+ err + ". Please login again.");
        return new Promise(() => {});
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


            if (error.response?.status === 401) {
                console.log("ACCESS TOKEN EXPIRED, CREATING NEW ACCESS TOKEN...")
                originalRequest._retry = true;

                // Call the new refresh function
                const newToken = await refreshAccessToken();
                console.log("ACCESS TOKEN CREATED, REDIRECTING...");
                // Retry original request
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                // window.location.href = "/login";
                return axios(originalRequest);
            }
            console.log("hello world");

            return Promise.reject(error);


    }
);

export default api;