"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (!user || (user.userType && user.userType.toUpperCase() !== "ADMIN")) {
                router.push("/");
                return;
            }
            fetchUsers();
        }
    }, [user, authLoading, router]);

    async function fetchUsers() {
        try {
            const res = await fetch("http://localhost:8080/users", {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to fetch users");

            const data = await res.json();
            setUsers(data.sort((a, b) => a.id - b.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteUser(userId) {
        if(!confirm("Are you sure you want to delete this user? All their reservation history will be wiped.")) return;

        try {
            const res = await fetch(`http://localhost:8080/users/${userId}`, {
                method: "DELETE",
                credentials: "include"
            });

            if(res.ok) {
                alert("User deleted successfully");
                fetchUsers();
            } else {
                const text = await res.text();
                alert(`Error: ${text}`);
            }
        } catch(err) {
            alert("Delete failed");
        }
    }

    const getRoleBadgeStyle = (role) => {
        const r = role ? role.toUpperCase() : "";
        if (r === 'ADMIN') return 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    };

    if (loading || authLoading) return <div className="p-12 text-center text-slate-400">Loading users...</div>;
    if (error) return <div className="p-12 text-center text-red-400">Error: {error}</div>;

    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold text-white mb-6">User Management</h1>
            <p className="text-slate-400 mb-8">Total Users: {users.length}</p>

            <div className="overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-900 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">ID</th>
                        <th className="px-6 py-4 font-semibold">Name</th>
                        <th className="px-6 py-4 font-semibold">Email</th>
                        <th className="px-6 py-4 font-semibold">Role</th>
                        <th className="px-6 py-4 font-semibold text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-slate-300">
                    {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-500 font-mono">#{u.id}</td>

                            <td className="px-6 py-4">
                                <div className="font-medium text-white">{u.firstName} {u.lastName}</div>
                            </td>

                            <td className="px-6 py-4 text-sm font-mono text-slate-400">
                                {u.email}
                            </td>

                            <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${getRoleBadgeStyle(u.userType)}`}>
                                        {u.userType}
                                    </span>
                            </td>

                            <td className="px-6 py-4 text-center">
                                {u.userType?.toUpperCase() !== 'ADMIN' ? (
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 rounded text-xs font-bold uppercase tracking-wide transition-all"
                                    >
                                        Delete
                                    </button>
                                ) : (
                                    <span className="text-slate-600 text-xs italic cursor-not-allowed">
                                            Protected
                                        </span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No users found.</div>
                )}
            </div>
        </div>
    );
}