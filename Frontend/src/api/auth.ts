import api from "./axios";

export const loginUser = (data: { email: string; password: string }) => {
    return api.post("/auth/login", data);
};

export const registerUser = (data: { email: string; password: string }) => {
    return api.post("/auth/register", data);
};