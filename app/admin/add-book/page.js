"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AddBookPage() {
    const router = useRouter();

    // Get the auth state
    const { user, isLoading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        author: "",
        publicationYear: "",
        totalCopies: "",
        pictureUrl: ""
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // 1. PROTECTION LOGIC
    useEffect(() => {
        // If Auth is still loading, DO NOTHING. Wait.
        if (authLoading) return;

        console.log("Add Book Auth Check:", user);

        // If loading is done, and user is NOT an admin, redirect.
        // We use ?. and toUpperCase() to be safe.
        if (!user || (user.userType && user.userType.toUpperCase() !== "ADMIN")) {
            console.warn("Unauthorized access to Add Book. Redirecting...");
            router.push("/");
        }
    }, [user, authLoading, router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        if (!formData.title || !formData.author || !formData.totalCopies) {
            setError("Please fill in all required fields.");
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/books", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // CRITICAL for Admin check
                body: JSON.stringify({
                    ...formData,
                    publicationYear: parseInt(formData.publicationYear),
                    totalCopies: parseInt(formData.totalCopies),
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create book");
            }

            alert("Book created successfully!");
            router.push("/");
        } catch (err) {
            setError(err.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    // 2. SHOW LOADING SCREEN
    // This prevents the Form from showing up for 1 second before redirecting
    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-slate-400 text-lg">Verifying Admin Permissions...</div>
            </div>
        );
    }

    // If we pass the loading check and the user is null/not admin, the useEffect above will redirect.
    // We can return null here to avoid flashing the form during that split second redirect.
    if (!user || user.userType.toUpperCase() !== "ADMIN") {
        return null;
    }

    // 3. RENDER FORM (Only reaches here if Admin is confirmed)
    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-8">Add New Book</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded">{error}</div>}

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Book Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. The Great Gatsby"
                    />
                </div>

                {/* Author */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Author *</label>
                    <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. F. Scott Fitzgerald"
                    />
                </div>

                {/* Year & Copies */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Publication Year</label>
                        <input
                            type="number"
                            name="publicationYear"
                            value={formData.publicationYear}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="2024"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Total Copies *</label>
                        <input
                            type="number"
                            name="totalCopies"
                            value={formData.totalCopies}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="5"
                        />
                    </div>
                </div>

                {/* Picture URL */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image URL</label>
                    <input
                        type="text"
                        name="pictureUrl"
                        value={formData.pictureUrl}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://..."
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave blank to use placeholder</p>
                </div>

                {/* Actions */}
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
                        disabled={submitting}
                        className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                        {submitting ? "Creating..." : "Create Book"}
                    </button>
                </div>
            </form>
        </div>
    );
}