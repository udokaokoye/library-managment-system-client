"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { checkUser } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        const params = new URLSearchParams();
        params.append("username", email);
        params.append("password", password);

        try {
            const res = await fetch("http://localhost:8080/login", {
                method: "POST",
                body: params,
                credentials: "include",
            });

            if (!res.ok) {
                setError("Invalid email or password.");
                return;
            }
            await checkUser();
            window.location.href = "/";
            router.push("/my-account");
            router.refresh();

        } catch (err) {
            console.error(err);
            setError("An error occurred. Please try again.");
        }
    }
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-md mx-auto p-6 rounded-md border bg-[color:var(--panel)]">
                <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

                {error && (
                    <span className="mb-3 block text-lg text-red-500 font-bold">
            {error}
          </span>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <label className="text-sm">Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="px-3 py-2 border rounded"
                        type="email"
                    />
                    <label className="text-sm">Password</label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="px-3 py-2 border rounded"
                        type="password"
                    />
                    <div className="flex justify-end">
                        <button
                            className="btn-primary px-4 py-2 rounded mt-2"
                            type="submit"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
