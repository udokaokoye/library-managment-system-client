"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalUsers: 0,
        activeLoans: 0,
        overdueBooks: 0,
        totalReservations: 0
    });
    const [loading, setLoading] = useState(true);

    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.userType.toUpperCase() !== "ADMIN") {
                router.push("/");
                return;
            }
            fetchStats();
        }
    }, [user, authLoading, router]);

    async function fetchStats() {
        try {
            const res = await fetch("http://localhost:8080/admin/stats", { credentials: "include" });
            if (res.ok) {
                setStats(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading || authLoading) return <div className="p-12 text-center text-slate-400">Loading dashboard...</div>;

    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

            {/* 2. Update the Grid to show the new card */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard title="Total Books" value={stats.totalBooks} icon="📚" color="blue" />
                <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="purple" />
                <StatCard title="Total History" value={stats.totalReservations} icon="📜" color="green" />
                <StatCard title="Active Loans" value={stats.activeLoans} icon="📖" color="yellow" />
                <StatCard title="Overdue Books" value={stats.overdueBooks} icon="⚠️" color="red" />
            </div>


            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-4">Welcome back, {user?.firstName}!</h2>
                <p className="text-slate-400 mb-6">
                    There are currently <span className="text-white font-bold">{stats.activeLoans}</span> active loans.
                    {stats.overdueBooks > 0 && <span className="text-red-400 font-bold ml-1"> ({stats.overdueBooks} Overdue)</span>}
                </p>

                <div className="flex gap-4">
                    <button onClick={() => router.push('/admin/add-book')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                        + Add New Book
                    </button>
                    <button onClick={() => router.push('/reservations')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                        Manage Reservations
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    const colors = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <div className={`p-6 rounded-xl border ${colors[color]} shadow-lg transition-transform hover:scale-105`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs uppercase tracking-wider font-bold opacity-80">{title}</p>
                    <h3 className="text-3xl font-bold mt-2">{value}</h3>
                </div>
                <span className="text-2xl">{icon}</span>
            </div>
        </div>
    );
}