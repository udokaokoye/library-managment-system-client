"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminUserHistoryPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    const [userDetails, setUserDetails] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading) {
            if (!user || (user.userType && user.userType.toUpperCase() !== "ADMIN")) {
                router.push("/");
                return;
            }
            fetchData();
        }
    }, [user, authLoading, router, id]);

    async function fetchData() {
        try {
            const [userRes, historyRes] = await Promise.all([
                fetch(`http://localhost:8080/users/${id}`, { credentials: "include" }),
                fetch(`http://localhost:8080/reservations/user/${id}`, { credentials: "include" }),
            ]);

            if (!userRes.ok) throw new Error("Failed to fetch user details");
            if (!historyRes.ok) throw new Error("Failed to fetch user history");

            const userData = await userRes.json();
            const historyData = await historyRes.json();

            setUserDetails(userData);
            setHistory(historyData);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load user history");
        } finally {
            setLoading(false);
        }
    }

    if (loading || authLoading) return <div className="p-12 text-center text-slate-400">Loading user history...</div>;
    if (error) return <div className="p-12 text-center text-red-400">Error: {error}</div>;

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">User History</h1>
                    <p className="text-slate-400 text-sm">Full borrowing history for this user.</p>
                </div>
                <button
                    onClick={() => router.push("/admin/users")}
                    className="text-sm text-slate-300 hover:text-white underline-offset-2 hover:underline"
                >
                    ← Back to Users
                </button>
            </div>

            {userDetails && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <p className="text-lg font-semibold text-white">{userDetails.firstName} {userDetails.lastName}</p>
                        <p className="text-sm text-slate-400">{userDetails.email}</p>
                    </div>
                    <div className="text-sm text-slate-300">
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border bg-slate-900 border-slate-600 mr-2">
                            ID #{userDetails.id}
                        </span>
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            {userDetails.userType}
                        </span>
                    </div>
                </div>
            )}

            <div className="overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-900 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Reservation ID</th>
                        <th className="px-6 py-4 font-semibold">Book</th>
                        <th className="px-6 py-4 font-semibold">Reserved On</th>
                        <th className="px-6 py-4 font-semibold">Due Date</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-slate-300">
                    {history.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-3 text-sm text-slate-500 font-mono">#{r.id}</td>
                            <td className="px-6 py-3 text-sm">{r.bookTitle || r.book?.title}</td>
                            <td className="px-6 py-3 text-sm">{r.reservationDate ? new Date(r.reservationDate).toLocaleDateString() : "-"}</td>
                            <td className="px-6 py-3 text-sm">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "-"}</td>
                            <td className="px-6 py-3 text-sm">
                                <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border bg-slate-900 border-slate-600">
                                    {r.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {history.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No reservation history for this user.</div>
                )}
            </div>
        </div>
    );
}
