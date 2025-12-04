"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminReservationsPage() {
    const [allReservations, setAllReservations] = useState([]); // Renamed for clarity
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 1. PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.userType.toUpperCase() !== "ADMIN") {
                router.push("/");
                return;
            }
            fetchReservations();
        }
    }, [user, authLoading, router]);

    async function fetchReservations() {
        try {
            const res = await fetch("http://localhost:8080/reservations", {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch reservations");
            const data = await res.json();

            // Sort by ID Descending (Newest first)
            const sortedData = data.sort((a, b) => b.id - a.id);
            setAllReservations(sortedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleAction(id, actionType) {
        if (!confirm(`Are you sure you want to ${actionType} this reservation?`)) return;

        try {
            const res = await fetch(`http://localhost:8080/reservations/${actionType}/${id}`, {
                method: "PUT",
                credentials: "include",
            });

            if (!res.ok) {
                const text = await res.text();
                alert(`Error: ${text}`);
                return;
            }
            fetchReservations();
        } catch (err) {
            console.error(err);
            alert("An error occurred");
        }
    }

    // Helpers
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    const formatStatus = (status) => {
        if (!status) return "";
        return status.replace(/_/g, " ");
    };

    const calculateDaysLate = (expectedStr, actualStr) => {
        if (!expectedStr || !actualStr) return 0;
        const expected = new Date(expectedStr);
        const actual = new Date(actualStr);
        expected.setHours(0,0,0,0);
        actual.setHours(0,0,0,0);
        const diffTime = actual - expected;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // 2. PAGINATION LOGIC
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReservations = allReservations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(allReservations.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6 text-white">Manage Reservations</h1>
            <div className="overflow-x-auto bg-slate-800 rounded-lg shadow border border-slate-700">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-900 border-b border-slate-700 text-slate-300">
                        <th className="px-6 py-4 text-sm font-medium">User</th>
                        <th className="px-6 py-4 text-sm font-medium">Book</th>
                        <th className="px-6 py-4 text-sm font-medium">Status</th>
                        <th className="px-6 py-4 text-sm font-medium">Date Info</th>
                        <th className="px-6 py-4 text-sm font-medium">Condition</th>
                        <th className="px-6 py-4 text-sm font-medium text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">

                    {/* 3. RENDER SLICED LIST */}
                    {currentReservations.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-750 text-slate-200">
                            <td className="px-6 py-4 text-sm font-medium">{res.userFirstName}</td>
                            <td className="px-6 py-4 text-sm text-slate-300">{res.bookTitle}</td>

                            <td className="px-6 py-4 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                                    ${res.status === 'RESERVED' ? 'bg-blue-900 text-blue-200' : ''}
                                    ${res.status === 'BORROWED' ? 'bg-yellow-900 text-yellow-200' : ''}
                                    ${res.status === 'RETURNED' ? 'bg-green-900 text-green-200' : ''}
                                    ${res.status === 'CANCELED' ? 'bg-gray-700 text-gray-400' : ''}
                                    ${res.status === 'OVERDUE' ? 'bg-red-900 text-red-200' : ''}
                                    ${res.status === 'LATE_RETURNED' ? 'bg-orange-900 text-orange-200' : ''}
                                `}>
                                    {formatStatus(res.status)}
                                </span>
                            </td>

                            <td className="px-6 py-4 text-sm">
                                <div className="flex flex-col text-xs gap-1">
                                    {(res.status === 'RETURNED' || res.status === 'LATE_RETURNED') ? (
                                        <>
                                            <span className="text-slate-400">Returned:</span>
                                            <span className="font-medium text-slate-200">{formatDate(res.returnDate)}</span>
                                        </>
                                    ) : (
                                        <>
                                            {res.status !== 'CANCELED' && (
                                                <>
                                                    <span className="text-slate-400">Due Date:</span>
                                                    <span className={`font-medium ${res.status === 'OVERDUE' ? 'text-red-400' : 'text-slate-200'}`}>
                                                        {formatDate(res.expectedReturnDate)}
                                                    </span>
                                                </>
                                            )}
                                            {res.status === 'CANCELED' && <span className="text-slate-500 italic">N/A</span>}
                                        </>
                                    )}
                                </div>
                            </td>

                            <td className="px-6 py-4 text-sm">
                                {res.status === 'LATE_RETURNED' && (
                                    <div className="flex flex-col items-start">
                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold border border-red-500/30">
                                            Late
                                        </span>
                                        <span className="text-xs text-red-300 mt-1">
                                            +{calculateDaysLate(res.expectedReturnDate, res.returnDate)} days
                                        </span>
                                    </div>
                                )}
                                {res.status === 'RETURNED' && (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-bold border border-green-500/30">
                                        On Time
                                    </span>
                                )}
                                {res.status === 'OVERDUE' && (
                                    <span className="px-2 py-0.5 bg-red-600 text-white rounded text-xs font-bold animate-pulse">
                                        ! Overdue
                                    </span>
                                )}
                                {['RESERVED', 'BORROWED', 'CANCELED'].includes(res.status) && (
                                    <span className="text-slate-600 text-xs">-</span>
                                )}
                            </td>

                            <td className="px-6 py-4 text-sm text-center">
                                <div className="flex justify-center gap-2">
                                    {res.status === 'RESERVED' && (
                                        <>
                                            <button onClick={() => handleAction(res.id, 'collect')} className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs transition-colors">Collect</button>
                                            <button onClick={() => handleAction(res.id, 'cancel')} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs transition-colors">Cancel</button>
                                        </>
                                    )}
                                    {(res.status === 'BORROWED' || res.status === 'OVERDUE') && (
                                        <>
                                            <button onClick={() => handleAction(res.id, 'return')} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs transition-colors">Return</button>
                                            <button onClick={() => handleAction(res.id, 'extend')} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs transition-colors">Extend</button>
                                        </>
                                    )}
                                    {['RETURNED', 'CANCELED', 'LATE_RETURNED'].includes(res.status) && (
                                        <span className="text-slate-600 text-xs italic">Closed</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {allReservations.length === 0 && (
                    <p className="text-center py-6 text-slate-500">No reservations found.</p>
                )}

                {/* 4. PAGINATION FOOTER */}
                {totalPages > 1 && (
                    <div className="bg-slate-900 px-6 py-4 border-t border-slate-700 flex justify-between items-center">
                        <span className="text-xs text-slate-400">
                            Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, allReservations.length)} of {allReservations.length}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-xs rounded border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-xs text-slate-300 font-mono flex items-center">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-xs rounded border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}