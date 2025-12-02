"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Auth Check
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

            if (!res.ok) {
                if (res.status === 403) throw new Error("Access Denied: Admin permissions required");
                throw new Error("Failed to fetch users");
            }

            const data = await res.json();

            const sortedData = data.sort((a, b) => a.id - b.id);

            setUsers(sortedData);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const getRoleBadgeStyle = (role) => {
        const r = role ? role.toUpperCase() : "";
        if (r === 'ADMIN') {
            return 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
        }
        if (r === 'USER') {
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        }
        return 'bg-slate-700 text-slate-400 border-slate-600';
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

                            <td className="px-6 py-4 text-center space-x-3">
                                <button
                                    onClick={() => router.push(`/admin/users/${u.id}`)}
                                    className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline"
                                >
                                    View History
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No users found in the system.</div>
                )}
            </div>
        </div>
    );
}