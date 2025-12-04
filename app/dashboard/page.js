"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

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
            fetchData();
        }
    }, [user, isLoading, router]);

    async function fetchData() {
        try {
            const [booksRes, resRes] = await Promise.all([
                fetch("http://localhost:8080/books", { credentials: "include" }),
                fetch("http://localhost:8080/reservations/my-reservations", { credentials: "include" }),
            ]);

            if (!booksRes.ok || !resRes.ok) {
                throw new Error("Failed to load dashboard data");
            }

            const [booksData, reservationsData] = await Promise.all([
                booksRes.json(),
                resRes.json(),
            ]);

            setBooks(booksData || []);
            setMyReservations(reservationsData || []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Error loading dashboard");
        } finally {
            setLoading(false);
        }
    }

    if (loading || isLoading) return <div className="p-12 text-center text-slate-400">Loading dashboard...</div>;
    if (error) return <div className="p-12 text-center text-red-400">Error: {error}</div>;

    const nextReservation = myReservations.find(r => r.status === "RESERVED" || r.status === "BORROWED");

    return (
        <div className="w-full space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
                    <p className="text-slate-400">Welcome back{user?.firstName ? `, ${user.firstName}` : ""}.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <UserStatCard label="Books in catalog" value={books.length} />
                <UserStatCard label="My total loans" value={myReservations.length} />
                <UserStatCard label="Active loans" value={myReservations.filter(r => r.status === "RESERVED" || r.status === "BORROWED").length} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <section className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-6">
                    <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase mb-3">Next loan</h2>
                    {nextReservation ? (
                        <div className="space-y-2 text-sm text-slate-200">
                            <p className="font-medium">{nextReservation.bookTitle}</p>
                            <p className="text-slate-400">
                                Reserved on {nextReservation.reservationDate ? new Date(nextReservation.reservationDate).toLocaleDateString() : "-"}
                            </p>
                            <p className="text-slate-400">
                                Due {nextReservation.expectedReturnDate ? new Date(nextReservation.expectedReturnDate).toLocaleDateString() : "-"}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">You have no active loans right now.</p>
                    )}
                </section>

                <section className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-6">
                    <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase mb-3">Shortcuts</h2>
                    <div className="flex flex-col gap-3 mt-2">
                        <DashboardLinkButton label="Browse books" onClick={() => router.push("/")} />
                        <DashboardLinkButton label="View my loans" onClick={() => router.push("/reservations/my-reservations")} />
                        <DashboardLinkButton label="Account settings" onClick={() => router.push("/my-account")} />
                    </div>
                </section>
            </div>
        </div>
    );
}

function UserStatCard({ label, value }) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl shadow-slate-900/40 flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-400">{label}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
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
