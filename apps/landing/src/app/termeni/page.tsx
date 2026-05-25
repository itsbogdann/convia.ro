import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și condiții",
  description:
    "Termenii și condițiile de utilizare a platformei Convia: chatbot AI pentru afaceri din România. Aplicabili pe site-ul convia.ro, aplicația de dashboard și widgetul de chat.",
  alternates: { canonical: "/termeni" },
  openGraph: {
    type: "website",
    title: "Convia | Termeni și condiții",
    description:
      "Termenii și condițiile de utilizare a platformei Convia: chatbot AI pentru afaceri din România.",
    url: "/termeni",
  },
};

export default function TermsPage() {
  return (
    <div className="section-y bg-white">
      <div className="container-x">
        <div className="mx-auto max-w-3xl legal-content">
          <p className="legal-meta">Ultima actualizare: 24 mai 2026</p>
          <h1>Termeni și condiții</h1>

          <p>
            Acești Termeni și condiții („Termenii”) reglementează accesul și utilizarea platformei
            Convia, incluzând site-ul de la adresa convia.ro, aplicația de tip dashboard, API-urile,
            widgetul de chat integrabil și toate serviciile asociate (denumite colectiv „Serviciul”).
            Serviciul este operat de <strong>NORTEC BLANC S.R.L.</strong>, societate înregistrată în
            România, cu sediul în Sat Ciofrângeni, Comuna Ciofrângeni, Nr. 257 bis, corp C16, Județ
            Argeș, România, înregistrată la Registrul Comerțului sub nr. J3/2526/2019, cod unic de
            înregistrare (CUI) 41773828 și cod de înregistrare în scopuri de TVA RO41773828
            („Convia”, „noi”, „nouă” sau „nostru”). Prin accesarea sau utilizarea Serviciului, ești
            de acord să respecți acești Termeni.
          </p>

          <h2>1. Crearea contului</h2>
          <p>
            Pentru a folosi Serviciul, trebuie să creezi un cont cu informații corecte și complete.
            Ești responsabil de păstrarea confidențialității credențialelor și de toate activitățile
            care au loc sub contul tău. Trebuie să ne anunți imediat la{" "}
            <a href="mailto:salut@convia.ro">salut@convia.ro</a> dacă suspectezi un acces
            neautorizat.
          </p>
          <p>
            Trebuie să ai cel puțin 18 ani pentru a-ți crea un cont. Prin înregistrare, declari că
            ai autoritatea legală de a accepta acești Termeni în nume propriu sau în numele
            organizației pe care o reprezinți.
          </p>

          <h2>2. Descrierea Serviciului</h2>
          <p>
            Convia este o platformă AI care îți permite să construiești și să operezi asistenți
            conversaționali pentru afacerea ta. Cu Serviciul poți:
          </p>
          <ul>
            <li>Crea și configura chatboți AI („Boți”) pentru site sau WhatsApp</li>
            <li>Construi baze de cunoștințe pornind de la site, PDF-uri, fișiere Excel sau text</li>
            <li>Integra widgetul de chat pe site-uri externe</li>
            <li>Monitoriza și gestiona conversațiile printr-un inbox comun</li>
            <li>Prelua în timp real conversațiile ținute de bot („preluare umană”)</li>
            <li>Colabora cu colegii din echipă în cadrul aceluiași spațiu de lucru</li>
            <li>Vizualiza statistici și rapoarte despre performanța boților</li>
          </ul>

          <h2>3. Abonamente și facturare</h2>
          <h3>3.1 Pachete</h3>
          <p>Serviciul este oferit în următoarele pachete:</p>
          <ul>
            <li>
              <strong>Gratuit</strong>: 0 RON/lună. Include 1 chatbot, 100 conversații/lună,
              conectare la site web, model AI standard, branding Convia și suport prin email.
            </li>
            <li>
              <strong>Business</strong>: 149 RON/lună (sau 119 RON/lună la plata anuală). Include 3
              chatboți, 1.000 conversații/lună incluse, site web + WhatsApp, modele AI premium
              (OpenAI și Anthropic), branding personalizat, preluare umană și suport prioritar în
              limba română. Conversațiile suplimentare se taxează cu 0,25 RON/conversație + TVA.
            </li>
            <li>
              <strong>Premium</strong>: 349 RON/lună (sau 279 RON/lună la plata anuală). Include
              chatboți nelimitați, 5.000 conversații/lună incluse, toate canalele (Site, WhatsApp,
              Messenger, Instagram), modele AI premium + acces prioritar la modele noi, statistici
              avansate, integrare cu CRM și calendar și manager de cont dedicat. Conversațiile
              suplimentare se taxează cu 0,12 RON/conversație + TVA.
            </li>
            <li>
              <strong>Enterprise</strong>: Preț personalizat. Conversații și chatboți nelimitați,
              acord de prelucrare a datelor (DPA), SLA garantat, onboarding cu echipa noastră și
              integrare custom. Contactează{" "}
              <a href="mailto:salut@convia.ro">salut@convia.ro</a>.
            </li>
          </ul>
          <p>
            Toate prețurile sunt exprimate în RON și sunt fără TVA, dacă nu se menționează altfel.
            TVA-ul aplicabil se adaugă la momentul facturării conform legislației române.
          </p>

          <h3>3.2 Facturare</h3>
          <p>
            Abonamentele plătite sunt facturate în avans, lunar sau anual. Toate taxele sunt
            nereturnabile, cu excepția cazurilor expres prevăzute în acești Termeni sau impuse de
            legislația aplicabilă. Folosim Stripe ca procesator de plăți. Prin furnizarea datelor de
            plată, autorizezi debitarea metodei de plată cu sumele aplicabile.
          </p>

          <h3>3.3 Limite de utilizare și conversații suplimentare</h3>
          <p>
            Fiecare pachet include un număr lunar de conversații. Dacă depășești limita, nu blocăm
            botul: conversațiile suplimentare se facturează la prețul afișat pe site (0,25
            RON/conversație pe Business, 0,12 RON/conversație pe Premium, + TVA). Te anunțăm
            transparent când te apropii și când depășești limita.
          </p>

          <h3>3.4 Modificarea sau anularea abonamentului</h3>
          <p>
            Poți să faci upgrade, downgrade sau să-ți anulezi abonamentul oricând, din pagina
            „Setări” a dashboard-ului. Anulările și downgrade-urile produc efect la finalul
            perioadei curente de facturare. Nu se acordă refunds parțiale pentru timpul neutilizat
            dintr-un ciclu de facturare.
          </p>
          <p>
            <strong>Dreptul consumatorilor de a se retrage (B2C).</strong> Dacă ești consumator în
            sensul OUG 34/2014, te poți retrage din contract în termen de 14 zile de la încheierea
            acestuia, fără penalități și fără a invoca un motiv, contactându-ne la{" "}
            <a href="mailto:salut@convia.ro">salut@convia.ro</a>. Prin crearea contului și începerea
            efectivă a utilizării Serviciului în acest interval, îți exprimi acordul ca prestarea
            serviciilor să înceapă imediat și recunoști că dreptul de retragere se pierde după
            executarea integrală a serviciilor în această perioadă.
          </p>

          <h2>4. Utilizare acceptabilă</h2>
          <p>Ești de acord să nu folosești Serviciul pentru:</p>
          <ul>
            <li>A încălca legi, reglementări sau drepturi ale terților</li>
            <li>A trimite spam, mesaje nesolicitate sau comunicări înșelătoare</li>
            <li>A distribui malware, viruși sau cod dăunător</li>
            <li>A obține acces neautorizat la alte conturi, sisteme sau rețele</li>
            <li>A impersona orice persoană sau entitate</li>
            <li>
              A colecta date cu caracter personal de la utilizatorii finali fără consimțământ
              valid și fără informări de confidențialitate corespunzătoare
            </li>
            <li>A afecta disponibilitatea sau performanța Serviciului</li>
            <li>A face reverse engineering, decompila sau dezasambla orice parte a Serviciului</li>
            <li>A revinde sau redistribui Serviciul fără autorizație scrisă</li>
          </ul>
          <p>
            Ne rezervăm dreptul de a suspenda sau închide conturile care încalcă acești Termeni, cu
            sau fără preaviz.
          </p>

          <h2>5. Conținutul și datele tale</h2>
          <h3>5.1 Proprietatea</h3>
          <p>
            Îți păstrezi toate drepturile asupra conținutului pe care îl încarci, creezi sau
            transmiți prin Serviciu („Conținutul tău”), inclusiv documente din baza de cunoștințe,
            configurări de bot și date din conversații. Nu revendicăm proprietatea asupra
            Conținutului tău.
          </p>

          <h3>5.2 Licență acordată nouă</h3>
          <p>
            Prin utilizarea Serviciului, ne acorzi o licență limitată, mondială, neexclusivă, pentru
            a găzdui, stoca, procesa și afișa Conținutul tău exclusiv în scopul furnizării și
            îmbunătățirii Serviciului. Licența încetează când ștergi Conținutul sau îți închizi
            contul.
          </p>

          <h3>5.3 Procesarea datelor prin furnizori AI</h3>
          <p>
            Conversațiile și conținutul bazei de cunoștințe pot fi procesate de furnizori
            terți de modele AI (precum OpenAI și Anthropic) pentru a genera răspunsurile.{" "}
            <strong>
              Nu folosim Conținutul tău pentru antrenarea modelelor AI.
            </strong>{" "}
            Vezi <a href="/confidentialitate">Politica de confidențialitate</a> pentru detalii.
          </p>

          <h3>5.4 Acord de prelucrare a datelor (GDPR, DPA)</h3>
          <p>
            Când folosești Serviciul pentru a prelucra date cu caracter personal ale
            utilizatorilor tăi finali, tu acționezi ca operator de date și noi acționăm ca persoană
            împuternicită, în baza articolului 28 din Regulamentul (UE) 2016/679 („GDPR”). Acordul
            nostru standard de prelucrare a datelor („DPA”), inclusiv clauzele contractuale standard
            aprobate de Comisia Europeană pentru transferuri internaționale, este disponibil la
            cerere și face parte integrantă din acești Termeni odată semnat. Pentru a solicita o
            copie, contactează <a href="mailto:salut@convia.ro">salut@convia.ro</a>.
          </p>

          <h2>6. Conținut generat de AI</h2>
          <p>
            Serviciul folosește inteligență artificială pentru a genera răspunsuri în conversații.
            Conținutul generat de AI poate fi ocazional inexact, incomplet sau inadecvat. Ești
            responsabil pentru verificarea și monitorizarea răspunsurilor boților tăi. Nu garantăm
            acuratețea, fiabilitatea sau adecvarea răspunsurilor generate de AI.
          </p>

          <h2>7. Proprietate intelectuală</h2>
          <p>
            Serviciul, inclusiv designul, codul, funcționalitățile, documentația și branding-ul
            său, este protejat de legislația privind drepturile de autor, mărcile și alte drepturi
            de proprietate intelectuală. Nu ai voie să copiezi, modifici sau să creezi opere
            derivate plecând de la Serviciu, decât în limitele permise expres de Termeni. Numele,
            logo-ul și mărcile Convia sunt mărcile noastre.
          </p>

          <h2>8. Servicii terțe</h2>
          <p>
            Serviciul integrează servicii terțe, precum furnizori de modele AI, procesatori de plăți
            (Stripe) și integrări de canale (WhatsApp, Messenger, Instagram etc.). Utilizarea
            acestor integrări este supusă termenilor și politicilor respectivelor terțe părți. Nu
            suntem responsabili pentru disponibilitatea sau performanța serviciilor terțe.
          </p>

          <h2>9. Disponibilitate și suport</h2>
          <p>
            Depunem eforturi rezonabile pentru a menține o disponibilitate ridicată, dar nu
            garantăm accesul neîntrerupt la Serviciu. Putem efectua mentenanță programată cu un
            preaviz rezonabil. Suportul se acordă în funcție de pachetul abonat: prin email pentru
            Gratuit, prioritar pentru Business și Premium, și prin manager de cont dedicat pentru
            Enterprise. Suportul este oferit în limba română.
          </p>

          <h2>10. Limitarea răspunderii</h2>
          <p>
            În măsura maximă permisă de lege, Serviciul este oferit „așa cum este” și „așa cum este
            disponibil”, fără garanții de niciun fel, exprese, implicite sau statutare. Nu vom
            răspunde pentru pierderi indirecte, incidentale, speciale, de consecință sau
            punitive, ori pentru pierderea profitului, datelor sau oportunităților de afaceri ce
            decurg din utilizarea Serviciului.
          </p>
          <p>
            Răspunderea noastră totală agregată în temeiul acestor Termeni nu va depăși suma plătită
            de tine în ultimele douăsprezece (12) luni anterioare reclamației.
          </p>

          <h2>11. Despăgubiri</h2>
          <p>
            Te obligi să ne despăgubești și să ne aperi împotriva oricăror pretenții, pierderi,
            daune, răspunderi sau cheltuieli (inclusiv onorarii rezonabile de avocat) care decurg
            din utilizarea Serviciului, încălcarea acestor Termeni sau încălcarea drepturilor unor
            terți.
          </p>

          <h2>12. Încetare</h2>
          <p>
            Oricare dintre părți poate înceta aceste relații contractuale oricând. Tu poți rezilia
            prin anularea abonamentului și ștergerea contului. Noi putem suspenda sau înceta
            accesul tău dacă încalci Termenii sau cu un preaviz scris de 30 de zile. La încetare,
            dreptul tău de utilizare a Serviciului se stinge, iar Conținutul tău poate fi șters
            după o perioadă de grație de 30 de zile.
          </p>

          <h2>13. Modificări ale Termenilor</h2>
          <p>
            Putem actualiza acești Termeni periodic. Dacă facem modificări substanțiale, te vom
            notifica prin email sau prin Serviciu cu cel puțin 30 de zile înainte de intrarea în
            vigoare. Continuarea utilizării Serviciului după data efectivă reprezintă acceptarea
            Termenilor actualizați.
          </p>

          <h2>14. Lege aplicabilă și jurisdicție</h2>
          <p>
            Acești Termeni sunt guvernați de legea română. Orice dispută în legătură cu Serviciul
            va fi soluționată de instanțele competente din România, fără a aduce atingere
            drepturilor consumatorilor de a sesiza instanța de la domiciliul lor.
          </p>
          <p>
            <strong>Soluționarea online a litigiilor.</strong> Consumatorii din UE pot folosi
            platforma de Soluționare Online a Litigiilor (SOL) a Comisiei Europene de la{" "}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
              ec.europa.eu/consumers/odr
            </a>
            . Consumatorii din România se pot adresa și Autorității Naționale pentru Protecția
            Consumatorilor (ANPC) la{" "}
            <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer">
              anpc.ro
            </a>
            .
          </p>

          <h2>15. Prevederi generale</h2>
          <p>
            Acești Termeni constituie acordul integral dintre tine și Convia cu privire la Serviciu.
            Dacă vreo prevedere este declarată inaplicabilă, restul prevederilor rămân în vigoare.
            Lipsa exercitării unui drept nu reprezintă o renunțare. Nu poți cesiona acești Termeni
            fără acordul nostru scris prealabil.
          </p>

          <h2>16. Contact</h2>
          <p>
            Dacă ai întrebări despre acești Termeni, ne poți scrie la{" "}
            <a href="mailto:salut@convia.ro">salut@convia.ro</a>.
          </p>
          <p>
            <strong>Datele societății:</strong>
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
