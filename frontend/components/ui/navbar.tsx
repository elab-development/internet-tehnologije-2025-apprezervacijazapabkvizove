"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("username");
    setUsername(u);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
    router.push("/login");
  }

  return (
    <header
      style={{
        padding: "12px 24px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Left */}
      <Link href="/" style={{ fontWeight: "bold" }}>
        Egzibicija Pab Kviz
      </Link>

      {/* Right */}
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Link href="/reservation">Rezervacija</Link>

        {username ? (
          <>
            <span>{username}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 10px",
                border: "1px solid #ccc",
                borderRadius: 8,
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login">Prijava</Link>
        )}
      </div>
    </header>
  );
}
