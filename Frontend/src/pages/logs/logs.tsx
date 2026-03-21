import { useEffect, useState } from "react";
import api from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";
import { useUser } from "../../hooks/useUser.ts";

interface Log {
    log_id: number;
    task_id: number;
    title: string;
    action: string;
    username: string;
    created_at: string;
}

const Logs = () => {
    const { user } = useUser();

    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const res = await api.get("/logs");

            if (res.data?.success) {
                setLogs(res.data.data);
            } else {
                setLogs([]);
            }
        } catch (err) {
            console.error("Error fetching logs", err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString();
    };

    const getActionColor = (action: string) => {
        if (action.toLowerCase().includes("created")) return "text-green-400";
        if (action.toLowerCase().includes("completed")) return "text-green-500";
        if (action.toLowerCase().includes("progress")) return "text-blue-400";
        if (action.toLowerCase().includes("pending")) return "text-yellow-400";
        return "text-white";
    };

    return (
        <AppLayout>
            <div className="p-6 text-white max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>

    {loading ? (
        <p className="text-white/60">Loading logs...</p>
    ) : logs.length === 0 ? (
        <p className="text-white/60">No logs found</p>
    ) : (
        <div className="relative border-l border-white/20 pl-6 space-y-6">

            {logs.map((log) => (
                    <div key={log.log_id} className="relative">

                    {/* Timeline Dot */}
                    <div className="absolute -left-3 top-2 w-3 h-3 bg-blue-400 rounded-full"></div>

        {/* Card */}
        <div className="bg-white/10 p-4 rounded-xl border border-white/10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-white/70">
        <span>
                                            📌 <span className="font-medium">{log.title}</span>
        </span>

        <span className="text-xs mt-1 sm:mt-0">
                                            🕒 {formatDate(log.created_at)}
        </span>
        </div>

        {/* Action */}
        <div className={`mt-2 font-semibold ${getActionColor(log.action)}`}>
        {log.action}
        </div>

        {/* User */}
        <div className="mt-1 text-sm text-white/60">
            By:{" "}
        {log.username === user?.username
            ? "You"
            : log.username}
        </div>

        </div>
        </div>
    ))}

        </div>
    )}

    </div>
    </AppLayout>
);
};

export default Logs;