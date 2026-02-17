"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/ui/navbar";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function RegisterPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setInfo("Već si ulogovan. Ako želiš drugi nalog, prvo se odjavi.");
        }
    }, []);

    async function handleRegister() {
        setError(null);

        const token = localStorage.getItem("token");
        if (token) {
            setError("Već si ulogovan. Prvo uradi logout.");
            return;
        }

        if (!username || !email || !password || !password2) {
            setError("Popuni username, email i obe lozinke.");
            return;
        }


        try {

            const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, password2 }),

            });

            const data = await res.json();
          // setInfo(JSON.stringify(data));


            if (!res.ok) {
                const fields = data?.error?.fields;
                const msg =
                    (fields && Object.values(fields).flat()[0]) ||
                    data?.error?.detail ||
                    data?.detail ||
                    "Greška pri registraciji.";
                throw new Error(msg);



            }



            if (data?.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", username);
                router.push("/");
                return;
            }

            const loginRes = await fetch("http://127.0.0.1:8000/api/auth/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const loginData = await loginRes.json();

            if (!loginRes.ok) {
                throw new Error("Korisnik je kreiran, ali login nije uspeo. Probaj da se prijaviš.");
            }

            localStorage.setItem("token", loginData.token);
            localStorage.setItem("username", username);
            router.push("/");
        } catch (e: any) {
            setError(e.message || "Greška pri registraciji.");
        }
    }

    return (
        <>
            <Navbar />

            <main className="container" style={{ maxWidth: 420 }}>
                <h1 className="pageTitle">Registracija</h1>

                {info && <div className="notice">{info}</div>}

                <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                    <Input
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Input
                        label="Potvrdi password"
                        type="password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                    />


                    {error && <div className="error">{error}</div>}

                    <Button onClick={handleRegister}>Registruj se</Button>
                </div>
            </main>
        </>
    );
}
