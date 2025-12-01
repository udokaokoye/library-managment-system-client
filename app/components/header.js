"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function Header() {
    const { user, isLoading, fetchUser, setUser } = useAuth();
    const router = useRouter();
    const [localLoading, setLocalLoading] = useState(true);

    useEffect(() => {
        // delegate fetching to context
        (async () => {
            setLocalLoading(true);
            try {
                await fetchUser();
            } finally {
                setLocalLoading(false);
            }
        })();
    }, [fetchUser]);

    async function handleLogout(e) {
        e.preventDefault();
        try {
            await fetch("http://localhost:8080/logout", {
                method: "POST",
                credentials: "include",
            });
            setUser(null);
            router.push("/");
            router.refresh();
        } catch (err) {
            console.error("Logout failed", err);
        }
    }

    

    const loading = isLoading || localLoading;

    return (
        <header className="site-header w-full border-b bg-[color:var(--bg)]">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="logo font-semibold text-lg">Library</Link>
                    <nav className="hidden sm:flex gap-4 text-sm text-[color:var(--muted)]">
                        <Link href="/" className="hover:underline">Home</Link>
                        <Link href="/catalog" className="hover:underline">Catalog</Link>

                        {user && user.userType && user.userType.toUpperCase() === 'USER' && (
                            <>
                                <Link href="/my-loans" className="hover:underline">My Loans</Link>
                                <Link href="/my-reservations" className="hover:underline">My Reservations</Link>
                            </>
                        )}

                        {user && user.userType && user.userType.toUpperCase() === 'ADMIN' && (
                            <Link href="/admin/reservations" className="hover:underline font-semibold text-blue-600">All Reservations</Link>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <label className="sr-only" htmlFor="site-search">Search books</label>
                    <input id="site-search" className="search-input px-3 py-2 rounded-md border" placeholder="Search books..." />

                    {user ? (
                        <>
                            <Link href="/my-account" className="btn-primary px-3 py-2 rounded-md inline-block">My Account</Link>
                            <button onClick={handleLogout} className="px-3 py-2 rounded-md inline-block border hover:bg-gray-100">Log out</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="btn-primary px-3 py-2 rounded-md inline-block">Sign in</Link>
                            <Link href="/signup" className="btn-primary px-3 py-2 rounded-md inline-block">Sign up</Link>
                        </>
                    )}

                    

                </div>
            </div>
        </header>
    );
}