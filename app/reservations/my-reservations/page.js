"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export default function MyReservationsPage() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {

            if (!user) {
                router.push("/login");
                return;
            }
            fetchMyReservations();
        }
    }, [user, authLoading, router]);

    async function fetchMyReservations() {
        try {
            const res = await fetch("http://localhost:8080/reservations/my-reservations", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setReservations(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(id) {
        if(!confirm("Are you sure you want to cancel this reservation?")) return;

        try {
            const res = await fetch(`http://localhost:8080/reservations/cancel/${id}`, {
                method: "PUT",
                credentials: "include"
            });

            if(res.ok) {
                alert("Reservation canceled successfully.");
                fetchMyReservations();
            } else {
                const text = await res.text();
                alert(`Failed to cancel: ${text}`);
            }
        } catch(err) {
            console.error(err);
            alert("An error occurred.");
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString();
    };

    if (loading || authLoading) return <div className="p-12 text-center text-slate-400">Loading your loans...</div>;

    return (
        <div className="w-full max-w-5xl mx-auto mt-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">My Reservations</h1>
                <Link href="/public" className="text-blue-400 hover:text-blue-300 text-sm">← Browse more books</Link>
            </div>

            {reservations.length === 0 ? (
                <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
                    <p className="text-slate-400 text-lg mb-4">You haven't borrowed any books yet.</p>
                    <Link href="/public" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium">Browse Catalog</Link>
                </div>
            ) : (
                <div className="overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Book Title</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Dates</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700 text-slate-300">
                        {reservations.map((res) => (
                            <tr key={res.id} className="hover:bg-slate-700/50 transition-colors">

                                <td className="px-6 py-4 font-medium text-white">
                                    {res.bookTitle || `Book ID: ${res.bookId}`}
                                </td>


                                <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                                            ${res.status === 'RESERVED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : ''}
                                            ${res.status === 'BORROWED' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : ''}
                                            ${res.status === 'RETURNED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : ''}
                                            ${res.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}
                                            ${res.status === 'CANCELED' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : ''}
                                            ${res.status === 'LATE_RETURNED' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : ''}
                                        `}>
                                            {res.status.replace('_', ' ')}
                                        </span>
                                </td>

                                <td className="px-6 py-4 text-sm">
                                    {(res.status === 'RETURNED' || res.status === 'LATE_RETURNED') ? (
                                        <div>
                                            <span className="block text-slate-500 text-xs uppercase">Returned on</span>
                                            {formatDate(res.returnDate)}
                                        </div>
                                    ) : (
                                        <div>
                                            {res.status !== 'CANCELED' && (
                                                <>
                                                    <span className="block text-slate-500 text-xs uppercase">Due Date</span>
                                                    <span className={res.status === 'OVERDUE' ? 'text-red-400 font-bold' : 'text-slate-200'}>
                                                            {formatDate(res.expectedReturnDate)}
                                                        </span>
                                                </>
                                            )}
                                            {res.status === 'CANCELED' && <span className="text-slate-500 text-xs italic">N/A</span>}
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-center">
                                    {res.status === 'RESERVED' ? (
                                        <button
                                            onClick={() => handleCancel(res.id)}
                                            className="px-4 py-2 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-500 border border-red-600/30 rounded-lg text-xs font-bold transition-all"
                                        >
                                            Cancel
                                        </button>
                                    ) : (
                                        <span className="text-slate-600 text-xs italic">
                                                {['BORROWED', 'OVERDUE'].includes(res.status) ? 'Please return at desk' : 'Closed'}
                                            </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}