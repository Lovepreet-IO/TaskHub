import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        first_name: "",
        password: "",
        email:""
    });

    const [emailAvailable, setEmailAvailable] = useState<null | boolean>(null);
    const [loadingNormal, setNormalLoading] = useState(false);
    const [loadingGoogle, setGoogleLoading] = useState(false);
    const validateEmailFormat = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setForm({ ...form, [name]: value });
        if (name === "email") {
            if (!validateEmailFormat(value)) {
                setEmailAvailable(null); // reset availability
                setErrors((prev) => ({
                    ...prev,
                    email: "Please enter a valid email address",
                }));
                return; // stop further checks
            } else {
                setErrors((prev) => ({ ...prev, email: "" }));
            }
        }

        // ✅ validation (restored)
        if (name === "first_name") {
            if (value.length < 3) {
                setErrors((prev) => ({
                    ...prev,
                    first_name: "First name must be at least 3 characters",
                }));
            } else {
                setErrors((prev) => ({ ...prev, first_name: "" }));
            }
        }

        if (name === "password") {
            if (value.length < 6) {
                setErrors((prev) => ({
                    ...prev,
                    password: "Password must be at least 6 characters",
                }));
            } else {
                setErrors((prev) => ({ ...prev, password: "" }));
            }
        }
    };

    useEffect(() => {
        if (!form.email.trim() || errors.email) return; // skip if empty or invalid

        const timeout = setTimeout(async () => {
            const res = await fetch(
                `http://localhost:8000/auth/check-email?email=${form.email}`
            );
            const data = await res.json();
            setEmailAvailable(data.available);
        }, 500);

        return () => clearTimeout(timeout);
    }, [form.email, errors.email]);

    const isFormValid =
        form.first_name.length >= 3 &&
        form.password.length >= 6 &&
        emailAvailable === true;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setNormalLoading(true);

        localStorage.setItem("register_data", JSON.stringify(form));
        toast.success("Continue to set username");
        navigate("/set-username");
    };

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        window.location.href = "http://localhost:8000/oauth/google";
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center px-4">
            <motion.form
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                onSubmit={handleSubmit}
                className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md space-y-4"
            >
                <h2 className="text-3xl font-bold text-center text-white">Create Account</h2>

                <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} className="input" />
                {errors.first_name && (
                    <p className="text-red-300 text-sm">{errors.first_name}</p>
                )}
                <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="input" />
                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="input"
                />
                {errors.email && (
                    <p className="text-red-300 text-sm">{errors.email}</p>
                )}
                {emailAvailable === true && !errors.email && (
                    <p className="text-green-300 text-sm">Email available</p>
                )}
                {emailAvailable === false && !errors.email && (
                    <p className="text-red-300 text-sm">Email already exists</p>
                )}

                <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input" />

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    disabled={!isFormValid || loadingNormal}
                    className={`w-full py-3 rounded-xl font-semibold ${
                        isFormValid
                            ? "bg-white text-purple-700"
                            : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                >
                    {loadingNormal ? "Loading..." : "Continue"}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    type="button"
                    onClick={handleGoogleLogin}
                    className="btn-google"
                >
                    {loadingGoogle ? "Loading..." : "Sign in with Google"}
                </motion.button>

                <p className="text-center text-white/80 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="underline font-bold">Login</Link>
                </p>
            </motion.form>
        </div>
    );
};

export default Register;