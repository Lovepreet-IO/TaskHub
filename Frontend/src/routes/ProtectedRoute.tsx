// routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import type {JSX} from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem("access_token");

    if (!token) return <Navigate to="/login" />;
    return children;
};

export default ProtectedRoute;