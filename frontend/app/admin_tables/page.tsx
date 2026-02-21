"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/ui/navbar";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

type Table = {
  id: number;
  label: string;
  capacity: number;
};

export default function AdminTablesPage() {
  const router = useRouter();

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [tables, setTables] = useState<Table[]>([]);
  const [label, setLabel] = useState("");
  const [capacity, setCapacity] = useState("");

  async function loadTables(token: string) {
    const res = await fetch("http://127.0.0.1:8000/api/tables/", {
      headers: { Authorization: `Token ${token}` },
      cache: "no-store",
    });

    // ako nije admin -> backend vraća 403
    if (res.status === 403) {
      router.push("/");
      return;
    }

    if (!res.ok) throw new Error("Ne mogu da učitam stolove.");

    const data = await res.json();
    const arr = Array.isArray(data) ? data : data.results || [];
    setTables(arr);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Morate biti ulogovani.");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    loadTables(token).catch((e: any) => {
      setError(e?.message || "Greška.");
    });
  }, [router]);

  async function handleAddTable() {
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const cleanLabel = label.trim();
    const cap = parseInt(capacity, 10);

    if (!cleanLabel) {
      setError("Unesi label.");
      return;
    }
    if (Number.isNaN(cap)) {
      setError("Unesi kapacitet (broj).");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/api/tables/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ label: cleanLabel, capacity: cap }),
    });

    if (res.status === 403) {
      router.push("/");
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || "Ne mogu da dodam sto.");
    }

    setLabel("");
    setCapacity("");
    await loadTables(token);
  }

  async function handleDeleteTable(id: number) {
    const ok = confirm("Da li ste sigurni da želite da obrišete sto?");
    if (!ok) return;

    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const res = await fetch(`http://127.0.0.1:8000/api/tables/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Token ${token}` },
    });

    if (res.status === 403) {
      router.push("/");
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || "Ne mogu da obrišem sto.");
    }

    setTables((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <>
      <Navbar />

      <main className="container">
        <h1>Upravljanje stolovima</h1>

        {message && <div className="notice">{message}</div>}
        {error && (
          <div className="error" style={{ marginTop: 10 }}>
            {error}
          </div>
        )}

        {!message && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
            <div className="smallCard">
              <h2 style={{ marginBottom: 10 }}>Dodaj sto</h2>

              <Input
                label="Label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />

              <Input
                label="Kapacitet"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />

              <Button
                onClick={() => {
                  handleAddTable().catch((e: any) => setError(e?.message || "Greška."));
                }}
              >
                Dodaj
              </Button>
            </div>

            <div className="smallCard">
              <h2 style={{ marginBottom: 10 }}>Postojeći stolovi</h2>

              {tables.length === 0 ? (
                <div>Nema stolova.</div>
              ) : (
                <div className="sectionGrid">
                  {tables.map((t) => (
                    <div key={t.id} className="smallCard2">
                      <h3 style={{ marginBottom: 6 }}>{t.label}</h3>
                      <p style={{ marginBottom: 12 }}>
                        <b>Kapacitet:</b> {t.capacity}
                      </p>

                      <Button
                        onClick={() => {
                          handleDeleteTable(t.id).catch((e: any) =>
                            setError(e?.message || "Greška.")
                          );
                        }}
                      >
                        Obriši
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
