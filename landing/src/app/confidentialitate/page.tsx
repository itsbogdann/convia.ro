import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description:
    "Cum colectează, folosește, stochează și protejează Convia datele tale cu caracter personal. Conform GDPR și legislației române.",
  alternates: { canonical: "/confidentialitate" },
  openGraph: {
    type: "website",
    title: "Politica de confidențialitate · Convia",
    description:
      "Cum colectează, folosește, stochează și protejează Convia datele cu caracter personal. Conform GDPR.",
    url: "/confidentialitate",
  },
};

export default function PrivacyPage() {
  return (
    <div className="section-y bg-white">
      <div className="container-x">
        <div className="mx-auto max-w-3xl legal-content">
          <p className="legal-meta">Ultima actualizare: 24 mai 2026</p>
          <h1>Politica de confidențialitate</h1>

          <p>
            Această Politică de confidențialitate explică modul în care Convia („noi”, „nouă”,
            „nostru”) colectează, folosește, stochează și protejează datele tale cu caracter
            personal atunci când utilizezi platforma noastră, site-ul, API-urile și widgetul de chat
            integrabil (denumite colectiv „Serviciul”). Serviciul este operat de{" "}
            <strong>NORTEC BLANC S.R.L.</strong>, societate înregistrată în România, cu sediul în
            Sat Ciofrângeni, Comuna Ciofrângeni, Nr. 257 bis, corp C16, Județ Argeș, România,
            înregistrată la Registrul Comerțului sub nr. J3/2526/2019, având CUI 41773828 și cod TVA
            RO41773828, care acționează ca operator de date pentru datele personale procesate prin
            Serviciu. Prin utilizarea Serviciului, ești de acord cu practicile descrise în această
            politică.
          </p>

          <h2>1. Informațiile pe care le colectăm</h2>

          <h3>1.1 Informații despre cont</h3>
          <p>Când îți creezi un cont, colectăm:</p>
          <ul>
            <li>Nume și adresă de email</li>
            <li>Credențiale de autentificare (gestionate securizat)</li>
            <li>Informații despre echipa ta și membrii ei</li>
            <li>
              Date de facturare (procesate și stocate de Stripe — nu stocăm numerele complete de
              card)
            </li>
          </ul>

          <h3>1.2 Date de utilizare</h3>
          <p>Colectăm automat informații despre felul în care interacționezi cu Serviciul:</p>
          <ul>
            <li>Pagini vizitate, funcționalități folosite și acțiuni efectuate în dashboard</li>
            <li>Tip de dispozitiv, browser, sistem de operare și adresă IP</li>
            <li>Sursa de referință și durata sesiunii</li>
            <li>
              Metrici de performanță ale boților (timpi de răspuns, volum de conversații, rată de
              preluare umană)
            </li>
          </ul>

          <h3>1.3 Conținut pe care îl furnizezi</h3>
          <p>Prin utilizarea Serviciului, poți încărca sau genera:</p>
          <ul>
            <li>Documente pentru baza de cunoștințe (PDF-uri, foi Excel, URL-uri etc.)</li>
            <li>Configurări de bot și instrucțiuni de sistem</li>
            <li>Date din conversațiile dintre boții tăi și utilizatorii finali</li>
            <li>Câmpuri și metadate personalizate despre vizitatori</li>
          </ul>

          <h3>1.4 Date ale utilizatorilor finali</h3>
          <p>
            Când vizitatorii interacționează cu botul tău prin widget, putem colecta în numele tău:
          </p>
          <ul>
            <li>Mesajele schimbate în timpul conversației</li>
            <li>Nume, email, număr de telefon sau alte câmpuri pe care le configurezi</li>
            <li>Tip de browser, informații despre dispozitiv și adresă IP</li>
            <li>URL-ul paginii unde este integrat widgetul</li>
          </ul>
          <p>
            În calitate de client Convia, tu acționezi ca operator de date pentru datele
            utilizatorilor finali colectate prin boții tăi. Ești responsabil să le furnizezi
            informări corespunzătoare de confidențialitate și să obții consimțământul necesar, după
            caz.
          </p>

          <h2>2. Cum folosim informațiile</h2>
          <p>Folosim informațiile colectate pentru:</p>
          <ul>
            <li>A oferi, întreține și îmbunătăți Serviciul</li>
            <li>A procesa plățile și administra abonamentul tău</li>
            <li>
              A trimite comunicări legate de serviciu (notificări de cont, alerte de securitate,
              facturi)
            </li>
            <li>A genera statistici despre performanța boților</li>
            <li>A detecta și preveni fraude, abuzuri și incidente de securitate</li>
            <li>A răspunde solicitărilor de suport</li>
            <li>A respecta obligațiile legale</li>
          </ul>
          <p>
            <strong>NU</strong> folosim conținutul sau datele tale din conversații pentru a antrena
            modele AI. Atunci când conversațiile sunt procesate de furnizori AI terți pentru a
            genera răspunsuri, datele sunt trimise tranzitoriu și nu sunt reținute de acei furnizori
            pentru antrenarea modelelor.
          </p>

          <h2>3. Temeiul juridic al prelucrării (GDPR Art. 6)</h2>
          <p>Prelucrăm datele tale doar atunci când avem un temei legal valid:</p>
          <ul>
            <li>
              <strong>Executarea contractului</strong> (Art. 6(1)(b)) — pentru a furniza Serviciul,
              a-ți crea contul și a procesa abonamentele;
            </li>
            <li>
              <strong>Obligație legală</strong> (Art. 6(1)(c)) — pentru contabilitate, facturare și
              raportare fiscală conform legislației române;
            </li>
            <li>
              <strong>Interes legitim</strong> (Art. 6(1)(f)) — pentru securitatea Serviciului,
              prevenirea fraudelor, statistici interne agregate și îmbunătățirea funcționalităților;
            </li>
            <li>
              <strong>Consimțământ</strong> (Art. 6(1)(a)) — pentru cookie-uri ne-esențiale, marketing
              prin email sau alte situații specifice. Poți retrage consimțământul oricând.
            </li>
          </ul>

          <h2>4. Cum partajăm informațiile</h2>
          <p>Partajăm datele tale numai în următoarele situații:</p>

          <h3>4.1 Furnizori de servicii (împuterniciți)</h3>
          <p>Folosim servicii terțe de încredere pentru a opera platforma:</p>
          <ul>
            <li>
              <strong>Stripe</strong> — Procesare plăți și gestionare abonamente
            </li>
            <li>
              <strong>Furnizori AI (OpenAI, Anthropic)</strong> — Generarea răspunsurilor AI
            </li>
            <li>
              <strong>Infrastructură cloud</strong> — Autentificare, găzduire baze de date și
              mesagerie în timp real
            </li>
            <li>
              <strong>Furnizor email tranzacțional</strong> — Trimitere emailuri (confirmări,
              alerte, notificări, facturi)
            </li>
            <li>
              <strong>Pinecone</strong> — Vector store pentru baza de cunoștințe (RAG)
            </li>
          </ul>
          <p>
            Fiecare furnizor procesează datele exclusiv în numele nostru și este obligat contractual
            să-ți protejeze informațiile.
          </p>

          <h3>4.2 Cerințe legale</h3>
          <p>
            Putem divulga informațiile tale dacă suntem obligați prin lege, hotărâre judecătorească
            sau cerere a unei autorități, sau dacă apreciem cu bună-credință că divulgarea este
            necesară pentru a ne proteja drepturile, siguranța ta sau siguranța altora.
          </p>

          <h3>4.3 Transferuri în cadrul unei tranzacții</h3>
          <p>
            Dacă Convia (NORTEC BLANC S.R.L.) este implicată într-o fuziune, achiziție sau vânzare
            de active, informațiile tale pot fi transferate ca parte a tranzacției. Te vom notifica
            în legătură cu orice astfel de modificare.
          </p>

          <h2>5. Stocarea și securitatea datelor</h2>
          <p>Datele tale sunt protejate prin măsuri de securitate la standarde industriale:</p>
          <ul>
            <li>
              <strong>Criptare în repaus</strong> — Datele din baza noastră sunt criptate cu AES-256
            </li>
            <li>
              <strong>Criptare în tranzit</strong> — Toate conexiunile folosesc TLS 1.3
            </li>
            <li>
              <strong>Hash-uri pentru parole</strong> — Parolele sunt hash-uite cu bcrypt
            </li>
            <li>
              <strong>Row-Level Security</strong> — Politicile DB asigură că utilizatorii pot accesa
              doar datele din contul lor
            </li>
            <li>
              <strong>Rotația automată a cheilor</strong> — Cheile de criptare sunt rotite periodic
            </li>
            <li>
              <strong>Rate limiting</strong> — Limitele API protejează împotriva abuzurilor
            </li>
            <li>
              <strong>Control acces bazat pe roluri (RBAC)</strong> — Permisiuni granulare la nivel
              de cont și echipă
            </li>
          </ul>
          <p>
            Datele sunt găzduite pe infrastructură cloud conformă SOC 2. Deși implementăm măsuri
            robuste, niciun sistem nu este complet sigur. Te încurajăm să folosești parole puternice
            și să activezi funcționalități suplimentare de securitate, atunci când sunt disponibile.
          </p>

          <h2>6. Perioada de păstrare</h2>
          <ul>
            <li>
              <strong>Date de cont</strong> — Păstrate pe durata contului. Șterse în maximum 30 de
              zile de la închiderea contului.
            </li>
            <li>
              <strong>Date din conversații</strong> — Păstrate pe durata abonamentului. Poți șterge
              conversații individuale oricând.
            </li>
            <li>
              <strong>Conținutul bazei de cunoștințe</strong> — Păstrat până când ștergi sursa sau
              îți închizi contul.
            </li>
            <li>
              <strong>Loguri de utilizare</strong> — Păstrate până la 12 luni, pentru statistici și
              securitate.
            </li>
            <li>
              <strong>Documente fiscale și de facturare</strong> — Păstrate conform legislației
              române (în general, 10 ani).
            </li>
          </ul>

          <h2>7. Drepturile tale (GDPR)</h2>
          <p>În calitate de persoană vizată, ai următoarele drepturi:</p>
          <ul>
            <li>
              <strong>Acces</strong> — Să soliciți o copie a datelor personale pe care le deținem
              despre tine
            </li>
            <li>
              <strong>Rectificare</strong> — Să corectezi date inexacte sau incomplete
            </li>
            <li>
              <strong>Ștergere („dreptul de a fi uitat”)</strong> — Să ceri ștergerea datelor
              personale
            </li>
            <li>
              <strong>Portabilitate</strong> — Să primești datele într-un format structurat,
              prelucrabil automat
            </li>
            <li>
              <strong>Restricționarea prelucrării</strong> — Să ne ceri să limităm prelucrarea
            </li>
            <li>
              <strong>Opoziție</strong> — Să te opui anumitor tipuri de prelucrare
            </li>
            <li>
              <strong>Retragerea consimțământului</strong> — Când prelucrarea se bazează pe
              consimțământ, îl poți retrage oricând
            </li>
          </ul>
          <p>
            Pentru a-ți exercita orice drept, ne poți scrie la{" "}
            <a href="mailto:salut@convia.ro">salut@convia.ro</a>. Vom răspunde în termen de 30 de
            zile.
          </p>
          <p>
            <strong>Dreptul de a depune o plângere.</strong> Dacă apreciezi că am prelucrat datele
            tale personale în mod nelegal, poți depune o plângere la autoritatea de supraveghere.
            Deoarece Convia este stabilită în România, autoritatea competentă este{" "}
            <strong>
              Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal
            </strong>{" "}
            (ANSPDCP):
          </p>
          <ul>
            <li>
              Adresa: B-dul G-ral. Gheorghe Magheru nr. 28-30, Sector 1, 010336, București, România
            </li>
            <li>
              Site web:{" "}
              <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">
                www.dataprotection.ro
              </a>
            </li>
            <li>
              Email:{" "}
              <a href="mailto:anspdcp@dataprotection.ro">anspdcp@dataprotection.ro</a>
            </li>
          </ul>

          <h2>8. Transferuri internaționale de date</h2>
          <p>
            Datele tale pot fi prelucrate în țări din afara Spațiului Economic European. Atunci când
            transferăm date internațional, ne asigurăm că există garanții adecvate, inclusiv
            clauzele contractuale standard aprobate de Comisia Europeană sau mecanisme legale
            echivalente, pentru a-ți proteja informațiile conform legislației aplicabile privind
            protecția datelor.
          </p>

          <h2>9. Confidențialitatea minorilor</h2>
          <p>
            Serviciul nu este destinat persoanelor sub 18 ani. Nu colectăm cu bună-știință date
            personale ale copiilor. Dacă aflăm că am colectat date de la un copil, vom lua măsurile
            necesare pentru a le șterge prompt.
          </p>

          <h2>10. Modificări ale acestei politici</h2>
          <p>
            Putem actualiza această Politică periodic. Dacă facem modificări substanțiale, te vom
            notifica prin email sau prin Serviciu cu cel puțin 30 de zile înainte de intrarea în
            vigoare. Data „Ultima actualizare” din partea de sus reflectă cea mai recentă revizuire.
          </p>

          <h2>11. Contact</h2>
          <p>
            Pentru orice întrebare despre această Politică sau despre practicile noastre de
            confidențialitate, scrie-ne la{" "}
            <a href="mailto:salut@convia.ro">salut@convia.ro</a>.
          </p>
          <p>
            <strong>Operator de date:</strong>
            <br />
            NORTEC BLANC S.R.L.
            <br />
            Sediul social: Sat Ciofrângeni, Comuna Ciofrângeni, Nr. 257 bis, corp C16, Județ Argeș,
            România
            <br />
            Nr. Registrul Comerțului: J3/2526/2019
            <br />
            Cod unic de înregistrare (CUI): 41773828
            <br />
            Cod TVA UE: RO41773828
            <br />
            Email: <a href="mailto:salut@convia.ro">salut@convia.ro</a>
          </p>
        </div>
      </div>
    </div>
  );
}
