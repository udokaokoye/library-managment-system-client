"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyAccountPage() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetch("http://localhost:8080/users/user-details", { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error("Not logged in");
                return res.json();
            })
            .then((data) => setUser(data))
            .catch(() => {
                router.push("/login");
            });
    }, [router]);

    if (!user) return <p className="p-8">Loading account details...</p>;

    return (
        <div className="max-w-2xl mx-auto p-6 border rounded-md bg-[color:var(--panel)]">
            <h1 className="text-2xl font-bold mb-4">My Account</h1>
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
        </div>
    );
}