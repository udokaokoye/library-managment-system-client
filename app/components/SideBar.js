"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function Sidebar() {
    const { user } = useAuth();
    const pathname = usePathname();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getLinkClass = (path) => {
        if (path === "/") {
            return pathname === "/"
                ? "flex items-center gap-3 px-4 py-3 rounded-md bg-blue-600 text-white shadow-lg shadow-blue-900/20 transition-colors"
                : "flex items-center gap-3 px-4 py-3 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors";
        }
        const isActive = pathname.startsWith(path);
        return `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
            isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`;
    };

    const isLoggedIn = mounted && user;
    const isAdmin = isLoggedIn && user.userType && user.userType.toUpperCase() === 'ADMIN';


    const reservationLink = isAdmin ? "/reservations" : "/reservations/my-reservations";

    return (
        <aside className="hidden sm:flex flex-col w-64 bg-slate-950 text-slate-300 flex-shrink-0 border-r border-slate-800 sticky top-0 h-screen overflow-y-auto">
            <div className="p-6">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-6">
                    Main Menu
                </h3>

                <nav className="space-y-2">
                    {/* 1. HOME (Always Visible) */}
                    <Link href="/" className={getLinkClass("/")}>
                        <span>🏠</span> Home
                    </Link>

                    {isLoggedIn && (
                        <>


                            <Link href={reservationLink} className={getLinkClass(reservationLink)}>
                                <span>📅</span> Reservations
                            </Link>
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <div className="pt-4 mt-4 border-t border-slate-800">
                                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-4">
                                    Admin Controls
                                </h3>
                                <Link href="/admin/dashboard" className={getLinkClass("/admin/dashboard")}>
                                    <span>📊</span> Dashboard
                                </Link>
                                <Link href="/admin/users" className={getLinkClass("/admin/users")}>
                                    <span>👥</span> Users
                                </Link>
                                <Link href="/admin/add-book" className={getLinkClass("/admin/add-book")}>
                                    <span>➕</span> Add Book
                                </Link>
                                <Link href="/admin/books" className={getLinkClass("/admin/books")}>
                                    <span>📦</span> Inventory
                                </Link>
                            </div>
                        </>
                    )}

                </nav>
            </div>
        </aside>
    );
}