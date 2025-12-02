"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ReservationButton({ bookId }) {
  const { user, isLoading } = useAuth();
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const [showSignInPopup, setShowSignInPopup] = useState(false);

  const createReservation = async () => {
    if (!user) {
      setShowSignInPopup(true);
      // auto-hide after a short time
      setTimeout(() => setShowSignInPopup(false), 4500);
      return;
    }

    try {
      setStatus("loading");
      setMessage("");
      const res = await fetch("http://localhost:8080/reservations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Reserved");
      } else {
        let errText = "Failed to reserve";
        try {
          const json = await res.json();
          if (json && json.message) errText = json.message;
        } catch (e) {}
        setStatus("error");
        setMessage(errText);
      }
    } catch (e) {
      setStatus("error");
      setMessage("Network error — cannot reach server");
    } finally {
      // clear non-success messages after a short time
      if (status !== "success") {
        setTimeout(() => setMessage(""), 3500);
      }
    }
  };

  return (
    <div className="inline-flex items-center gap-2 relative">
      <button
        onClick={createReservation}
        className="btn-primary px-3 py-2 rounded"
        disabled={status === "loading" || isLoading || status === "success"}
        type="button"
      >
        {status === "loading" ? "Reserving..." : status === "success" ? "Reserved" : "Reserve"}
      </button>

      {showSignInPopup ? (
        <div className="ml-2 bg-red-600 text-white px-3 py-2 rounded shadow-md flex items-center gap-3">
          <span>Please sign in to reserve this book.</span>
          <a href="/login" className="underline font-semibold">
            Sign in
          </a>
        </div>
      ) : null}

      {message && !showSignInPopup ? (
        <span className="text-sm text-[color:var(--muted)]">{message}</span>
      ) : null}
    </div>
  );
}
