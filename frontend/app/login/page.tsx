"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/ui/navbar";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

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
    <>
      <Navbar />

      <main className="container">
        <h1>Prijava</h1>
        <p className="subTitle">Uloguj se da rezervišeš sto za sledeći kviz.</p>

        <div className="card">
          {error && <div className="error">{error}</div>}

          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button onClick={handleLogin}>Login</Button>
        </div>
      </main>
    </>
  );
}
