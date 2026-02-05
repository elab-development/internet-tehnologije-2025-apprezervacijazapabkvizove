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
      setTimeout(() => router.push("/login"), 2000);
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

      <main className="container">
        <h1>Rezervacija</h1>
        <p className="subTitle">Unesi podatke i pošalji zahtev za rezervaciju.</p>

        <div className="card">
          {message && <div className="notice">{message}</div>}

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

              <label className="field">
                <div className="label">Napomena</div>
                <textarea
                  className="textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
              </label>

              <Button onClick={handleSubmit}>Pošalji</Button>
            </>
          )}
        </div>
      </main>
    </>
  );
}
