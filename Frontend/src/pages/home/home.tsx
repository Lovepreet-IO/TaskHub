import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800  ✅ flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-10 max-w-lg w-full text-center border border-white/20"
            >
                {/* Logo / Title */}
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-white mb-4"
                >
                    Welcome Back
                </motion.h1>

                <p className="text-white/80 mb-8">
                    Manage your tasks efficiently and boost your productivity with our platform.
                </p>

                {/* Buttons */}
                <div className="space-y-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/login")}
                        className="w-full py-3 rounded-xl bg-white text-blue-600 font-semibold shadow-lg hover:shadow-xl transition"
                    >
                        Login
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/register")}
                        className="w-full py-3 rounded-xl bg-transparent border border-white text-white font-semibold hover:bg-white hover:text-blue-600 transition"
                    >
                        Register
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            window.location.href = "http://localhost:8000/oauth/google";
                        }}
                        className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold shadow-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                    >
                        <span><i className="fa-brands fa-google"></i></span> Sign in with Google
                    </motion.button>
                </div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-white/60 text-sm mt-8"
                >
                    © 2026 TaskHub. All rights reserved.
                </motion.p>
            </motion.div>
        </div>
    );
}
