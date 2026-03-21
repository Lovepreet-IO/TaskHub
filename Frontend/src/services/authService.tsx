// src/services/authService.ts

import api from "../api/axios.ts";

export const logoutUser = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    const res = await api.post("/auth/logout", {
        refresh_token: refreshToken,
    });

    return res.data;
};