import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import api from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";
import {showSuccess, showError, showLoading} from "../../components/common/toast";

interface User {
    user_id: number;
    username: string;
}

const CreateTask = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        assigned_to: "",
        due_date: "",
    });

    const [loading, setLoading] = useState(false);

    // ✅ Fetch users
    const fetchUsers = async () => {
        try {
            const res = await api.get("/tasks/get-username");
            setUsers(res.data?.data || []);
        } catch {
            showError("Failed to fetch users", "fetch-users");
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e: any) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!form.title || !form.assigned_to) {
            return showError("Title and Assigned To are required", "validation");
        }

        const toastId = "create-task";

        try {
            setLoading(true);
            showLoading("Creating task...", toastId);

            await api.post("/tasks", {
                ...form,
                assigned_to: Number(form.assigned_to),
                due_date: form.due_date || null,
            });

            showSuccess("Task created successfully", toastId);

            navigate("/tasks");
        } catch {
            showError("Failed to create task", toastId);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="p-6 text-white max-w-2xl mx-auto">

                <h1 className="text-2xl font-bold mb-6">Create Task</h1>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl p-8 space-y-6"
                >

                    <h2 className="text-2xl font-semibold text-white">Create New Task</h2>

                    {/* Grid Layout */}
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="text-sm text-white/70">Title *</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-cyan-400"
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="text-sm text-white/70">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-cyan-400"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="text-sm text-white/70">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10"
                            >
                                <option value="pending" className=" text-black ">Pending</option>
                                <option value="in_progress" className=" text-black ">In Progress</option>
                                <option value="waiting_for_review" className=" text-black ">  Review</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="text-sm text-white/70">Priority</label>
                            <select
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10"
                            >
                                <option value="low" className=" text-black ">Low</option>
                                <option value="medium" className=" text-black ">Medium</option>
                                <option value="high" className=" text-black ">High</option>
                            </select>
                        </div>

                        {/* Assign */}
                        <div>
                            <label className="text-sm text-white/70">Assign To *</label>

                            {loadingUsers ? (
                                <div className="mt-1 p-3 rounded-xl bg-white/5 border border-white/10 animate-pulse text-white/50">
                                    Loading users...
                                </div>
                            ) : (
                                <select
                                    name="assigned_to"
                                    value={form.assigned_to}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-cyan-400"
                                    required
                                >
                                    <option value=""  className=" text-black ">Select User</option>
                                    {users.map((u) => (
                                        <option key={u.user_id} value={u.user_id}  className=" text-black ">
                                            {u.username}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="text-sm text-white/70">Due Date</label>
                            <input
                                type="date"
                                name="due_date"
                                value={form.due_date}
                                onChange={handleChange}
                                className="w-full mt-1 p-3 rounded-xl  bg-white/5 border border-white/10"
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || loadingUsers}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold disabled:opacity-50"
                    >
                        {loading ? "Creating..." : loadingUsers ? "Loading users..." : "Create Task"}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
};

export default CreateTask;