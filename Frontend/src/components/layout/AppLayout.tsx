import { type ReactNode, useState } from "react";
import { useUser } from "../../hooks/useUser";
import { motion } from "framer-motion";
import {
    FaTachometerAlt,
    FaTasks,
    FaPlus,
    FaClipboardList,
    FaChevronLeft,
    FaChevronRight,
    FaSignOutAlt,
    FaUserCircle, FaBars
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logout from "../../pages/auth/Logout";


export const AppLayout = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    if (loading) {
        return <div className="text-white text-center mt-20">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white">

            <Sidebar
                open={sidebarOpen}
                setOpen={setSidebarOpen}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <div className={`flex-1 flex flex-col h-screen overflow-hidden ${collapsed ? "md:ml-20" : "md:ml-64"}`}>

                {/* ✅ Sticky Navbar */}
                <div className="sticky top-0 z-50">
                    <Navbar user={user} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                </div>

                {/* ✅ Scroll only content */}
                <motion.main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    {children}
                </motion.main>
            </div>
        </div>
    );
};

// ================= SIDEBAR =================
const Sidebar = ({
                     open,
                     setOpen,
                     collapsed,
                     setCollapsed,
                 }: any) => {
    const location = useLocation();

    const menu = [
        { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
        { name: "All Tasks", path: "/tasks", icon: <FaTasks /> },
        { name: "Create Task", path: "/tasks/create", icon: <FaPlus /> },
        { name: "Task Logs", path: "/logs", icon: <FaClipboardList /> },
    ];

    const handleLogout = () => {
        Logout();
    };

    return (
        <>
            {/* MOBILE OVERLAY */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <div
                className={`fixed top-0 left-0 h-full z-50 bg-[#0f172a] border-r border-white/10 p-4 flex flex-col justify-between transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
            >
                {/* TOP */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        {!collapsed && (
                            <h1 className="text-2xl font-bold text-cyan-400">
                                TaskHub
                            </h1>
                        )}

                        {/* DESKTOP COLLAPSE BUTTON */}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden md:block text-white"
                        >
                            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
                        </button>
                    </div>

                    {/* MENU */}
                    <div className="space-y-2">
                        {menu.map((item) => {
                            const isActive = location.pathname === item.path;

                            return (
                                <Link key={item.path} to={item.path}>
                                    <div
                                        className={`p-3 rounded-xl transition cursor-pointer flex items-center gap-3
                    ${isActive
                                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                                            : "hover:bg-white/5 text-gray-300"
                                        }`}
                                    >
                                        {/* ICON */}
                                        <span className="text-lg">{item.icon}</span>

                                        {/* TEXT */}
                                        {!collapsed && (
                                            <span className="text-sm font-medium">
                            {item.name}
                        </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* LOGOUT */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-400 hover:bg-red-500 hover:text-white transition p-3 rounded-xl"
                >
                    <FaSignOutAlt />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </>
    );
};

// ================= NAVBAR =================
const Navbar = ({ user, toggleSidebar }: any) => {
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Map routes to titles
    const routeTitles: Record<string, string> = {
        "/dashboard": "Dashboard",
        "/tasks/create": "Create Task",
        "/tasks": "Tasks",
        "/profile": "Profile",
        "/logs": "Logs",
        // add more routes here as needed
    };

    // Handle dynamic routes like /tasks/123
    const getTitle = () => {
        if (location.pathname.startsWith("/tasks/") && !["/tasks/create", "/tasks"].includes(location.pathname)) {
            return "Task Details";
        }
        return routeTitles[location.pathname] || "Dashboard"; // fallback
    };

    return (
        <div className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/10 bg-white/5 backdrop-blur z-100 sticky-top">
            {/* LEFT */}
            <div className="flex items-center gap-4">
                {/* MOBILE MENU */}
                <button className="md:hidden" onClick={toggleSidebar}>
                    <FaBars size={20} />
                </button>

                <h2 className="text-lg font-semibold">{getTitle()}</h2>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4 relative">
                <span className="hidden sm:block">
                    Welcome, {user?.username}
                </span>

                <div
                    className="relative"
                    onMouseEnter={() => setShowProfile(true)}
                    onMouseLeave={() => setShowProfile(false)}
                >
                    <FaUserCircle
                        size={30}
                        className="cursor-pointer text-cyan-400"
                        onClick={() => navigate("/profile")}
                    />

                    {showProfile && (
                        <div className="absolute right-0 top-10 w-64 bg-white text-black p-4 rounded-xl shadow-xl z-50">
                            <p className="font-semibold">{user?.name}</p>
                            <p className="text-sm">{user?.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Signed in by: {user?.signInBy}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppLayout;