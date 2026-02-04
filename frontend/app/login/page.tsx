"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleLogin() {
        setError(null);

        if (!username || !password) {
            setError("Unesi username i password.");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                const msg =
                    data?.error?.detail ||
                    data?.detail ||
                    data?.non_field_errors?.[0] ||
                    data?.username?.[0] ||
                    data?.password?.[0] ||
                    "Login error";
                throw new Error(msg);
            }


            localStorage.setItem("token", data.token);
            localStorage.setItem("username", username);

            router.push("/reservation");
        } catch (e: any) {
            setError(e.message || "Greška pri login-u.");
        } 
    }

    return (
        <main style={{ padding: 24, maxWidth: 420 }}>
            <h1>Login</h1>

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
                />
                <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
                />

                {error ? <div style={{ color: "red" }}>{error}</div> : null}

                <button
                    onClick={handleLogin}
                    style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
                >
                Login
                </button>
            </div>
            <nav style={{ display: "flex", gap: 16, marginTop: 20 }}>
                <Link href="/">Pocetna</Link>
            </nav>

        </main>
    );
}
