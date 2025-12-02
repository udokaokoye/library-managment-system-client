"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyAccountPage() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetch("http://localhost:8080/users/user-details", { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error("Not logged in");
                return res.json();
            })
            .then((data) => {
                setUser(data);
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                });
            })
            .catch(() => {
                router.push("/login");
            });
    }, [router]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const res = await fetch("http://localhost:8080/users/update-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to update profile");
            }

            const updated = await res.json();
            setUser(updated);
            setFormData({
                firstName: updated.firstName || "",
                lastName: updated.lastName || "",
                email: updated.email || "",
            });
            setMessage("Profile updated successfully.");
            setIsEditing(false);
        } catch (err) {
            setMessage(err.message || "Error updating profile.");
        } finally {
            setSaving(false);
        }
    }

    if (!user) return <p className="p-8">Loading account details...</p>;

    return (
        <div className="max-w-2xl mx-auto p-6 border rounded-md bg-[color:var(--panel)]">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">My Account</h1>
                <button
                    type="button"
                    onClick={() => {
                        setIsEditing(!isEditing);
                        setMessage("");
                        setFormData({
                            firstName: user.firstName || "",
                            lastName: user.lastName || "",
                            email: user.email || "",
                        });
                    }}
                    className="px-3 py-1 text-sm rounded-md border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                >
                    {isEditing ? "Cancel" : "Edit Profile"}
                </button>
            </div>

            {message && (
                <p className="mb-4 text-sm text-center text-emerald-400">{message}</p>
            )}

            {!isEditing && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-lg">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="text-lg">{user.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Account Type</label>
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {user.userType}
                        </span>
                    </div>
                </div>
            )}

            {isEditing && (
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full md:w-auto px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            )}
        </div>
    );
}