// src/pages/Profile.tsx

import { useEffect, useState } from "react";
import api from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";
import { showSuccess, showError } from "../../components/common/toast";
import {useNavigate} from "react-router-dom";


const Profile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [form, setForm] = useState({ username: "", name: "" });
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [loadingUsername, setLoadingUsername] = useState(false);
    const [passwords, setPasswords] = useState({ current: "", new: "" });
    const navigate = useNavigate();

    // 🔹 Fetch profile
    useEffect(() => {
        const fetchProfile = async () => {
            const res = await api.get("/profile");
            setProfile(res.data.data);
            setForm({ username: res.data.data.username, name: res.data.data.name });
        };
        fetchProfile();
    }, []);

    // 🔍 Username check (debounce)
    useEffect(() => {
        if (!form.username || form.username === profile?.username) {
            setUsernameAvailable(null);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setLoadingUsername(true);
                const res = await api.get(`/auth/check-username?username=${form.username}`);
                setUsernameAvailable(res.data.available);
            } catch {
                setUsernameAvailable(null);
            } finally {
                setLoadingUsername(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [form.username, profile]);

    const handleUpdate = async () => {
        try {
            if (usernameAvailable === false) {
                return showError("Username not available");
            }

            await api.put("/profile/username", form);
            showSuccess("Profile updated");
            navigate("/dashboard")
        } catch {
            showError("Failed to update profile");
        }
    };

    const handlePassword = async () => {
        try {
            await api.put("/profile/password", {
                current_password: passwords.current,
                new_password: passwords.new,
            });

            showSuccess("Password updated");
        } catch {
            showError("Failed to update password");
        }
    };

    if (!profile) return <div className="text-center mt-20">Loading...</div>;

    return (
        <AppLayout >
            <div className="min-h-screen py-10 px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-10 space-y-8">

                    <h2 className="text-3xl font-bold text-gray-800 text-center">Profile Settings</h2>

                    {/* Two-column layout on medium+ screens */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                className="w-full border-gray-300 border text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            {loadingUsername && <p className="text-sm text-gray-500 mt-1">Checking...</p>}
                            {usernameAvailable === true && <p className="text-sm text-green-500 mt-1">✅ Available</p>}
                            {usernameAvailable === false && <p className="text-sm text-red-500 mt-1">❌ Taken</p>}
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full border-gray-300 border text-black  rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        {/* Email (readonly) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                value={profile.email}
                                disabled
                                className="w-full border-gray-300 text-black border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                            />
                        </div>

                    </div>

                    {/* Update Profile Button */}
                    <button
                        onClick={handleUpdate}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
                    >
                        Update Profile
                    </button>

                    {/* Password Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Password</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.signInBy !== "GOOGLE" && (
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                    className="w-full border-gray-300 text-black  border rounded-lg px-3 py-2"
                                />
                            )}

                            <input
                                type="password"
                                placeholder="New Password"
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full border-gray-300 text-black border rounded-lg px-3 py-2"
                            />
                        </div>

                        <button
                            onClick={handlePassword}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition"
                        >
                            {profile.signInBy === "GOOGLE" ? "Set Password" : "Update Password"}
                        </button>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
};

export default Profile;