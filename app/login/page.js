"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [serverConnected, setServerConnected] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/auth/ping');
        const j = await r.json();
        if (!mounted) return;
        setServerConnected(Boolean(j.reachable));
      } catch (err) {
        if (!mounted) return;
        setServerConnected(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // Call the auth server at http://localhost:4000/users/login and rely on
    // the server to set a `jsession` cookie. Then fetch /users/userdetails
    // with credentials included so the cookie is sent.
    (async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const txt = await res.text();
          alert("Login failed: " + (txt || res.status));
          return;
        }

        // After login, attempt to fetch user details which requires the jsession cookie
        const ud = await fetch("/api/auth/userdetails", {
          method: "GET",
        });

        if (!ud.ok) {
          const txt = await ud.text();
          alert("Failed to fetch user details: " + (txt || ud.status));
          return;
        }

        const userData = await ud.json();
        // Optionally store a copy in localStorage for the demo (don't store sensitive data in prod)
        try {
          localStorage.setItem('user', JSON.stringify(userData.user));
        } catch (e) {}

        router.push('/');
      } catch (err) {
        // Fallback: previous fake redirect
        if (email && password) {
          router.push('/');
        } else {
          alert('Network error: ' + err.message);
        }
      }
    })();
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* simple connection banner */}
      {serverConnected === true && (
        <div className="mb-4 p-2 rounded text-sm bg-green-100 text-green-800">Connected to auth server</div>
      )}
      {serverConnected === false && (
        <div className="mb-4 p-2 rounded text-sm bg-red-100 text-red-800">Cannot reach auth server</div>
      )}
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
