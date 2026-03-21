import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../components/common/toast.ts";


const OAuthSuccess = () => {
    const navigate = useNavigate();
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const params = new URLSearchParams(window.location.search);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token && access_token.length > 0) {
            localStorage.setItem("access_token",  access_token);
            localStorage.setItem("refresh_token",  refresh_token);

            // clean URL
            window.history.replaceState({}, document.title, "/oauth-success");
            showSuccess("Login successful");
            navigate("/dashboard");
        } else {
            showError("OAuth login failed");
            navigate("/login");
        }
    }, [navigate]);

    return <div>Logging you in...</div>;
};

export default OAuthSuccess;