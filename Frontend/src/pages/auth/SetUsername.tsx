import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../components/common/toast";
import useAuthRedirect from "../../routes/useAuthRedirect";




const SetUsername = () => {
    const navigate = useNavigate();
    useAuthRedirect()

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    const [username, setUsername] = useState("");
    const [available, setAvailable] = useState<null | boolean>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // 🔍 Username availability check
    useEffect(() => {
        if (username.trim().length < 3) {
            setAvailable(null);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const res = await fetch(
                    `http://localhost:8000/auth/check-username?username=${username}`
                );
                const data = await res.json();
                setAvailable(data.available);
            } catch {
                console.error("Username check failed");
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [username]);

    const isValidUsername =
        username.trim().length >= 3 && available === true;

    const handleSubmit = async () => {
        if (!isValidUsername) {
            showError("Username must be at least 3 characters and available");
            return;
        }

        setLoading(true);
        setError("");

        try {
            let res;

            if (token) {
                res = await fetch("http://localhost:8000/auth/set-username", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, username }),
                });
            } else {
                const registerData = JSON.parse(
                    localStorage.getItem("register_data") || "null"
                );

                if (!registerData) {
                    setError("Invalid signup flow");
                    setLoading(false);
                    return;
                }

                res = await fetch("http://localhost:8000/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...registerData,
                        username,
                    }),
                });
            }

            const data = await res.json();

            if (!data.success) {
                showError(data.message || "Something went wrong");
                setLoading(false);
                return;
            }

            localStorage.removeItem("register_data");
            localStorage.setItem("access_token", data.data.access_token);
            localStorage.setItem("refresh_token", data.data.refresh_token);
            showSuccess("Account setup complete");
            navigate("/dashboard");

        } catch {
            showError("Server error");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4">

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">

                {/* Title */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">
                        Choose Username
                    </h2>
                    <p className="text-sm text-white/60 mt-1">
                        This will be your unique identity
                    </p>
                </div>

                {/* Input */}
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setError("");
                        }}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/10
                                   text-white placeholder-white/50
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Validation messages */}
                    {username.length > 0 && username.length < 3 && (
                        <p className="text-red-400 text-sm">
                            Must be at least 3 characters
                        </p>
                    )}

                    {username.length >= 3 && available === true && (
                        <p className="text-green-400 text-sm">
                            ✅ Username available
                        </p>
                    )}

                    {username.length >= 3 && available === false && (
                        <p className="text-red-400 text-sm">
                            ❌ Username already taken
                        </p>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!isValidUsername || loading}
                    className={`w-full py-3 rounded-xl font-semibold transition ${
                        isValidUsername
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-white/20 text-white/50 cursor-not-allowed"
                    }`}
                >
                    {loading ? "Creating..." : "Continue"}
                </button>

            </div>
        </div>
    );
};

export default SetUsername;