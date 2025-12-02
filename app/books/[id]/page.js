"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function BookDetailsPage({ params }) {
    const { id } = use(params);

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [daysToKeep, setDaysToKeep] = useState(7);

    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        fetchBookDetails();
    }, [id]);

    async function fetchBookDetails() {
        try {
            const res = await fetch(`http://localhost:8080/books/${id}`);
            if (!res.ok) throw new Error("Book not found");
            const data = await res.json();
            setBook(data);
        } catch (error) {
            console.error(error);
            setBook(null);
        } finally {
            setLoading(false);
        }
    }

    // --- UPDATED BORROW FUNCTION ---
    async function handleBorrow() {
        // 1. Auth Check
        if (!user) {
            alert("Please login to borrow books.");
            router.push("/login");
            return;
        }

        // 2. Stock Check
        if (book.availableCopies <= 0) {
            alert("Sorry, this book is currently out of stock.");
            return;
        }

        // 3. CONFIRMATION STEP
        const isConfirmed = confirm(`Are you sure you want to borrow "${book.title}" for ${daysToKeep} days?`);

        // If user clicks "Cancel", stop here.
        if (!isConfirmed) return;

        try {
            // 4. Send Request
            const res = await fetch("http://localhost:8080/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Sends session cookie
                body: JSON.stringify({
                    bookId: book.id,
                    daysToKeep: parseInt(daysToKeep)
                })
            });

            if (!res.ok) {
                const text = await res.text();
                alert(`Failed: ${text}`);
                return;
            }

            // 5. SUCCESS & REDIRECT
            // We don't necessarily need an alert here if we redirect immediately,
            // but it helps confirm the action.
            alert("Reservation successful! Redirecting to your loans...");
            router.push("/reservations/my-reservations");

        } catch (error) {
            console.error(error);
            alert("An error occurred while reserving.");
        }
    }

    async function handleDelete() {
        if(!confirm("Are you sure you want to delete this book? This cannot be undone.")) return;
        try {
            const res = await fetch(`http://localhost:8080/books/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if(!res.ok) {
                const text = await res.text();
                alert(`Cannot delete: ${text}`);
                return;
            }
            alert("Book deleted");
            router.push("/");
        } catch (err) { alert("Delete failed"); }
    }

    if (loading || authLoading) return <div className="p-12 text-center text-slate-400">Loading...</div>;
    if (!book) return <div className="p-12 text-center text-red-400">Book not found.</div>;

    const isAdmin = user && user.userType && user.userType.toUpperCase() === 'ADMIN';
    const isOutOfStock = book.availableCopies <= 0;

    return (
        <div className="max-w-5xl mx-auto mt-8">
            <button onClick={() => router.back()} className="mb-6 text-slate-400 hover:text-white flex items-center gap-2">← Back</button>

            <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col md:flex-row">
                {/* IMAGE SECTION */}
                <div className="md:w-1/3 relative h-96 md:h-auto bg-slate-900">
                    <Image
                        src={book.pictureUrl || "https://placehold.co/400x600/1e293b/475569?text=No+Cover"}
                        alt={book.title} fill className="object-cover"
                    />
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-4 py-2 font-bold rounded shadow-lg transform -rotate-12 border-2 border-white">OUT OF STOCK</span>
                        </div>
                    )}
                </div>

                {/* DETAILS SECTION */}
                <div className="p-8 md:p-10 flex-1 flex flex-col">
                    <h1 className="text-3xl font-bold text-white mb-2">{book.title}</h1>
                    <p className="text-xl text-slate-400 mb-6">{book.author}</p>

                    <div className="grid grid-cols-2 gap-6 my-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                        <div><span className="text-xs text-slate-500 uppercase">Published</span><br/><span className="text-lg text-slate-200">{book.publicationYear}</span></div>
                        <div>
                            <span className="text-xs text-slate-500 uppercase">Stock</span><br/>
                            <span className={`text-lg ${isOutOfStock ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                    {book.availableCopies} / {book.totalCopies}
                </span>
                        </div>
                    </div>

                    <div className="mt-auto">
                        {isAdmin ? (
                            <div className="flex gap-4">
                                <button onClick={() => router.push(`/admin/edit-book/${book.id}`)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">Edit Book</button>
                                <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg">Delete</button>
                            </div>
                        ) : (
                            // USER VIEW
                            <div className={`p-4 rounded-xl border ${isOutOfStock ? 'bg-slate-800 border-slate-700' : 'bg-slate-700/30 border-slate-600/30'}`}>
                                <label className="block text-sm text-slate-300 mb-2">Duration</label>
                                <div className="flex gap-4">
                                    <select
                                        value={daysToKeep}
                                        onChange={(e) => setDaysToKeep(e.target.value)}
                                        disabled={isOutOfStock}
                                        className="bg-slate-900 border border-slate-600 text-white rounded px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="3">3 Days</option>
                                        <option value="7">7 Days</option>
                                        <option value="14">14 Days</option>
                                    </select>

                                    <button
                                        onClick={handleBorrow}
                                        disabled={isOutOfStock}
                                        className={`flex-1 font-bold py-2 rounded-lg shadow-lg transition-all ${
                                            isOutOfStock
                                                ? "bg-slate-600 text-slate-400 cursor-not-allowed border border-slate-500"
                                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20"
                                        }`}
                                    >
                                        {isOutOfStock ? "Out of Stock" : "Confirm Reservation"}
                                    </button>
                                </div>
                                {isOutOfStock && <p className="text-xs text-red-400 mt-2 text-center">Please check back later when copies are returned.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}