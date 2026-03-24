import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import api from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";
import {showSuccess, showError, showLoading} from "../../components/common/toast";

interface Task {
    task_id: number;
    title: string;
    description?: string;
    status: string;
    priority?: string;
    assigned_to?: number;
    due_date?: string;
}

interface Log {
    log_id: number;
    action: string;
    username: string;
    created_at: string;
}

const TaskDetails = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState<Task | null>(null);
    const [logs, setLogs] = useState<Log[]>([]);
    const [comment, setComment] = useState("");

    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<any>({});

    interface Task_Comment {
        comment_id: number;
        task_id: number;
        user_id: number;
        message: string;
        created_at: string;
    }

    const [comments, setComments] = useState<Task_Comment[]>([]);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/tasks/comment/${id}`);
            const commentData = res.data?.data?.Comment;
            if (commentData) {
                setComments(commentData);
            } else {
                setComments([]);
            }
        } catch (err) {
            console.error("Error fetching comments", err);
            showError("Failed to fetch comments", "fetch-comments");
        }
    };


    // ✅ Format Date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (status: string) => {
        if (status === "pending") return "bg-yellow-500/20 text-yellow-400";
        if (status === "in_progress") return "bg-blue-500/20 text-blue-400";
        if (status === "completed") return "bg-green-500/20 text-green-400";
        return "bg-gray-500/20 text-gray-400";
    };

    // ================= API =================

    const fetchTask = async () => {
        try {
            const res = await api.get(`/tasks/${id}`);
            const data = res.data?.data || null;
            setTask(data);
            setForm(data);
        } catch {
            showError("Failed to fetch task", "fetch-task");
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await api.get(`/tasks/${id}/logs`);
            setLogs(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch {
            showError("Failed to fetch logs", "fetch-logs");
        }
    };

    const updateTask = async () => {
        const toastId = `update-${id}`;

        try {
            showLoading("Updating task...", toastId);

            await api.put(`/tasks/${id}`, form);

            showSuccess("Task updated successfully", toastId);
            setEditMode(false);
            fetchTask();
            fetchLogs();
        } catch {
            showError("Failed to update task", toastId);
        }
    };

    const addComment = async () => {
        if (!comment.trim()) {
            return showError("Comment cannot be empty", "empty-comment");
        }

        const toastId = `comment-${id}`;

        try {
            showLoading("Adding comment...", toastId);

            await api.post(`/tasks/${id}/comment`, {message: comment});

            setComment("");
            fetchLogs();
            fetchComments(); // ✅ refresh comments

            showSuccess("Comment added", toastId);
        } catch {
            showError("Failed to add comment", toastId);
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case "low":
                return "bg-green-500/20 text-green-400";
            case "medium":
                return "bg-yellow-500/20 text-yellow-400";
            case "high":
                return "bg-red-500/20 text-red-400";
            default:
                return "bg-gray-500/20 text-gray-400";
        }
    };

    useEffect(() => {
        if (id) {
            fetchTask();
            fetchLogs();
            fetchComments(); // ✅ fetch comments on page load
        }
    }, [id]);

    if (!task) {
        return (
            <AppLayout>
                <div className="p-6 text-white text-center">Loading...</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="p-6 text-white max-w-5xl mx-auto space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate("/tasks")}
                        className="text-sm text-blue-400 hover:underline"
                    >
                        ← Back to Tasks
                    </button>

                    <button
                        onClick={() => setEditMode(!editMode)}
                        className="bg-cyan-500 px-4 py-2 rounded-lg font-semibold"
                    >
                        {editMode ? "Cancel" : "Edit Task"}
                    </button>
                </div>

                {/* MAIN CARD */}
                <div className="bg-white/10 p-6 rounded-2xl border border-white/10 space-y-5">

                    {/* TITLE */}
                    {editMode ? (
                            <>
                                <p className="text-xl font-bold">Task Name</p>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm({...form, title: e.target.value})}
                                    className="w-full p-3 rounded bg-white/10 text-white text-xl"
                                />
                            </>
                    ) : (
                        <h1 className="text-3xl font-bold">{task.title}</h1>
                    )}

                    {/* STATUS & PRIORITY BADGE */}

                    {editMode ? (
                        <>
                            <p className="text-xl font-bold">Description</p>
                        </>

                    ) : (
                        <div className="flex gap-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
                            {task.status}
                        </span>

                            {task.priority && (
                                <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(task.priority)}`}>
                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            )}
                        </div>
                    )}



                    {/* DESCRIPTION */}
                    {editMode ? (
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                            className="w-full p-3 rounded bg-white/10 text-white"
                        />
                    ) : (
                        <p className="text-white/80">{task.description || "No description"}</p>
                    )}

                    {/* EXTRA FIELDS */}
                    {editMode && (
                        <div className="grid grid-cols-2 gap-4">

                            <select
                                value={form.status}
                                onChange={(e) => setForm({...form, status: e.target.value})}
                                className="p-2 rounded bg-white/10"
                            >
                                {/*<option value="" className=" text-black ">All Status</option>*/}
                                <option value="pending" className=" text-black ">Pending</option>
                                <option value="in_progress" className=" text-black ">In Progress</option>
                                <option value="waiting_for_review" className=" text-black ">Review</option>
                                <option value="completed" className=" text-black ">Completed</option>
                            </select>

                            <select
                                value={form.priority}
                                onChange={(e) => setForm({...form, priority: e.target.value})}
                                className="p-2 rounded bg-white/10"
                            >
                                <option value="low" className=" text-black ">Low</option>
                                <option value="medium" className=" text-black ">Medium</option>
                                <option value="high" className=" text-black ">High</option>
                            </select>

                            <input
                                type="date"
                                value={form.due_date?.split("T")[0] || ""}
                                onChange={(e) => setForm({...form, due_date: e.target.value})}
                                className="p-2 rounded bg-white/10"
                            />
                        </div>
                    )}

                    {/* SAVE BUTTON */}
                    {editMode && (
                        <button
                            onClick={updateTask}
                            className="bg-green-500 px-5 py-2 rounded-lg font-semibold"
                        >
                            Save Changes
                        </button>
                    )}
                </div>

                {/* COMMENT */}
                <div className="bg-white/10 p-5 rounded-xl border border-white/10">
                    <h2 className="text-lg font-semibold mb-3">Add Comment</h2>

                    <div className="flex gap-2">
                        <input
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 p-2 rounded bg-white/10 text-white"
                        />
                        <button
                            onClick={addComment}
                            className="bg-yellow-500 px-4 rounded"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* ALL COMMENT */}
                <div>
                    <h2 className="text-xl font-semibold mb-3">Comments</h2>

                    {comments.length === 0 ? (
                        <p className="text-white/60">No comments yet</p>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((c) => (
                                <div key={c.comment_id} className="bg-white/10 p-4 rounded-xl border border-white/10">
                                    <div className="flex justify-between text-sm text-white/70 mb-1">
                                        <span>👤 User {c.user_id}</span>
                                        <span>🕒 {formatDate(c.created_at)}</span>
                                    </div>
                                    <div className="text-white">{c.message}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* LOGS */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>

                    {logs.length === 0 ? (
                        <p className="text-white/60">No logs yet</p>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div
                                    key={log.log_id}
                                    className="bg-white/10 p-4 rounded-xl border border-white/10"
                                >
                                    <div className="flex justify-between text-sm text-white/60">
                                        <span>👤 {log.username}</span>
                                        <span>🕒 {formatDate(log.created_at)}</span>
                                    </div>
                                    <p className="mt-1 text-white">{log.action}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
};

export default TaskDetails;