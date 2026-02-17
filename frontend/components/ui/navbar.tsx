"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");

        setUsername(storedUsername);
        setToken(storedToken);

        if (storedToken) {
            fetch("http://127.0.0.1:8000/api/me/", {
                headers: {
                    Authorization: `Token ${storedToken}`,
                },
            })
                .then(res => {
                    if (!res.ok) throw new Error();
                    return res.json();
                })
                .then(data => {
                    setIsAdmin(data.is_staff === true);
                })
                .catch(() => {
                    setIsAdmin(false);
                });
        }
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setUsername(null);
        setToken(null);
        setIsAdmin(false);
        router.push("/login");
    }

    const isLoggedIn = !!token;

    return (
        <header className="navbar">
            <Link href="/" style={{ display: "flex", alignItems: "center" }}>
                <Image
                    src="/egzibicija_logo.png"
                    alt="Egzibicija Pab Kviz"
                    className="navbarLogo"
                    width={160}
                    height={40}
                />
            </Link>

            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <Link href="/reservation">Rezervacija</Link>
                <Link href="/myreservation">Moje rezervacije</Link>

                
                {isAdmin && (
                    <Link href="/admin_tables/">Upravljanje stolovima</Link>
                )}

                {isLoggedIn ? (
                    <>
                        <span>{username}</span>
                        <Button onClick={handleLogout}>Logout</Button>
                    </>
                ) : (
                    <>
                        <Link href="/login">Prijava</Link>
                        <Link href="/register">Registracija</Link>
                    </>
                )}
            </div>
        </header>
    );
}
