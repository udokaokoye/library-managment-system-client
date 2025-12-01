"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ReservationButton({ bookId }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [message, setMessage] = useState(null);
  const [toast, setToast] = useState({ visible: false, text: "", type: "info" });

  // auto-hide toast
  useEffect(() => {
    if (!toast.visible) return;
    const t = setTimeout(() => setToast((s) => ({ ...s, visible: false })), 3000);
    return () => clearTimeout(t);
  }, [toast.visible]);

  async function createReservation() {
    if (!user) {
      const text = "Please sign in to reserve this book.";
      setMessage(text);
      setToast({ visible: true, text, type: "error" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:8080/reservations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create reservation");
      }
      await res.json();
      setReserved(true);
      const success = "Reserved successfully";
      setMessage(success);
      setToast({ visible: true, text: success, type: "info" });
    } catch (err) {
      const text = err.message || "An error occurred";
      setMessage(text);
      setToast({ visible: true, text, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={createReservation}
        disabled={loading || reserved}
        className={`btn-primary px-3 py-2 rounded inline-block ${loading || reserved ? "opacity-70" : ""}`}
        aria-disabled={loading || reserved}
        aria-live="polite"
      >
        {loading ? "Reserving..." : reserved ? "Reserved" : "Reserve"}
      </button>

      {toast.visible && (
        <div className="fixed top-6 right-6 z-50">
          <div
            className={`px-4 py-2 rounded shadow text-sm ${toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-800 text-white"}`}
          >
            {toast.text}
          </div>
        </div>
      )}
    </>
  );
}
