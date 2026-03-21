// src/pages/Login.tsx
import {useEffect, useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios.ts";
import { showSuccess, showError } from "../../components/common/toast.ts";

import { motion } from "framer-motion";

export const Login = () => {
    // localStorage.clear()
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [loadingNormal, setNormalLoading] = useState(false);
    const [loadingGoogle, setGoogleLoading] = useState(false);


    useEffect(() => {
        const oldAccessToken = localStorage.getItem("access_token");
        if (oldAccessToken) {
            navigate("/dashboard");
        }
    }, [navigate]);



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNormalLoading(true);

        try {
            const res = await api.post("/auth/login", form);
            const accessToken = res.data?.data?.access_token;
            const refreshToken = res.data?.data?.refresh_token;

            if (!accessToken) {
                showError("No access token received");
                console.log("No access token received");
                return;
            }

            localStorage.setItem("access_token",  accessToken);
            localStorage.setItem("refresh_token",  refreshToken);
            showSuccess("Login successful", "login-success");
            navigate("/dashboard");

        } catch (err: any) {

            showError(err.response?.data?.detail || "Login failed");
        } finally {
            setNormalLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        window.location.href = "http://localhost:8000/oauth/google";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800  ✅ flex items-center justify-center px-4">
            <motion.form
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                onSubmit={handleSubmit}
                className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-5"
            >
                <h2 className="text-3xl font-bold text-center text-white">Welcome Back</h2>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                />

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loadingNormal}
                    className="w-full py-3 rounded-xl bg-white text-purple-700 font-semibold"
                >
                    {loadingNormal ? "Loading..." : "Login"}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    disabled={loadingGoogle}
                    onClick={handleGoogleLogin}
                    className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold"
                >
                    {loadingGoogle ? "Loading..." : "Sign in with Google"}
                </motion.button>

                <p className="text-center text-white/80 text-sm">
                    Don’t have an account?{" "}
                    <Link to="/register" className="font-bold underline">
                        Register
                    </Link>
                </p>
            </motion.form>
        </div>
    );
};

export default Login;