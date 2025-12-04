    "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminDashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState({ users: 0, books: 0, reservations: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading) {
            if (!user || (user.userType && user.userType.toUpperCase() !== "ADMIN")) {
                router.push("/");
                return;
            }
            fetchStats();
        }
    }, [user, authLoading, router]);

    async function fetchStats() {
        try {
            const [usersRes, booksRes, reservationsRes] = await Promise.all([
                fetch("http://localhost:8080/users", { credentials: "include" }),
                fetch("http://localhost:8080/books", { credentials: "include" }),
                fetch("http://localhost:8080/reservations", { credentials: "include" }),
            ]);

            if (!usersRes.ok || !booksRes.ok || !reservationsRes.ok) {
                throw new Error("Failed to load dashboard data");
            }

            const [usersData, booksData, reservationsData] = await Promise.all([
                usersRes.json(),
                booksRes.json(),
                reservationsRes.json(),
            ]);

            setStats({
                users: usersData.length || 0,
                books: booksData.length || 0,
                reservations: reservationsData.length || 0,
            });
        } catch (err) {
            console.error(err);
            setError(err.message || "Error loading dashboard");
        } finally {
            setLoading(false);
        }
    }

    if (loading || authLoading) return <div className="p-12 text-center text-slate-400">Loading dashboard...</div>;
    if (error) return <div className="p-12 text-center text-red-400">Error: {error}</div>;

    return (
        <div className="w-full space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
                    <p className="text-slate-400">Overview of library activity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardStatCard label="Total Users" value={stats.users} accent="from-blue-500 to-indigo-500" />
                <DashboardStatCard label="Total Books" value={stats.books} accent="from-emerald-500 to-teal-500" />
                <DashboardStatCard label="Total Reservations" value={stats.reservations} accent="from-amber-500 to-orange-500" />
            </div>
        </div>
    );
}

function DashboardStatCard({ label, value, accent }) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl shadow-slate-900/40 flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-400">{label}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            <div className={`mt-3 h-1 w-20 rounded-full bg-gradient-to-r ${accent}`}></div>
        </div>
    );
}
