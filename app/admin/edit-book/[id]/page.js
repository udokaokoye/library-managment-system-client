"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function EditBookPage({ params }) {
    // Unwrap the params properly
    const { id } = use(params);
    const router = useRouter();

    // Get Auth state
    const { user, isLoading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        author: "",
        publicationYear: "",
        totalCopies: "",
        pictureUrl: ""
    });
    const [error, setError] = useState("");
    const [dataLoading, setDataLoading] = useState(true);

    // 1. PROTECT ROUTE (With Debugging)
    useEffect(() => {
        // If we are still checking if the user is logged in, DO NOTHING yet.
        if (authLoading) return;

        console.log("Edit Page Auth Check:", user);

        // If not logged in OR not an admin, kick them out
        if (!user || (user.userType && user.userType.toUpperCase() !== "ADMIN")) {
            console.warn("Redirecting: User is not authorized.");
            router.push("/");
        }
    }, [user, authLoading, router]);

    // 2. FETCH BOOK DATA
    useEffect(() => {
        if (id) {
            fetch(`http://localhost:8080/books/${id}`)
                .then(res => {
                    if(!res.ok) throw new Error("Book not found");
                    return res.json();
                })
                .then(data => {
                    setFormData({
                        title: data.title,
                        author: data.author,
                        publicationYear: data.publicationYear,
                        totalCopies: data.totalCopies,
                        pictureUrl: data.pictureUrl || ""
                    });
                    setDataLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setDataLoading(false);
                });
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`http://localhost:8080/books/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // CRITICAL: Sends the Admin Cookie
                body: JSON.stringify({
                    ...formData,
                    publicationYear: parseInt(formData.publicationYear),
                    totalCopies: parseInt(formData.totalCopies),
                }),
            });

            if (!res.ok) throw new Error("Failed to update book");

            alert("Book updated successfully!");
            router.push(`/books/${id}`);
        } catch (err) {
            setError(err.message);
        }
    };

    // 3. SHOW LOADING STATE (Prevents flickering redirects)
    if (authLoading || dataLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-slate-400">
                Loading editor...
            </div>
        );
    }

    // If we got here, User is definitely an ADMIN
    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-8">Edit Book Details</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded">{error}</div>}

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Book Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Author</label>
                    <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
                        <input
                            type="number"
                            name="publicationYear"
                            value={formData.publicationYear}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Total Copies</label>
                        <input
                            type="number"
                            name="totalCopies"
                            value={formData.totalCopies}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image URL</label>
                    <input
                        type="text"
                        name="pictureUrl"
                        value={formData.pictureUrl}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}