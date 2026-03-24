import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

export interface UserData {
    user_id: number;
    username: string;
    email: string;
    name: string;
    signInBy: string;
    isAdmin: boolean;
}

export interface UserContextType {
    user: UserData | null;
    setUser: (user: UserData | null) => void;
    loading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: any) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ Load from localStorage instantly
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // ✅ Fetch fresh user
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("access_token");

                if (!token) {
                    setUser(null);
                    setLoading(false); // ⚠️ FIX (was missing)
                    return;
                }

                const res = await api.get("/dashboard/");
                const freshUser = res.data?.data?.profile;

                setUser({ isAdmin: false, ...freshUser });
                localStorage.setItem("user", JSON.stringify({ isAdmin: false, ...freshUser }));

            } catch (err) {
                console.error("User fetch failed", err);
                setUser(null);
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};