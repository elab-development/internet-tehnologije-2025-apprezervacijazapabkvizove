"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/ui/navbar";

type Quiz = {
  id: number;
  name: string;
  start_datetime: string;
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleString("sr-RS");
}

export default function Home() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadQuizzes = async () => {
      try {
        setError(null);

        const res = await fetch("http://127.0.0.1:8000/api/quizzes/", {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Ne mogu da učitam kvizove (proveri permissions u backendu).");
        }

        const data = await res.json();

        // očekujemo da backend vraća listu kvizova
        if (!Array.isArray(data)) {
          throw new Error("Neispravan format podataka sa servera.");
        }

        setQuizzes(data);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Greška pri učitavanju.");
      }
    };

    loadQuizzes();

    return () => controller.abort();
  }, []);

  return (
    <>
      <Navbar />

      <main className="container">
        <h1>Najbolji kviz u gradu.</h1>
        <p className="subTitle">Rezerviši svoje mesto i dođi na Egzibiciju.</p>

        <div className="sectionGrid">
          <div className="smallCard">
            <h2>Kako funkcioniše kviz?</h2>
            <p>
              Kviz je namenjen svim uzrastima, od srednjoškolaca i studenata do njihov roditelja!
              Ako se spremate za Slagalicu i Poteru ili želite zanimaciju dok pijete piće sa društvom,
              ovo je mesto za Vas! Pab kviz ima dva poluvremena. Ekipe dobijaju formulare i na njima
              upisuju odgovore na pitanja. Ekipe međusobno pregledaju formulare i najbolje ekipe dobijaju
              nagrade na kraju svakog kviza.
            </p>
          </div>

          <div className="smallCard">
            <h2>Tipovi kvizova</h2>
            <p>
              Naš najpoznatiji kviz je kviz opšteg znanja na slovo. Testiramo Vaše znanje u 10 kategorija,
              kao što su: geografija, istorija, prirodne i društvene nauke, sport, filmovi, muzika i razne
              oblasti iznenađenja. Pored toga održavamo i muzičke kvizove gde je atmosfera na drugom nivou,
              ako ste filmofil za Vas je filmski kviz, a posebna poslastica za nostalgičare je Ultra vs Dizni
              kviz koji Vas vraća u detinjstvo.
            </p>
          </div>

          <div className="smallCard">
            <h2>Gde i kada su kvizovi?</h2>
            <p>
              Za termine i lokacije kvizova pratite sajt i naš Instagram profil. <b>Rezervacije su obavezne</b>,
              a možete rezervisati preko Instagrama ili XY broja, a od sada možete i ovde - u sekciji Rezervacija!
            </p>
          </div>
        </div>

        <h1 style={{ marginTop: 35 }}>Izaberi kviz za rezervaciju</h1>
        {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}

        <div className="sectionGrid" style={{ marginTop: 12 }}>
          {quizzes.length === 0 && !error ? (
            <div className="smallCard2">
              <h3>Nema kvizova</h3>
              <p>Dodaj kviz u Django admin panelu pa refresh.</p>
            </div>
          ) : (
            quizzes.map((q) => (
              <Link key={q.id} href={`/reservation?quiz=${q.id}`} className="smallCard2">
                <h3 style={{ marginBottom: 6 }}>{q.name}</h3>
                <p>Datum i vreme: <b>{formatDate(q.start_datetime)}</b></p>
              </Link>
            ))
          )}
        </div>
      </main>
    </>
  );
}
