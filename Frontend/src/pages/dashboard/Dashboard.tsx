// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout.tsx";
import Card from "../../components/common/card.tsx";
import { useUser } from "../../hooks/useUser.ts";
// import axios from "axios";

interface Stats {
    totalToMe: number;
    pendingToMe: number;
    inProgressToMe: number;
    waitingForReviewToMe: number;
    completedToMe: number;
    totalByMe: number;
    pendingByMe: number;
    inProgressByMe: number;
    waitingForReviewByMe: number;
    completedByMe: number;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, setUser } = useUser();

    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/dashboard/");
                const data = res.data?.data;

                //  Save profile
                setUser(data?.profile);

                if (data?.profile?.isAdmin) {
                    setStats({
                        //  Admin uses total_tasks directly
                        totalToMe: data?.total_tasks?.total,
                        pendingToMe: data?.total_tasks?.pending,
                        inProgressToMe: data?.total_tasks?.in_progress,
                        waitingForReviewToMe: data?.total_tasks?.waiting_for_review,
                        completedToMe: data?.total_tasks?.completed,

                        //  assigned_by_me is already flat
                        totalByMe: data?.assigned_by_me?.total,
                        pendingByMe: data?.assigned_by_me?.pending,
                        inProgressByMe: data?.assigned_by_me?.in_progress,
                        waitingForReviewByMe: data?.assigned_by_me?.waiting_for_review,
                        completedByMe: data?.assigned_by_me?.completed,
                    });
                } else {
                    setStats({
                        //  assigned_to_me is already flat
                        totalToMe: data?.assigned_to_me?.total,
                        pendingToMe: data?.assigned_to_me?.pending,
                        inProgressToMe: data?.assigned_to_me?.in_progress,
                        waitingForReviewToMe: data?.assigned_to_me?.waiting_for_review,
                        completedToMe: data?.assigned_to_me?.completed,

                        //  assigned_by_me is same structure
                        totalByMe: data?.assigned_by_me?.total,
                        pendingByMe: data?.assigned_by_me?.pending,
                        inProgressByMe: data?.assigned_by_me?.in_progress,
                        waitingForReviewByMe: data?.assigned_by_me?.waiting_for_review,
                        completedByMe: data?.assigned_by_me?.completed,
                    });
                }

            } catch (err: any) {
                if (err.response?.status === 401) {
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, setUser]);

    if (loading) {
        return (
            <AppLayout>
                <div className="text-center mt-20 text-white text-lg">
                    Loading dashboard...
                </div>
            </AppLayout>
        );
    }

    //  Create arrays for mapping cards dynamically
    const assignedCards = [
        { title: "Total Tasks", value: stats?.totalToMe, color: "red" },
        { title: "Pending", value: stats?.pendingToMe, color: "yellow" },
        { title: "In Progress", value: stats?.inProgressToMe, color: "blue" },
        { title: "Waiting for Review", value: stats?.waitingForReviewToMe, color: "purple" },
        { title: "Completed", value: stats?.completedToMe, color: "green" },
    ];

    const givenCards = [
        { title: "Total Tasks", value: stats?.totalByMe, color: "red" },
        { title: "Pending", value: stats?.pendingByMe, color: "yellow" },
        { title: "In Progress", value: stats?.inProgressByMe, color: "blue" },
        { title: "Waiting for Review", value: stats?.waitingForReviewByMe, color: "purple" },
        { title: "Completed", value: stats?.completedByMe, color: "green" },
    ];

    return (
        <AppLayout>
            {/* Assigned Section */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-3">
                    {user?.isAdmin ? "All Tasks Overview" : "Tasks Assigned To You"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 p-4 bg-white/10 rounded-xl border border-white/20 shadow-inner">
                    {assignedCards.map((card, idx) => (
                        <Card key={idx} {...card} />
                    ))}
                </div>
            </div>

            {/* Given Section */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-3">
                    Tasks Given By You
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 p-4 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                    {givenCards.map((card, idx) => (
                        <Card key={idx} {...card} />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard;