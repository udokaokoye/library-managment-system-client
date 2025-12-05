"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export default function UserDashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [books, setBooks] = useState([]);
    const [myReservations, setMyReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/login");
                return;
            }
            if (user.userType === "ADMIN") {
                router.push("/admin/dashboard");
                return;
            }
            fetchData();
        }
    }, [user, isLoading, router]);

    async function fetchData() {
        try {
            const [booksRes, resRes] = await Promise.all([
                fetch("http://localhost:8080/books", { credentials: "include" }),
                fetch("http://localhost:8080/reservations/my-reservations", { credentials: "include" }),
            ]);

            if (!booksRes.ok || !resRes.ok) throw new Error("Failed to load dashboard data");

            const [booksData, reservationsData] = await Promise.all([
                booksRes.json(),
                resRes.json(),
            ]);

            setBooks(booksData || []);
            setMyReservations(reservationsData || []);
        } catch (err) {
            setError(err.message || "Error loading dashboard");
        } finally {
            setLoading(false);
        }
    }

    if (loading || isLoading) return <div className="p-12 text-center text-slate-400">Loading dashboard...</div>;
    if (error) return <div className="p-12 text-center text-red-400">Error: {error}</div>;

    const activeLoans = myReservations.filter(r => r.status === "RESERVED" || r.status === "BORROWED");
    const nextDue = activeLoans
        .filter(r => r.expectedReturnDate)
        .sort((a, b) => new Date(a.expectedReturnDate) - new Date(b.expectedReturnDate))[0];

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">My Dashboard</h1>
                    <p className="text-slate-400">Welcome back, {user?.firstName}.</p>
                </div>
                <Link
                    href="/"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 text-center"
                >
                    Browse New Books
                </Link>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Books in catalog" value={books.length} icon="📚" color="blue" />
                <StatCard label="Active loans" value={activeLoans.length} icon="📖" color="yellow" />
                <StatCard label="Total History" value={myReservations.length} icon="📜" color="purple" />
            </div>

            <section className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-6">Upcoming Due Date</h2>

                {nextDue ? (
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                        <div className="p-4 bg-slate-700 rounded-2xl text-4xl shadow-inner">⏰</div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2">{nextDue.bookTitle}</h3>
                            <div className="flex gap-6 text-sm">
                                <div>
                                    <p className="text-slate-500 uppercase text-xs font-bold">Reserved On</p>
                                    <p className="text-slate-300">{new Date(nextDue.reservationDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 uppercase text-xs font-bold">Status</p>
                                    <p className="text-yellow-400 font-bold">{nextDue.status}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 text-sm uppercase font-bold">Due Date</p>
                            <p className="text-3xl font-bold text-white tracking-tight">
                                {new Date(nextDue.expectedReturnDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-slate-500 text-sm">{new Date(nextDue.expectedReturnDate).getFullYear()}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-4 text-3xl">✓</div>
                        <p className="text-slate-300 text-lg">No active loans due.</p>
                        <p className="text-slate-500">You are free to browse and reserve new books!</p>
                    </div>
                )}
            </section>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    const colors = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    };

    return (
        <div className={`p-6 rounded-xl border ${colors[color]} shadow-lg flex items-center justify-between`}>
            <div>
                <p className="text-xs uppercase tracking-wider font-bold opacity-70 mb-1">{label}</p>
                <h3 className="text-3xl font-bold text-white">{value}</h3>
            </div>
            <span className="text-3xl opacity-80">{icon}</span>
        </div>
    );
}