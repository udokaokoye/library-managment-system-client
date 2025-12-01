"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function MyReservationsPage() {
  const { user, isLoading } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading) {
      if (!user) return;
      fetchReservations();
    }
  }, [user, isLoading]);

  async function fetchReservations() {
    try {
      const res = await fetch("http://localhost:8080/reservations", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch reservations");
      const data = await res.json();

      const filtered = data.filter((r) => {
        if (!user) return false;
        if (r.userId && user.id) return String(r.userId) === String(user.id);
        if (r.userEmail) return String(r.userEmail).toLowerCase() === String(user.email).toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.trim();
        return r.userFullName === fullName;
      });

      setReservations(filtered);
    } catch (err) {
      setError(err.message || "Error fetching reservations");
    } finally {
      setLoading(false);
    }
  }

  async function cancelReservation(id) {
    if (!confirm("Cancel this reservation?")) return;
    try {
      const res = await fetch(`http://localhost:8080/reservations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to cancel reservation");
      setReservations((prev) => prev.filter((r) => String(r.id) !== String(id)));
    } catch (err) {
      alert(err.message || "Failed to cancel reservation");
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading || loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Reservations</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-medium text-gray-700">ID</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-700">Book</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-700">Reserved On</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reservations.map((res) => (
              <tr key={res.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">#{res.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{res.bookTitle || res.book?.title || '—'}</td>
                <td className="px-6 py-4 text-sm">{res.status || 'RESERVED'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(res.reservationDate)}</td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => cancelReservation(res.id)} className="btn-outline px-3 py-1 rounded">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reservations.length === 0 && (
          <p className="text-center py-6 text-gray-500">You have no reservations.</p>
        )}
      </div>
      <Modal title="Cancel Reservation" open={Boolean(cancelingId)} onClose={() => setCancelingId(null)}>
        <p className="mb-4">Are you sure you want to cancel this reservation?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setCancelingId(null)} className="px-3 py-1 rounded border">Close</button>
          <button onClick={() => cancelReservation(cancelingId)} disabled={canceling} className="btn-outline px-3 py-1 rounded">
            {canceling ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
