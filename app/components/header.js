"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function Header() {

    const { user, logout } = useAuth();

    return (
        <header className="bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">

                <Link href="/" className="text-xl font-bold flex items-center gap-2 text-blue-500">
                    <span>📚</span> Library System
                </Link>

                <div className="flex items-center gap-6">
                    {user ? (
                        <>
              <span className="text-slate-400 text-sm">
                Welcome, <span className="text-white font-medium">{user.firstName}</span>
              </span>

                            <button
                                onClick={logout}
                                className="text-sm bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg transition-all border border-red-600/20"
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}