import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conformitate GDPR",
  description:
    "Cum este Convia conformă cu GDPR: rol de operator/împuternicit, Acord de prelucrare a datelor (DPA), listă de sub-împuterniciți, măsuri tehnice și organizatorice, notificare incidente.",
  alternates: { canonical: "/gdpr" },
  openGraph: {
    type: "website",
    title: "Conformitate GDPR · Convia",
    description:
      "Hub de conformitate GDPR: DPA, sub-împuterniciți, măsuri de securitate, drepturile persoanelor vizate.",
    url: "/gdpr",
  },
};

export default function GdprPage() {
  return (
    <div className="section-y bg-white">
      <div className="container-x">
        <div className="mx-auto max-w-3xl legal-content">
          <p className="legal-meta">Ultima actualizare: 24 mai 2026</p>
          <h1>Conformitate GDPR</h1>

          <p>
            Convia este construită din prima zi pentru a respecta Regulamentul (UE) 2016/679
            („GDPR”) și legislația română de aplicare (Legea 190/2018). Această pagină este un
            rezumat practic al modului în care ne îndeplinim obligațiile, conceput pentru echipele
            legale, ofițerii de protecția datelor (DPO) și departamentele de procurement care
            evaluează platforma. Convia este operată de <strong>NORTEC BLANC S.R.L.</strong>, cu
            sediul în Sat Ciofrângeni, Comuna Ciofrângeni, Nr. 257 bis, corp C16, Județ Argeș,
            România, înregistrată la Registrul Comerțului sub nr. J3/2526/2019, CUI 41773828.
          </p>

          <h2>1. Rolurile noastre sub GDPR</h2>
          <p>
            Convia procesează date personale în două calități distincte, în funcție de context:
          </p>
          <ul>
            <li>
              <strong>Operator de date</strong> pentru contul tău de Convia (nume, email,
              credențiale, facturare, telemetrie de utilizare). În acest caz, deciziile despre
              prelucrare le luăm noi.
            </li>
            <li>
              <strong>Persoană împuternicită</strong> (data processor) pentru datele utilizatorilor
              tăi finali care interacționează cu boții tăi (mesaje, contacte, metadate de
              vizitator). În această situație, <em>tu</em> ești operatorul de date și noi prelucrăm
              datele exclusiv conform instrucțiunilor tale și a DPA-ului semnat.
            </li>
          </ul>
          <p>
            Această distincție este esențială și se reflectă în <a href="/termeni">Termeni</a>,{" "}
            <a href="/confidentialitate">Politica de confidențialitate</a> și în Acordul de
            prelucrare a datelor (DPA).
          </p>

          <h2>2. Acord de prelucrare a datelor (DPA)</h2>
          <p>
            Oferim un Acord de prelucrare a datelor standard, conform Art. 28 GDPR, care include:
          </p>
          <ul>
            <li>Obiectul, natura, scopul și durata prelucrării</li>
            <li>Tipurile de date personale și categoriile de persoane vizate</li>
            <li>Obligațiile de confidențialitate și securitate</li>
            <li>Reguli pentru sub-împuterniciți (inclusiv consimțământ general în avans)</li>
            <li>Asistență pentru exercitarea drepturilor persoanelor vizate</li>
            <li>Notificarea incidentelor de securitate</li>
            <li>
              Clauzele contractuale standard (SCC) aprobate de Comisia Europeană pentru
              transferurile internaționale (Decizia 2021/914)
            </li>
            <li>Ștergerea sau returnarea datelor la încetarea contractului</li>
          </ul>
          <p>
            DPA-ul este disponibil la cerere pentru toți clienții. Pentru a primi o copie sau pentru
            a-l semna, scrie-ne la <a href="mailto:salut@convia.ro">salut@convia.ro</a> cu subiectul
            „Cerere DPA”. Odată semnat, DPA-ul face parte integrantă din relația contractuală cu
            Convia.
          </p>

          <h2>3. Sub-împuterniciți</h2>
          <p>
            Pentru a furniza Serviciul, lucrăm cu un număr restrâns de furnizori terți care
            procesează date personale în numele nostru. Fiecare sub-împuternicit este selectat
            pentru standarde stricte de securitate și este obligat prin DPA să respecte cerințele
            GDPR.
          </p>
          <table>
            <thead>
              <tr>
                <th>Sub-împuternicit</th>
                <th>Rol</th>
                <th>Regiune</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Furnizor cloud (DB)</strong>
                </td>
                <td>Autentificare, baza de date PostgreSQL, stocare fișiere</td>
                <td>UE (Frankfurt)</td>
              </tr>
              <tr>
                <td>
                  <strong>OpenAI</strong>
                </td>
                <td>Generare răspunsuri AI</td>
                <td>SUA (cu SCC)</td>
              </tr>
              <tr>
                <td>
                  <strong>Anthropic</strong>
                </td>
                <td>Generare răspunsuri AI</td>
                <td>SUA (cu SCC)</td>
              </tr>
              <tr>
                <td>
                  <strong>Pinecone</strong>
                </td>
                <td>Vector store pentru baza de cunoștințe (RAG)</td>
                <td>UE (Frankfurt)</td>
              </tr>
              <tr>
                <td>
                  <strong>Pusher</strong>
                </td>
                <td>Mesagerie în timp real (widget)</td>
                <td>UE (Dublin)</td>
              </tr>
              <tr>
                <td>
                  <strong>Stripe</strong>
                </td>
                <td>Procesare plăți, gestionare abonamente</td>
                <td>UE / SUA (cu SCC)</td>
              </tr>
              <tr>
                <td>
                  <strong>Furnizor email tranzacțional</strong>
                </td>
                <td>Trimitere emailuri (confirmări, alerte, facturi)</td>
                <td>UE / SUA (cu SCC)</td>
              </tr>
              <tr>
                <td>
                  <strong>Vercel</strong>
                </td>
                <td>Găzduire frontend (dashboard, site, widget)</td>
                <td>UE (Frankfurt) — regiune principală</td>
              </tr>
            </tbody>
          </table>
          <p>
            Te vom notifica cu cel puțin 30 de zile înainte să adăugăm sau să înlocuim un
            sub-împuternicit. Dacă te opui din motive justificate legate de protecția datelor, vom
            depune eforturi rezonabile pentru a oferi o alternativă; în lipsa acesteia, fiecare
            parte poate înceta contractul.
          </p>

          <h2>4. Măsuri tehnice și organizatorice (Art. 32 GDPR)</h2>
          <p>Implementăm măsuri proporționale cu riscurile pentru drepturile persoanelor vizate:</p>

          <h3>4.1 Securitate tehnică</h3>
          <ul>
            <li>
              <strong>Criptare în repaus</strong> — AES-256 pentru baza de date și fișierele stocate
            </li>
            <li>
              <strong>Criptare în tranzit</strong> — TLS 1.3 obligatoriu pentru toate conexiunile
            </li>
            <li>
              <strong>Hash bcrypt</strong> pentru parolele utilizatorilor, cu factor adaptiv
            </li>
            <li>
              <strong>Row-Level Security (RLS)</strong> la nivel de bază de date, garantând că
              datele unui cont nu pot fi accesate de alte conturi
            </li>
            <li>
              <strong>Rotația cheilor</strong> de criptare la intervale regulate
            </li>
            <li>
              <strong>Rate limiting</strong> și protecție anti-abuz pe toate API-urile
            </li>
            <li>
              <strong>Audit log-uri</strong> pentru acțiunile sensibile din dashboard
            </li>
            <li>
              <strong>Backup-uri zilnice</strong> criptate, cu retenție de 30 de zile
            </li>
          </ul>

          <h3>4.2 Măsuri organizatorice</h3>
          <ul>
            <li>
              <strong>Control acces bazat pe roluri (RBAC)</strong> — Owner, Admin, Developer, Agent
              uman, fiecare cu permisiuni granulare
            </li>
            <li>
              <strong>Principiul „nevoia de a cunoaște”</strong> — accesul angajaților la datele
              clienților este limitat la situațiile strict necesare (suport, debug, mentenanță)
            </li>
            <li>
              <strong>Pregătire periodică</strong> a echipei pe teme de protecția datelor și
              securitate
            </li>
            <li>
              <strong>Politici interne</strong> de management al parolelor, dispozitivelor și
              accesului
            </li>
            <li>
              <strong>Acorduri de confidențialitate</strong> semnate de toți angajații și
              colaboratorii
            </li>
          </ul>

          <h3>4.3 Continuitatea serviciului</h3>
          <ul>
            <li>Monitorizare 24/7 a infrastructurii și alerte automate</li>
            <li>Backup-uri redundante geografic în regiunea UE</li>
            <li>Plan de recuperare după dezastre (DRP) testat periodic</li>
          </ul>

          <h2>5. Drepturile persoanelor vizate</h2>
          <p>
            GDPR garantează persoanelor vizate drepturi specifice. Modul în care le facem efective
            depinde de rolul nostru:
          </p>
          <ul>
            <li>
              <strong>Pentru datele contului tău</strong> (unde noi suntem operator) — te poți
              adresa direct la <a href="mailto:salut@convia.ro">salut@convia.ro</a>. Răspundem în
              maximum 30 de zile.
            </li>
            <li>
              <strong>Pentru datele utilizatorilor tăi finali</strong> (unde noi suntem împuternicit) —
              cererile se adresează ție, în calitate de operator. Te asistăm tehnic să le
              îndeplinești: exportul datelor unei persoane, ștergerea unei conversații sau
              restricționarea prelucrării sunt disponibile direct din dashboard.
            </li>
          </ul>
          <p>Drepturile incluse:</p>
          <ul>
            <li>
              <strong>Acces</strong> (Art. 15) — copie a datelor personale prelucrate
            </li>
            <li>
              <strong>Rectificare</strong> (Art. 16) — corectarea datelor inexacte
            </li>
            <li>
              <strong>Ștergere</strong> (Art. 17) — „dreptul de a fi uitat”
            </li>
            <li>
              <strong>Restricționare</strong> (Art. 18) — limitarea prelucrării
            </li>
            <li>
              <strong>Portabilitate</strong> (Art. 20) — date într-un format structurat,
              prelucrabil automat
            </li>
            <li>
              <strong>Opoziție</strong> (Art. 21)
            </li>
            <li>
              <strong>Retragerea consimțământului</strong> (Art. 7)
            </li>
            <li>
              <strong>Plângere la autoritatea de supraveghere</strong> (Art. 77) — ANSPDCP în
              România
            </li>
          </ul>

          <h2>6. Transferuri internaționale de date</h2>
          <p>
            Datele stocate în infrastructura noastră principală rămân în Uniunea Europeană
            (Frankfurt). Anumiți sub-împuterniciți (precum furnizorii de modele AI) sunt situați în
            SUA. Pentru acele transferuri:
          </p>
          <ul>
            <li>
              Aplicăm <strong>clauzele contractuale standard (SCC)</strong> aprobate de Comisia
              Europeană (Decizia 2021/914)
            </li>
            <li>
              Realizăm <strong>evaluări de impact al transferului (TIA)</strong> pentru a verifica
              că legislația din țara destinatară nu compromite drepturile persoanelor vizate
            </li>
            <li>
              Implementăm măsuri suplimentare acolo unde este necesar (criptare suplimentară,
              pseudonimizare, contracte adiționale)
            </li>
          </ul>

          <h2>7. Notificarea incidentelor de securitate</h2>
          <p>În cazul unui incident de securitate care implică date personale:</p>
          <ul>
            <li>
              <strong>Identificare și conținere</strong> — Echipa noastră investighează imediat și
              limitează impactul
            </li>
            <li>
              <strong>Notificare ANSPDCP</strong> — Dacă suntem operator și incidentul prezintă risc
              pentru drepturile persoanelor vizate, notificăm ANSPDCP în maximum{" "}
              <strong>72 de ore</strong> (Art. 33)
            </li>
            <li>
              <strong>Notificarea clienților</strong> — Dacă suntem împuternicit, te notificăm fără
              întârziere nejustificată, oferind toate detaliile necesare pentru ca tu, ca operator,
              să-ți îndeplinești la rândul tău obligațiile de raportare
            </li>
            <li>
              <strong>Notificarea persoanelor vizate</strong> — Atunci când este obligatorie
              conform Art. 34, transmitem comunicări clare și acționabile
            </li>
            <li>
              <strong>Documentare</strong> — Păstrăm înregistrări detaliate ale incidentelor și ale
              măsurilor luate, conform Art. 33(5)
            </li>
          </ul>

          <h2>8. Evidența activităților de prelucrare (Art. 30)</h2>
          <p>
            Menținem evidența activităților noastre de prelucrare, atât în calitate de operator, cât
            și de împuternicit, conform Art. 30 GDPR. Această evidență este disponibilă autorității
            de supraveghere la cerere. Clienții B2B care au nevoie de extrase relevante pentru
            propriile registre de prelucrare ne pot contacta la{" "}
            <a href="mailto:salut@convia.ro">salut@convia.ro</a>.
          </p>

          <h2>9. AI și prelucrarea automată</h2>
          <p>
            Boții noștri generează răspunsuri folosind modele AI ale unor furnizori terți (OpenAI,
            Anthropic). Câteva clarificări importante:
          </p>
          <ul>
            <li>
              <strong>Nu antrenăm modele AI cu datele tale.</strong> Conversațiile sunt transmise
              tranzitoriu, doar pentru a genera un răspuns. Furnizorii AI sunt obligați contractual
              să nu rețină datele pentru antrenare.
            </li>
            <li>
              <strong>Conținutul AI necesită supraveghere umană.</strong> Răspunsurile pot fi
              ocazional inexacte. Pentru cazurile unde este nevoie de decizie umană, oferim mecanism
              de preluare umană („human takeover”).
            </li>
            <li>
              <strong>Decizii automatizate.</strong> Convia nu ia decizii automate care produc
              efecte juridice asupra persoanelor vizate, în sensul Art. 22 GDPR.
            </li>
          </ul>

          <h2>10. Contact pentru protecția datelor</h2>
          <p>
            Pentru orice cerere legată de GDPR — DPA, cereri din partea persoanelor vizate,
            întrebări despre sub-împuterniciți sau notificarea unui incident — te rugăm să ne
            contactezi:
          </p>
          <p>
            <strong>NORTEC BLANC S.R.L. — operator Convia</strong>
            <br />
            Sediul social: Sat Ciofrângeni, Comuna Ciofrângeni, Nr. 257 bis, corp C16, Județ Argeș,
            România
            <br />
            Nr. Registrul Comerțului: J3/2526/2019
            <br />
            CUI: 41773828 · Cod TVA UE: RO41773828
            <br />
            Email protecția datelor: <a href="mailto:salut@convia.ro">salut@convia.ro</a> (subiect:
            „GDPR”)
          </p>

          <h2>11. Autoritatea de supraveghere</h2>
          <p>
            Dacă apreciezi că am încălcat drepturile tale conferite de GDPR, ai dreptul să depui o
            plângere la <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu
            Caracter Personal</strong> (ANSPDCP):
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
          <p>
            Poți depune plângere și la autoritatea de supraveghere a statului UE/SEE în care ai
            reședința obișnuită sau locul de muncă, ori unde a avut loc presupusa încălcare.
          </p>
        </div>
      </div>
    </div>
  );
}
