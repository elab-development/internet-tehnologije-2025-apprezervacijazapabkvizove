import Navbar from "@/components/ui/navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="container">
        <h1>Najbolji kviz u gradu.</h1>
        <p className="subTitle">
          Rezerviši svoje mesto i dođi na Egzibiciju.
        </p>

        <div className="sectionGrid">
          <div className="smallCard">
            <h2>Kako funkcioniše kviz?</h2>
            <p>Kviz je namenjen svim uzrastima, od srednjoškolaca i studenata do njihov roditelja!
               Ako se spremate za Slagalicu i Poteru ili želite zanimaciju dok pijete piće sa društvom, ovo je mesto za Vas!
               Pab kviz ima dva poluvremena. Ekipe dobijaju formulare i na njima upisuju odgovore na pitanja.
               Ekipe međusobno pregledaju formulare i najbolje ekipe dobijaju nagrade na kraju svakog kviza.
</p>
          </div>

          <div className="smallCard">
            <h2>Tipovi kvizova</h2>
            <p>Naš najpoznatiji kviz je kviz opšteg znanja na slovo. 
              Testiramo Vaše znanje u 10 kategorija, kao što su: geografija, istorija, prirodne i društvene nauke, sport, filmovi, muzika i razne oblasti iznenađenja.
              Pored toga održavamo i muziče kvizove gde je atmsofera na drugom nivou, ako ste filmofil za Vas je filmski kviz,
               a posebna poslastica za nostalgičare je Ultra vs Dizni kviz koji Vas vraća u detinjstvo.</p>
          </div>

          <div className="smallCard">
            <h2>Gde i kada su kvizovi?</h2>
            <p>Za termine i lokacije kvizova pratite sajt i naš Instagram profil. <b>Rezervacije su obavezne</b>, a možete rezervisati preko Instagrama ili XY broja, a od sada možete i ovde - u sekciji Rezervacija!</p>
          </div>

        </div>
      </main>
    </>
  );
}
