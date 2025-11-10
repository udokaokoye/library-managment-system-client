"use client";

import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext();
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const [isLoading, setIsLoading] = useState(true);


    const fetchUser = async () => {
        setIsLoading(true);
        try {
            // Make sure this URL matches your actual endpoint (e.g. /api/users/me)
            const res = await fetch("http://localhost:8080/users/user-details", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, fetchUser, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}
export function useAuth() {
    return useContext(AuthContext);
}