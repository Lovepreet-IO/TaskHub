import api from "../../api/axios";
import { showSuccess, showError } from "../../components/common/toast";

const Logout = async () => {
    try {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");

        await api.post(
            "/auth/logout",
            {
                refresh_token: refreshToken,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        localStorage.clear();
        showSuccess("Logged out successfully");
    } catch (error) {
        console.error("Logout failed:", error);
        showError("Logout failed, forcing logout");
        localStorage.clear();
    }
    finally {
        window.location.href = "/login";
    }
};


export default Logout;