"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {

            const res = await fetch("http://localhost:8080/users/user-details", {
                credentials: "include"
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("Auth check failed", err);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };


    const logout = async () => {
        try {
            // 1. Tell Backend to kill session
            await fetch("http://localhost:8080/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch (err) {
            console.error("Logout request failed", err);
        }

        setUser(null);

        router.push("/");
        router.refresh();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, checkUser, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);