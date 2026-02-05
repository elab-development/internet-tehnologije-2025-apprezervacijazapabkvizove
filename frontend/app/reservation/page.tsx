"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/ui/navbar";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";

export default function ReservationPage() {
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Morate biti ulogovani da biste pristupili rezervacijama.");

      setTimeout(() => {
        router.push("/login");
      },2000);

      return;
    }
  }, [router]);

  function handleSubmit() {
    alert(`Tim: ${teamName}\nLjudi: ${partySize}\nNapomena: ${note}`);
  }

  const partyChoice = [2, 3, 4, 5, 6, 7].map((n) => ({
    value: n,
    label: String(n),
  }));

  return (
    <>
      <Navbar />

      <main style={{ padding: 24, maxWidth: 500 }}>
        <h1>Rezervacija</h1>

        {/* PORUKA ZA NEULOGOVANOG KORISNIKA */}
        {message && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              border: "1px solid #f5c2c7",
              background: "#f8d7da",
              color: "#842029",
              borderRadius: 8,
            }}
          >
            {message}
          </div>
        )}

        {/* Forma ce se videti samo ako je korisnik ulogovan */}
        {!message && (
          <>
            <Input
              label="Naziv tima"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />

            <Select
              label="Broj ljudi"
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
              options={partyChoice}
            />

            <label style={{ display: "block", marginBottom: 12 }}>
              <div style={{ marginBottom: 6 }}>Napomena</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                style={{
                  padding: "10px 12px",
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  width: "100%",
                }}
              />
            </label>

            <Button onClick={handleSubmit}>Pošalji</Button>
          </>
        )}
      </main>
    </>
  );
}
