"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";

export default function ReservationsPage() {
  const [teamName, setTeamName] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [note, setNote] = useState("");

  const partyChoice = [2, 3, 4, 5, 6, 7].map((n) => ({
    value: n,
    label: String(n),
  }));

  function handleSubmit() {
    alert(`Tim: ${teamName}\nLjudi: ${partySize}\nNapomena: ${note}`);
  }

  return (
    <main style={{ padding: 24, maxWidth: 500 }}>
      <h1>Rezervacije</h1>

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
          style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 8, width: "100%" }}
        />
      </label>

      <Button onClick={handleSubmit}>Pošalji</Button>

      <nav style={{ display: "flex", gap: 16, marginTop: 20 }}>
        <Link href="/">Pocetna</Link>
      </nav>
    

    </main>
  );
}
