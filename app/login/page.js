"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    // Fake auth: in a real app call your auth API, set cookies, etc.
    if (email && password) {
      router.push("/");
    }
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-md mx-auto p-6 rounded-md border bg-[color:var(--panel)]">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="px-3 py-2 border rounded" type="email" />
          <label className="text-sm">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="px-3 py-2 border rounded" type="password" />
          <div className="flex justify-end">
            <button className="btn-primary px-4 py-2 rounded mt-2" type="submit">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}
