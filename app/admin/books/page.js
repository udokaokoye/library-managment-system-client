"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminBooksPage() {
    const [allBooks, setAllBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (!user || (user.userType && user.userType.toUpperCase() !== "ADMIN")) {
                router.push("/");
                return;
            }
            fetchBooks();
        }
    }, [user, authLoading, router]);

    async function fetchBooks() {
        try {
            const res = await fetch("http://localhost:8080/books");
            if (!res.ok) throw new Error("Failed to fetch books");
            const data = await res.json();
            setAllBooks(data.sort((a, b) => a.id - b.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Delete this book? This cannot be undone.")) return;

        try {
            const res = await fetch(`http://localhost:8080/books/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (!res.ok) {
                const text = await res.text();
                alert(`Error: ${text}`);
                return;
            }
            fetchBooks();
            alert("Book deleted successfully");
        } catch (err) {
            alert("Delete failed");
        }
    }

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBooks = allBooks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(allBooks.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (loading || authLoading) return <div className="p-12 text-center text-slate-400">Loading inventory...</div>;
    if (error) return <div className="p-12 text-center text-red-400">Error: {error}</div>;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Book Inventory</h1>
                    <p className="text-slate-400 text-sm mt-1">Total Books: {allBooks.length}</p>
                </div>
                <button
                    onClick={() => router.push('/admin/add-book')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                >
                    + Add New Book
                </button>
            </div>

            <div className="overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-900 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">ID</th>
                        <th className="px-6 py-4 font-semibold">Cover</th>
                        <th className="px-6 py-4 font-semibold">Details</th>
                        <th className="px-6 py-4 font-semibold">Stock</th>
                        <th className="px-6 py-4 font-semibold text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-slate-300">
                    {currentBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-500 font-mono">#{book.id}</td>

                            <td className="px-6 py-4">
                                <div className="w-10 h-14 bg-slate-900 rounded overflow-hidden border border-slate-600">
                                    {/* Using the updated helper below */}
                                    <BookCover url={book.pictureUrl} title={book.title} />
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <div className="font-bold text-white text-sm">{book.title}</div>
                                <div className="text-xs text-slate-400">{book.author} ({book.publicationYear})</div>
                            </td>

                            <td className="px-6 py-4 text-sm">
                                    <span className={`font-medium ${book.availableCopies === 0 ? 'text-red-400' : 'text-slate-200'}`}>
                                        {book.availableCopies}
                                    </span>
                                <span className="text-slate-500"> / {book.totalCopies}</span>
                            </td>

                            <td className="px-6 py-4 text-center">
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => router.push(`/admin/edit-book/${book.id}`)}
                                        className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wide"
                                    >
                                        Edit
                                    </button>
                                    <span className="text-slate-600">|</span>
                                    <button
                                        onClick={() => handleDelete(book.id)}
                                        className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wide"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {allBooks.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No books found.</div>
                )}

                {totalPages > 1 && (
                    <div className="bg-slate-900 px-6 py-4 border-t border-slate-700 flex justify-between items-center">
                        <span className="text-xs text-slate-400">
                            Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, allBooks.length)} of {allBooks.length}
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

// --- SAFE IMAGE COMPONENT (Standard HTML img) ---
function BookCover({ url, title }) {
    const placeholder = "https://placehold.co/400x600/1e293b/475569?text=No+Cover";

    // Check if valid URL
    const isValid = url && (url.startsWith("http") || url.startsWith("/"));

    // Use standard <img> tag to avoid Next.js layout issues
    return (
        <img
            src={isValid ? url : placeholder}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => e.target.src = placeholder}
        />
    );
}