"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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
            setReservations(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">All Reservations</h1>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="px-6 py-4 text-sm font-medium text-gray-700">ID</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700">User</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700">Book</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700">Status</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700">Borrowed On</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700">Expected Return</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-700">Returned On</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {reservations.map((res) => (
                        <tr key={res.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">#{res.id}</td>

                            {/* --- FIX: Added text-gray-900 for black font --- */}
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{res.userFullName}</td>

                            {/* --- FIX: Added text-gray-900 for black font --- */}
                            <td className="px-6 py-4 text-sm text-gray-900">{res.bookTitle}</td>

                            <td className="px-6 py-4 text-sm">
                  <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${res.status === 'BORROWED' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${res.status === 'RETURNED' ? 'bg-green-100 text-green-800' : ''}
                    ${res.status === 'LATE' ? 'bg-red-100 text-red-800' : ''}
                  `}
                  >
                    {res.status}
                  </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(res.reservationDate)}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(res.expectedReturnDate)}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(res.returnDate)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {reservations.length === 0 && (
                    <p className="text-center py-6 text-gray-500">No reservations found.</p>
                )}
            </div>
        </div>
    );
}