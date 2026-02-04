import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Egzibicija Pab Kviz</h1>
      <p>Najbolji kvizovi u gradu.</p>

      <nav style={{ display: "flex", gap: 16, marginTop: 20 }}>
        <Link href="/login">Prijava</Link>
        <Link href="/reservation">Rezervacije</Link>
      </nav>
    </main>
  );
}

