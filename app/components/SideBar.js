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

    const isAdmin = mounted && user && user.userType && user.userType.toUpperCase() === 'ADMIN';

    return (
        <aside className="hidden sm:flex flex-col w-64 bg-slate-950 text-slate-300 flex-shrink-0 border-r border-slate-800">
            <div className="p-6">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-6">
                    Main Menu
                </h3>

                <nav className="space-y-2">
                    <Link href="/dashboard" className={getLinkClass("/dashboard")}>
                        <span>🏠</span> Dashboard
                    </Link>

                    <Link href="/books" className={getLinkClass("/books")}>
                        <span>📚</span> Books
                    </Link>


                    {mounted && isAdmin ? (
                        <>
                            <Link href="/admin" className={getLinkClass("/admin")}>
                                <span>📊</span> Dashboard
                            </Link>

                            <Link href="/admin/reservations" className={getLinkClass("/admin/reservations")}>
                                <span>📅</span> Reservations
                            </Link>

                            <div className="pt-4 mt-4 border-t border-slate-800">
                                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-4">
                                    Admin
                                </h3>
                                <Link href="/admin/users" className={getLinkClass("/admin/users")}>
                                    <span>👥</span> Users
                                </Link>
                                <Link href="/admin/add-book" className={getLinkClass("/admin/add-book")}>
                                    <span>➕</span> Add Book
                                </Link>
                            </div>
                        </>
                    ) : mounted && (

                        <>
                            <Link href="/reservations/my-reservations" className={getLinkClass("/reservations/my-reservations")}>
                                <span>🔖</span> My Loans
                            </Link>
                        </>
                    )}

                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <Link href="/settings" className={getLinkClass("/settings")}>
                            <span>⚙️</span> Settings
                        </Link>
                    </div>
                </nav>
            </div>
        </aside>
    );
}