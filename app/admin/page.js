"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminDashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState({ users: 0, books: 0, reservations: 0, active: 0, overdue: 0 });
    const [recentReservations, setRecentReservations] = useState([]);
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

            const activeStatuses = ["RESERVED", "BORROWED"];
            const overdueStatuses = ["OVERDUE", "LATE", "LATE_RETURNED"];

            const activeCount = reservationsData.filter(r => activeStatuses.includes(r.status)).length;
            const overdueCount = reservationsData.filter(r => overdueStatuses.includes(r.status)).length;

            const sortedReservations = [...reservationsData]
                .sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate))
                .slice(0, 8);

            setStats({
                users: usersData.length || 0,
                books: booksData.length || 0,
                reservations: reservationsData.length || 0,
                active: activeCount,
                overdue: overdueCount,
            });

            setRecentReservations(sortedReservations);
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <DashboardStatCard label="Total Users" value={stats.users} accent="from-blue-500 to-indigo-500" />
                <DashboardStatCard label="Total Books" value={stats.books} accent="from-emerald-500 to-teal-500" />
                <DashboardStatCard label="Active Loans" value={stats.active} accent="from-sky-500 to-cyan-500" />
                <DashboardStatCard label="Overdue / Late" value={stats.overdue} accent="from-red-500 to-orange-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                <section className="xl:col-span-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                        <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">Recent Reservations</h2>
                        <button
                            type="button"
                            onClick={() => router.push("/admin/reservations")}
                            className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                        >
                            View all
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                            <tr>
                                <th className="px-4 py-3">Book</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Reserved On</th>
                                <th className="px-4 py-3">Due</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700 text-slate-200">
                            {recentReservations.map(r => (
                                <tr key={r.id} className="hover:bg-slate-700/40 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-white">{r.bookTitle}</td>
                                    <td className="px-4 py-3 text-xs text-slate-300">{r.userFirstName}</td>
                                    <td className="px-4 py-3 text-xs text-slate-400">{r.reservationDate ? new Date(r.reservationDate).toLocaleDateString() : "-"}</td>
                                    <td className="px-4 py-3 text-xs text-slate-400">{r.expectedReturnDate ? new Date(r.expectedReturnDate).toLocaleDateString() : "-"}</td>
                                    <td className="px-4 py-3 text-xs">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full border border-slate-600 bg-slate-900 text-[10px] font-semibold uppercase tracking-wide">
                                            {r.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {recentReservations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500 text-sm">
                                        No reservations yet.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-6 flex flex-col gap-4">
                    <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">Quick Actions</h2>
                    <p className="text-xs text-slate-400">Jump straight to common admin tasks.</p>

                    <div className="flex flex-col gap-3 mt-2">
                        <DashboardLinkButton label="Add New Book" onClick={() => router.push("/admin/add-book")} />
                        <DashboardLinkButton label="Manage All Users" onClick={() => router.push("/admin/users")} />
                        <DashboardLinkButton label="View All Reservations" onClick={() => router.push("/admin/reservations")} />
                    </div>
                </section>
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

function DashboardLinkButton({ label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full text-left px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-sm text-slate-200 hover:bg-slate-700/70 hover:border-slate-500 transition-colors"
        >
            {label}
        </button>
    );
}