"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AddBookPage() {
    const router = useRouter();
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

    useEffect(() => {
        if (authLoading) return;
        if (!user || (user.userType && user.userType.toUpperCase() !== "ADMIN")) {
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

        // --- SMART IMAGE LOGIC ---
        let finalPictureUrl = formData.pictureUrl;

        // If it's not a real URL, treat it as a keyword
        if (finalPictureUrl && !finalPictureUrl.startsWith("http") && !finalPictureUrl.startsWith("/")) {
            finalPictureUrl = `https://placehold.co/400x600/1e293b/475569?text=${encodeURIComponent(finalPictureUrl)}`;
        }

        try {
            const res = await fetch("http://localhost:8080/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...formData,
                    pictureUrl: finalPictureUrl,
                    publicationYear: parseInt(formData.publicationYear),
                    totalCopies: parseInt(formData.totalCopies),
                }),
            });

            if (!res.ok) throw new Error("Failed to create book");

            alert("Book created successfully!");
            router.push("/");
        } catch (err) {
            setError(err.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) return <div className="flex justify-center items-center min-h-screen text-slate-400">Loading...</div>;
    if (!user || user.userType.toUpperCase() !== "ADMIN") return null;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-8">Add New Book</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded">{error}</div>}

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


                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Cover Image <span className="text-slate-500 font-normal">(Link or Text)</span>
                    </label>
                    <input
                        type="text"
                        name="pictureUrl"
                        value={formData.pictureUrl}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"

                        placeholder="e.g. Paste a URL... OR just type 'Mystery' to auto-generate"
                    />

                    <p className="text-xs text-blue-400 mt-2">
                        ✨ <strong>Tip:</strong> Don&apos;t have a link? Just type a topic like <em>&quot;History&quot;</em> or <em>&quot;Space&quot;</em> and we will create a cover for you!
                    </p>
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