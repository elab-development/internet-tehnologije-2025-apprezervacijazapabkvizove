"use client";

import Navbar from "@/components/ui/navbar";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Reservation = {
  id: number;
  user: number;
  quiz: number;   // ID
  table: number;  // ID
  team_name: string;
  party_size: number;
  status: string;
  created_at: string;
};

type Quiz = {
  id: number;
  name: string;
  start_datetime: string;
};

type Table = {
  id: number;
  label: string;
  capacity: number;
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleString("sr-RS");
}

export default function MyReservationPage() {
  const router = useRouter();

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Morate biti ulogovani da biste videli svoje rezervacije.");
      setTimeout(() => router.push("/login"), 2000);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function loadAll() {
      try {
        setError(null);

        const resR = await fetch("http://127.0.0.1:8000/api/reservations/", {
          headers: { Authorization: `Token ${token}` },
          cache: "no-store",
        });
        if (!resR.ok) throw new Error("Ne mogu da učitam rezervacije.");
        const dataR = await resR.json();
        const arrR = Array.isArray(dataR) ? dataR : dataR.results || [];
        setReservations(arrR);

        const resQ = await fetch("http://127.0.0.1:8000/api/quizzes/", {
          cache: "no-store",
        });
        if (!resQ.ok) throw new Error("Ne mogu da učitam kvizove.");
        const dataQ = await resQ.json();
        const arrQ = Array.isArray(dataQ) ? dataQ : dataQ.results || [];
        setQuizzes(arrQ);

        const resT = await fetch("http://127.0.0.1:8000/api/tables/", {
          cache: "no-store",
        });
        if (!resT.ok) throw new Error("Ne mogu da učitam stolove.");
        const dataT = await resT.json();
        const arrT = Array.isArray(dataT) ? dataT : dataT.results || [];
        setTables(arrT);
      } catch (e: any) {
        setError(e?.message || "Greška pri učitavanju.");
      }
    }

    loadAll();
  }, []);

  // Map lookup: id -> objekat (da prikažemo ime kviza i label stola)
  const quizById = useMemo(() => {
    const m = new Map<number, Quiz>();
    quizzes.forEach((q) => m.set(q.id, q));
    return m;
  }, [quizzes]);

  const tableById = useMemo(() => {
    const m = new Map<number, Table>();
    tables.forEach((t) => m.set(t.id, t));
    return m;
  }, [tables]);

  return (
    <>
      <Navbar />

      <main className="container">
        <h1>Moje rezervacije</h1>
        <p className="subTitle">Pregled svih rezervacija koje si napravio.</p>

        {message && <div className="notice">{message}</div>}
        {error && (
          <div className="error" style={{ marginTop: 10 }}>
            {error}
          </div>
        )}

        {!message && !error && (
          <>
            {reservations.length === 0 ? (
              <div className="smallCard2" style={{ marginTop: 12 }}>
                <h3>Nema rezervacija</h3>
                <p>Trenutno nemate nijednu rezervaciju.</p>
              </div>
            ) : (
              <div className="sectionGrid" style={{ marginTop: 12 }}>
                {reservations.map((r) => {
                  const q = quizById.get(r.quiz);
                  const t = tableById.get(r.table);

                  return (
                    <div key={r.id} className="smallCard2">
                      <h3 style={{ marginBottom: 6 }}>{r.team_name}</h3>

                      <p style={{ marginBottom: 6 }}>
                        <b>Status:</b> {r.status}
                      </p>

                      <p style={{ marginBottom: 6 }}>
                        <b>Kviz:</b>{" "}
                        {q ? `${q.name} — ${formatDate(q.start_datetime)}` : `#${r.quiz}`}
                      </p>

                      <p style={{ marginBottom: 6 }}>
                        <b>Sto:</b> {t ? `${t.label}` : `#${r.table}`}
                      </p>

                      <p style={{ marginBottom: 0 }}>
                        <b>Broj ljudi:</b> {r.party_size}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
