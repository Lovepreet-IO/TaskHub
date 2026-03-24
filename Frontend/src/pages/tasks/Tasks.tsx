// src/pages/Tasks.tsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaUndo } from "react-icons/fa";
import { showSuccess, showError, toastPromise} from "../../components/common/toast";

const ITEMS_PER_PAGE = 5;

const Tasks = () => {
    const navigate = useNavigate();
    const { user } = useUser();

    const [givenByMe, setGivenByMe] = useState<any[]>([]);
    const [myTasks, setMyTasks] = useState<any[]>([]);
    const [allTasks, setAllTasks] = useState<any[]>([]);
    const [deletedTasks, setDeletedTasks] = useState<any[]>([]);

    const [activeTab, setActiveTab] = useState("");
    const [filters, setFilters] = useState({ status: "", priority: "" });
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sort, setSort] = useState("latest");

    // ✅ Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.toLowerCase());
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // ✅ Fetch Tasks
    const fetchTasks = async () => {
        // const toastId = showLoading("Fetching tasks...");

        try {
            const res = await api.get("/tasks");
            const data = res.data?.data;

            setGivenByMe(data?.TaskGivenByYou || []);

            if (user?.isAdmin) {
                setAllTasks(data?.AllTasks?.tasks || []);

                const deletedRes = await api.get("/tasks/deleted");
                setDeletedTasks(
                    deletedRes.data?.data?.DeletedTasks || []
                );
            } else {
                setMyTasks(data?.MyTasks || []);
            }

            setActiveTab((prev) =>
                prev ? prev : user?.isAdmin ? "all" : "assigned_to_me"
            );

            showSuccess("Tasks loaded successfully" );

        } catch (err: any) {
            console.error(err);

            if (err.response?.status === 401) {
                showError("Session expired. Please login again." );
                navigate("/login");
            } else {
                showError("Failed to fetch tasks" );
            }
        }
    };
    useEffect(() => {
        if (user) fetchTasks();
    }, [user]);

    // ✅ Tabs
    const tabs = user?.isAdmin
        ? [
            { key: "all", label: "All Tasks" },
            { key: "assigned_by_me", label: "Tasks Given By Me" },
            { key: "deleted", label: "Deleted Tasks" },
        ]
        : [
            { key: "assigned_to_me", label: "My Tasks" },
            { key: "assigned_by_me", label: "Tasks Given By Me" },
        ];

    // ✅ Select data
    const currentTasks = useMemo(() => {
        if (activeTab === "assigned_by_me") return givenByMe;
        if (activeTab === "assigned_to_me") return myTasks;
        if (activeTab === "deleted") return deletedTasks;
        return allTasks;
    }, [activeTab, givenByMe, myTasks, allTasks, deletedTasks]);

    // ✅ Filter
    const filteredTasks = useMemo(() => {
        return currentTasks.filter((task) => {
            const matchStatus = filters.status ? task.status === filters.status : true;
            const matchPriority = filters.priority ? task.priority === filters.priority : true;

            const matchSearch = debouncedSearch
                ? (
                    task.title +
                    task.description +
                    (task.assigned_to_name || "") +
                    (task.assigned_by_name || "")
                )
                    .toLowerCase()
                    .includes(debouncedSearch)
                : true;

            return matchStatus && matchPriority && matchSearch;
        });
    }, [currentTasks, filters, debouncedSearch]);

    // ✅ Sort
    const sortedTasks = useMemo(() => {
        const tasks = [...filteredTasks];

        switch (sort) {
            case "latest":
                return tasks.sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
            case "oldest":
                return tasks.sort(
                    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
            case "az":
                return tasks.sort((a, b) => a.title.localeCompare(b.title));
            case "za":
                return tasks.sort((a, b) => b.title.localeCompare(a.title));
            default:
                return tasks;
        }
    }, [filteredTasks, sort]);

    // ✅ Pagination (FIXED)
    const totalPages = Math.ceil(sortedTasks.length / ITEMS_PER_PAGE);

    const paginatedTasks = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return sortedTasks.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedTasks, page]);

    useEffect(() => {
        setPage(1);
    }, [activeTab, filters, debouncedSearch, sort]);

    // ✅ DELETE

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this task?")) return;

        await toastPromise(
            api.delete(`/tasks/${id}`),
            {
                loading: "Deleting task...",
                success: "Task deleted",
                error: "Delete failed",
            }
        );

        fetchTasks();
    };

    // ✅ RESTORE
    const handleRestore = async (id: number) => {
        try {
            await api.put(`/tasks/restore/${id}`);
            showSuccess("Task restored");
            fetchTasks();
        } catch {
            showError("Failed to restore task");
        }
    };

    // ✅ TABLE
    const renderTable = (tasks: any[]) => (
        <div className="overflow-x-auto bg-white/10 rounded-2xl">
            <table className="w-full text-left">
                <thead className="bg-white/10 text-gray-300">
                <tr>
                    <th className="p-3">Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Assigned By</th>
                    {user?.isAdmin && <th>Action</th>}
                </tr>
                </thead>
                <tbody>
                {tasks.map((task) => (
                    <tr
                        key={task.task_id}
                        onClick={() => navigate(`/tasks/${task.task_id}`)}
                        className="border-t border-white/10 cursor-pointer hover:bg-white/5 transition group"
                    >
                        <td className="p-3">{task.title}</td>
                        <td>{task.description}</td>

                        {/* Status Badge */}
                        <td>
                                <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300">
                                    {task.status}
                                </span>
                        </td>

                        <td>{task.priority}</td>
                        <td>{task.assigned_to_name || "-"}</td>
                        <td>{task.assigned_by_name || "-"}</td>

                        {user?.isAdmin && (
                            <td
                                onClick={(e) => e.stopPropagation()} // 🚫 prevent row click
                                className="text-center"
                            >
                                {user?.isAdmin && !task.is_deleted && (
                                    <button
                                        onClick={() => handleDelete(task.task_id)}
                                        className="p-2 rounded-lg hover:bg-red-500/20 group transition"
                                    >
                                        <FaTrash className="text-red-400 group-hover:text-red-300 text-sm" />
                                    </button>
                                )}

                                {user?.isAdmin && task.is_deleted && (
                                    <button
                                        onClick={() => handleRestore(task.task_id)}
                                        className="p-2 rounded-lg hover:bg-green-500/20 group transition"
                                    >
                                        <FaUndo className="text-green-400 group-hover:text-green-300 text-sm" />
                                    </button>
                                )}
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <AppLayout>
            <h1 className="text-2xl font-bold mb-6 text-white">Tasks</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg ${
                            activeTab === tab.key
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "text-gray-400"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 rounded bg-white/10 text-white"
                />

                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="bg-white/10 text-white p-2 rounded"
                >
                    <option value="" className=" text-black ">All Status</option>
                    <option value="pending" className=" text-black ">Pending</option>
                    <option value="in_progress" className=" text-black ">In Progress</option>
                    <option value="waiting_for_review" className=" text-black ">Review</option>
                    <option value="completed" className=" text-black ">Completed</option>
                </select>

                <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="bg-white/10 text-white p-2 rounded"
                >
                    <option value="" className=" text-black ">All Priority</option>
                    <option value="low" className=" text-black ">Low</option>
                    <option value="medium" className=" text-black ">Medium</option>
                    <option value="high" className=" text-black ">High</option>
                </select>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="bg-white/10 text-white p-2 rounded"
                >
                    <option value="latest" className=" text-black ">Latest</option>
                    <option value="oldest" className=" text-black ">Oldest</option>
                    <option value="az" className=" text-black ">A-Z</option>
                    <option value="za" className=" text-black ">Z-A</option>
                </select>
            </div>

            {/* Table */}
            {paginatedTasks.length > 0 ? renderTable(paginatedTasks) : <p>No tasks</p>}

            {/* Pagination */}
            <div className="flex gap-2 mt-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1 rounded ${
                            page === p ? "bg-cyan-500" : "bg-white/10"
                        }`}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </AppLayout>
    );
};

export default Tasks;