"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import BookCard from "@/app/components/BookCard"; // Import the new component

export default function HomePage() {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const { user } = useAuth();

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        const results = books.filter(book =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredBooks(results);
        setCurrentPage(1);
    }, [searchTerm, books]);

    async function fetchBooks() {
        try {
            const res = await fetch("http://localhost:8080/books");
            if (res.ok) {
                const data = await res.json();
                setBooks(data);
                setFilteredBooks(data);
            }
        } catch (error) {
            console.error("Failed to fetch books", error);
        } finally {
            setLoading(false);
        }
    }

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-400">Loading...</div>;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                <div>
                    <h1 className="text-3xl font-bold text-white">Library Catalog</h1>
                    <p className="text-slate-400 mt-1">Browse our collection of {books.length} books</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by title or author..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 transition-all"
                        />
                    </div>

                    {user?.userType === 'ADMIN' && (
                        <Link
                            href="/admin/add-book"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
                        >
                            <span className="text-lg">+</span> Add Book
                        </Link>
                    )}
                </div>
            </div>

            {/* BOOK GRID SECTION - Now much shorter! */}
            {currentBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentBooks.map((book) => (
                        // Passing the book data to the component
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
                    <p className="text-slate-400 text-lg">No books found matching &quot;{searchTerm}&quot;</p>
                    <button onClick={() => setSearchTerm("")} className="mt-4 text-blue-400 hover:underline">Clear Search</button>
                </div>
            )}

            {/* PAGINATION SECTION */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>

                    <span className="text-slate-400 text-sm font-medium">
            Page <span className="text-white">{currentPage}</span> of {totalPages}
          </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}