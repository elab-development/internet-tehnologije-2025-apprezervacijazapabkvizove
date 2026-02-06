"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/components/ui/navbar";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";

type Quiz = {
  id: number;
  name: string;
  start_datetime: string;
};

type SuggestedTable = {
  id: number;
  label: string;
  capacity: number;
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleString("sr-RS");
}

export default function ReservationPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [message, setMessage] = useState<string | null>(null);

  const [teamName, setTeamName] = useState("");
  const [partySize, setPartySize] = useState(2);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizId, setQuizId] = useState<string>("");

  const [suggestedTable, setSuggestedTable] = useState<SuggestedTable | null>(null);
  const [suggestMsg, setSuggestMsg] = useState<string | null>(null);

  // auth guard + query param quiz
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Morate biti ulogovani da biste pristupili rezervacijama.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    const q = params.get("quiz");
    if (q) setQuizId(q);
  }, [router, params]);

  // load quizzes (za combobox)
  useEffect(() => {
    async function loadQuizzes() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/quizzes/", { cache: "no-store" });
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.results || [];
        setQuizzes(arr);
      } catch {
        // ne komplikujemo: ako pukne, samo ostavi prazno
      }
    }
    loadQuizzes();
  }, []);

  const quizOptions = useMemo(() => {
    const base = [{ value: "", label: "— Izaberi kviz —" }];
    return base.concat(
      quizzes.map((q) => ({
        value: String(q.id),
        label: `${q.name} — ${formatDate(q.start_datetime)}`,
      }))
    );
  }, [quizzes]);

  const partyOptions = [2, 3, 4, 5, 6, 7].map((n) => ({ value: n, label: String(n) }));

  async function handleSubmit() {
    setSuggestedTable(null);
    setSuggestMsg(null);

    if (!teamName) {
      setSuggestMsg("Unesi naziv tima.");
      return;
    }
    if (!quizId) {
      setSuggestMsg("Izaberi kviz.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setSuggestMsg("Nisi ulogovan.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/reservations/suggest-table/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          quiz_id: Number(quizId),
          party_size: partySize,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Greška pri pronalaženju stola.");
      }

      if (!data.available) {
        setSuggestMsg(data?.detail || "Nažalost, nema slobodnih stolova.");
        return;
      }

      setSuggestedTable(data.table);
      setSuggestMsg(`Sto je pronađen.`);
    } catch (e: any) {
      setSuggestMsg(e.message || "Greška.");
    }
  }

  async function handleConfirm() {
  if (!suggestedTable) return;

  if (!teamName) {
    setSuggestMsg("Unesi naziv tima.");
    return;
  }
  if (!quizId) {
    setSuggestMsg("Izaberi kviz.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    setSuggestMsg("Nisi ulogovan.");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/api/reservations/confirm/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        quiz_id: Number(quizId),
        table_id: suggestedTable.id,
        team_name: teamName,
        party_size: partySize,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.detail || "Greška pri potvrdi rezervacije.");
    }

    alert(`Rezervacija potvrđena!\nTim: ${teamName}\nSto: ${data.reservation.table.label}`);

    // opcionalno: resetuj state nakon potvrde
    // setSuggestedTable(null);
    // setSuggestMsg(null);
    // setTeamName("");
    // setPartySize(2);
    // setNote("");
  } catch (e: any) {
    setSuggestMsg(e.message || "Greška.");
  }
}


  return (
    <>
      <Navbar />

      <main className="container">
        <h1>Rezervacija</h1>
        <p className="subTitle">Unesi podatke i pošalji zahtev za rezervaciju.</p>

        {message && <div className="notice">{message}</div>}

        {!message && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* LEFT */}
            <div className="smallCard">
              <Input
                label="Naziv tima"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />

              <Select
                label="Kviz"
                value={quizId}
                onChange={(e) => {
                  setQuizId(String(e.target.value));
                  setSuggestedTable(null);
                  setSuggestMsg(null);
                }}
                options={quizOptions}
              />

              <Select
                label="Broj ljudi"
                value={partySize}
                onChange={(e) => {
                  setPartySize(Number(e.target.value));
                  setSuggestedTable(null);
                  setSuggestMsg(null);
                }}
                options={partyOptions}
              />

              <Button onClick={handleSubmit}>Pošalji</Button>
            </div>

            {/* RIGHT */}
            <div className="smallCard">
              <h2 style={{ marginBottom: 10 }}>Trenutna rezervacija</h2>

              {suggestMsg ? <div style={{ marginBottom: 12 }}>{suggestMsg}</div> : null}

              {suggestedTable ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <b>Šifra stola:</b> {suggestedTable.label} <br />
                  </div>

                  <Button onClick={handleConfirm}>Potvrdi</Button>
                </>
              ) : (
                <div>Pošalji formu da sistem pronađe sto.</div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
