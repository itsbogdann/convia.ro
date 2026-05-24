import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de cookie-uri",
  description:
    "Cum folosește Convia cookie-urile și tehnologiile similare pe site, în dashboard și în widgetul de chat. Cookie-uri esențiale, funcționale și de analiză.",
  alternates: { canonical: "/cookies" },
  openGraph: {
    type: "website",
    title: "Politica de cookie-uri · Convia",
    description:
      "Cum folosește Convia cookie-urile și tehnologiile similare pe site, dashboard și widgetul de chat.",
    url: "/cookies",
  },
};

export default function CookiesPage() {
  return (
    <div className="section-y bg-white">
      <div className="container-x">
        <div className="mx-auto max-w-3xl legal-content">
          <p className="legal-meta">Ultima actualizare: 24 mai 2026</p>
          <h1>Politica de cookie-uri</h1>

          <p>
            Această Politică explică modul în care Convia („noi”, „nouă”, „nostru”) folosește
            cookie-urile și tehnologiile similare de urmărire pe site-ul nostru (convia.ro), în
            aplicația de tip dashboard și în widgetul de chat integrabil (denumite colectiv
            „Serviciul”). Convia este operată de <strong>NORTEC BLANC S.R.L.</strong>, cu sediul în
            Sat Ciofrângeni, Comuna Ciofrângeni, Nr. 257 bis, corp C16, Județ Argeș, România, CUI
            41773828.
          </p>

          <h2>1. Ce sunt cookie-urile</h2>
          <p>
            Cookie-urile sunt fișiere text mici stocate pe dispozitivul tău atunci când vizitezi un
            site web. Sunt folosite pe scară largă pentru ca site-urile să funcționeze corect, să
            îmbunătățească experiența utilizatorului și să ofere informații proprietarilor site-ului.
            Tehnologiile similare includ <code>localStorage</code>, <code>sessionStorage</code> și
            pixeli de urmărire.
          </p>

          <h2>2. Cookie-urile pe care le folosim</h2>

          <h3>2.1 Cookie-uri esențiale</h3>
          <p>
            Aceste cookie-uri sunt strict necesare pentru funcționarea Serviciului. Nu pot fi
            dezactivate fără a afecta funcționalitățile de bază.
          </p>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Scop</th>
                <th>Durată</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>sb-access-token</code>
                </td>
                <td>Token de sesiune pentru autentificare</td>
                <td>Sesiune</td>
              </tr>
              <tr>
                <td>
                  <code>sb-refresh-token</code>
                </td>
                <td>Reîmprospătare token pentru login persistent</td>
                <td>30 de zile</td>
              </tr>
              <tr>
                <td>
                  <code>convia_session_id</code>
                </td>
                <td>Identifică sesiunea în widgetul de chat</td>
                <td>Sesiune</td>
              </tr>
              <tr>
                <td>
                  <code>convia_conversation_id</code>
                </td>
                <td>Continuă conversația activă în widget</td>
                <td>Sesiune</td>
              </tr>
            </tbody>
          </table>

          <h3>2.2 Cookie-uri funcționale</h3>
          <p>Aceste cookie-uri îți rețin preferințele pentru o experiență mai bună.</p>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Scop</th>
                <th>Durată</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>sidebar_collapsed</code>
                </td>
                <td>Reține starea sidebar-ului în dashboard</td>
                <td>1 an</td>
              </tr>
              <tr>
                <td>
                  <code>cookie_consent</code>
                </td>
                <td>Stochează alegerea ta privind cookie-urile</td>
                <td>1 an</td>
              </tr>
            </tbody>
          </table>

          <h3>2.3 Cookie-uri de analiză</h3>
          <p>
            Aceste cookie-uri ne ajută să înțelegem cum interacționează vizitatorii cu Serviciul, ca
            să-l putem îmbunătăți. Sunt activate doar după ce îți exprimi acordul prin bannerul de
            cookie-uri.
          </p>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Scop</th>
                <th>Durată</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>_ga</code>, <code>_ga_*</code>
                </td>
                <td>Google Analytics — statistici agregate de utilizare</td>
                <td>până la 2 ani</td>
              </tr>
            </tbody>
          </table>

          <h2>3. Cookie-uri în widgetul de chat</h2>
          <p>
            Widgetul Convia, atunci când este integrat pe site-uri terțe, folosește următoarele
            valori stocate în <code>localStorage</code>-ul browserului pentru a menține starea
            conversației:
          </p>
          <ul>
            <li>
              <code>convia_session_id</code> — Identifică sesiunea vizitatorului
            </li>
            <li>
              <code>convia_conversation_id</code> — Asociază sesiunea cu conversația activă
            </li>
          </ul>
          <p>
            Acestea sunt stocate în <code>localStorage</code> (nu ca cookie-uri tradiționale) și
            sunt limitate la domeniul unde este integrat widgetul. Nu urmăresc utilizatorii între
            site-uri diferite.
          </p>

          <h2>4. Cookie-uri terțe</h2>
          <p>
            Anumite servicii integrate cu platforma pot seta propriile cookie-uri:
          </p>
          <ul>
            <li>
              <strong>Stripe</strong> — Cookie-uri pentru detectarea fraudelor și procesarea
              plăților
            </li>
            <li>
              <strong>Google Analytics</strong> — Statistici agregate de utilizare a site-ului
            </li>
          </ul>
          <p>
            Aceste cookie-uri sunt guvernate de politicile de confidențialitate ale respectivelor
            terțe părți.
          </p>

          <h2>5. Consimțământul pentru cookie-uri</h2>
          <p>
            La prima vizită pe site, va apărea un banner de consimțământ pentru cookie-uri.
            Cookie-urile de analiză sunt activate doar dacă apeși „Accept toate”. Îți poți schimba
            preferința oricând, prin ștergerea datelor stocate de site în browserul tău și
            reîncărcarea paginii sau prin accesarea setărilor din banner.
          </p>

          <h2>6. Gestionarea cookie-urilor din browser</h2>
          <p>Poți controla cookie-urile și din setările browserului tău:</p>
          <ul>
            <li>
              <strong>Chrome:</strong> Setări → Confidențialitate și securitate → Cookie-uri
            </li>
            <li>
              <strong>Firefox:</strong> Setări → Confidențialitate și securitate → Cookie-uri
            </li>
            <li>
              <strong>Safari:</strong> Preferințe → Confidențialitate → Cookie-uri
            </li>
            <li>
              <strong>Edge:</strong> Setări → Cookie-uri și permisiuni site
            </li>
          </ul>
          <p>
            Reține că dezactivarea cookie-urilor esențiale va împiedica funcționarea corectă a
            Serviciului. Nu vei putea face login sau folosi dashboard-ul dacă cookie-urile de
            autentificare sunt blocate.
          </p>

          <h2>7. Semnale „Do Not Track”</h2>
          <p>
            Unele browsere trimit un semnal „Do Not Track” (DNT). Nu există în prezent un standard
            industrial despre cum ar trebui să răspundă site-urile la semnalele DNT. Momentan nu
            modificăm practicile noastre de colectare a datelor în funcție de aceste semnale.
          </p>

          <h2>8. Modificări ale acestei politici</h2>
          <p>
            Putem actualiza această Politică de cookie-uri pentru a reflecta schimbări în practicile
            noastre sau în reglementările aplicabile. Modificările substanțiale vor fi comunicate
            prin Serviciu sau prin email.
          </p>

          <h2>9. Contact</h2>
          <p>
            Pentru orice întrebare despre utilizarea cookie-urilor, scrie-ne la{" "}
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
            CUI: 41773828 · Cod TVA UE: RO41773828
            <br />
            Email: <a href="mailto:salut@convia.ro">salut@convia.ro</a>
          </p>
        </div>
      </div>
    </div>
  );
}
