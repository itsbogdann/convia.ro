import type { Metadata } from "next";
import { PostLayout } from "@/components/blog/post-layout";
import { getPostBySlug, SITE_URL } from "@/data/blog-posts";

const meta = getPostBySlug("ce-este-un-chatbot-ai")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: `/blog/${meta.slug}` },
  openGraph: {
    type: "article",
    title: `Convia | ${meta.title}`,
    description: meta.description,
    url: `${SITE_URL}/blog/${meta.slug}`,
    locale: "ro_RO",
    publishedTime: `${meta.date}T08:00:00.000Z`,
    authors: [meta.author.name],
    tags: ["chatbot AI", "AI pentru afaceri", "automatizare suport", "România"],
  },
  twitter: {
    card: "summary_large_image",
    title: `Convia | ${meta.title}`,
    description: meta.description,
  },
  keywords: [
    "ce este chatbot AI",
    "chatbot AI România",
    "asistent AI pentru afaceri",
    "AI pentru IMM",
    "automatizare suport clienți",
  ],
};

export default function Page() {
  return (
    <PostLayout meta={meta}>
      <p className="lead">
        E 22:30 într-o vineri. Un client îți scrie pe site: „Aveți cameră liberă pentru weekend?”.
        Tu dormi. Concurența ta a răspuns la 22:31. Rezervarea a plecat acolo.
      </p>

      <p>
        Asta e diferența pe care o face un chatbot AI bine configurat. Și se vede deja în datele din
        2025-2026.
      </p>

      <h2>Ce este, de fapt, un chatbot AI</h2>
      <p>
        Un chatbot AI e un program care răspunde clienților tăi în text, în limba lor naturală.
        Diferența față de bara de FAQ pe care o știi deja (butoane gen „Sună-ne”, „Vezi produsele”,
        „Adresa”) e simplă: AI-ul înțelege ce întreabă omul, chiar dacă întrebarea e scrisă altfel
        decât a anticipat cineva.
      </p>
      <p>
        Exemplu concret. Un client îți scrie pe site: „Salut, e libera duminică seară la 20 pentru
        4 persoane?”. Un chatbot vechi cu butoane se blochează pentru că întrebarea nu e una
        predefinită. Un chatbot AI înțelege contextul (rezervare, ora, ziua, numărul de persoane),
        verifică disponibilitatea în sistemul tău și răspunde cu o ofertă concretă. În 2-3 secunde.
      </p>

      <h2>De ce contează acum în România</h2>
      <p>
        Anul trecut,{" "}
        <strong>
          74,3% dintre românii cu vârste între 16 și 74 de ani au cumpărat ceva online
        </strong>
        , conform datelor publicate de INS și raportate de{" "}
        <a
          href="https://bucharestdailynews.com/romania-ecommerce-growth-2025-ins-data/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Bucharest Daily News
        </a>
        . La grupa de vârstă 16-34, procentul urcă la 86,4%. Piața de e-commerce românească a
        depășit 12,8 miliarde de euro în 2025.
      </p>
      <p>
        Și încă o cifră importantă: 73,85% dintre tranzacțiile online se fac de pe telefon, conform{" "}
        <a
          href="https://www.mordorintelligence.com/industry-reports/romania-ecommerce-market"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mordor Intelligence
        </a>
        . Asta înseamnă că un client real te scrie din mers, dintr-un magazin, la 22:30 dintr-un
        Uber. Nu o să sune.
      </p>

      <h2>Cum diferă de bot-ul vechi cu butoane</h2>
      <p>Un chatbot vechi:</p>
      <ul>
        <li>Are 10-20 de butoane prestabilite</li>
        <li>Răspunde doar la întrebări exacte</li>
        <li>Se blochează când utilizatorul scrie altfel decât „scenariul”</li>
        <li>Necesită un programator pentru orice modificare</li>
      </ul>
      <p>Un chatbot AI:</p>
      <ul>
        <li>Înțelege limbaj natural în română (diacritice, prescurtări, regionalisme)</li>
        <li>Învață din informațiile tale (site, PDF, Excel, text scris direct)</li>
        <li>Adaptează răspunsul la context (ora, istoricul conversației, tipul de client)</li>
        <li>
          Recunoaște când nu știe ceva și transferă conversația la un coleg uman, păstrând contextul
        </li>
      </ul>
      <p>
        Diferența în practică: cu bot-ul vechi, peste jumătate din conversații se închideau cu „nu
        am înțeles”. Cu un asistent AI bine configurat, peste 80% din întrebări primesc răspunsuri
        corecte la prima încercare.
      </p>

      <h2>Ce face un chatbot AI în 2026</h2>
      <p>
        Câteva lucruri reale pe care le rezolvă pentru o afacere de tip IMM (vezi și{" "}
        <a href="/#features">lista completă de funcționalități</a> pe care le oferim noi):
      </p>
      <ul>
        <li>Răspunde la întrebări despre program, prețuri, disponibilitate, livrare, retur</li>
        <li>Preia rezervări pentru hoteluri, restaurante, saloane, cu confirmare automată</li>
        <li>Recomandă produse pe baza nevoilor specifice ale clientului</li>
        <li>Urmărește statusul comenzilor în timp real, cu numere de tracking</li>
        <li>Trimite reminders cu o oră înainte de programare</li>
        <li>Calculează prețuri și oferă cotații pe baza criteriilor introduse</li>
        <li>Transferă conversațiile complicate către un om, cu tot contextul intact</li>
      </ul>
      <p>
        Lista nu e completă. Dar îți dă o idee clară despre ce face efectiv în practică.
      </p>

      <h2>Cine îl folosește deja</h2>
      <p>
        Datele globale arată că{" "}
        <strong>75% dintre IMM-uri experimentează deja cu chatboți AI</strong>, conform unei
        sinteze publicate de{" "}
        <a
          href="https://www.fullview.io/blog/ai-chatbot-statistics"
          target="_blank"
          rel="noopener noreferrer"
        >
          Fullview
        </a>{" "}
        în 2026. Pentru comparație, doar 42% dintre companiile mari folosesc activ aceste soluții.
        Ironic: micii antreprenori se mișcă mai repede.
      </p>
      <p>
        Motivul e simplu. Pentru un IMM cu 1-3 oameni pe suport, AI-ul reduce sarcinile repetitive
        cu până la 90%, conform datelor IBM. Pentru o corporație cu 200 de agenți, schimbarea
        fluxurilor existente costă mai mult decât beneficiul pe termen scurt.
      </p>

      <h2>Cifrele care contează pentru afacerea ta</h2>
      <p>
        IBM a raportat că AI-ul scade costurile operaționale de customer service cu{" "}
        <strong>30-50%</strong> pentru firmele care îl adoptă serios. Companiile care folosesc AI
        în interacțiunile cu clienții au observat o creștere medie de 22,3% la scorurile de
        satisfacție (CSAT), conform datelor sintetizate de{" "}
        <a
          href="https://www.getnextphone.com/blog/ai-customer-service-statistics"
          target="_blank"
          rel="noopener noreferrer"
        >
          GetNextPhone
        </a>
        .
      </p>
      <p>
        Și încă o cifră concretă: timpul mediu de răspuns al unui chatbot AI modern e sub 3
        secunde. Pentru comparație, timpul mediu de răspuns la un email de la suport e ~12 ore în
        2025, conform unei sinteze de la{" "}
        <a
          href="https://livechatai.com/blog/customer-support-response-time-statistics"
          target="_blank"
          rel="noopener noreferrer"
        >
          LiveChatAI
        </a>
        .
      </p>

      <h2>Când are sens (și când nu)</h2>
      <p>Un chatbot AI funcționează bine dacă:</p>
      <ul>
        <li>Primești zilnic întrebări care se repetă (program, prețuri, disponibilitate)</li>
        <li>
          Ai informații concrete (site, PDF-uri, prețuri în Excel) pe care le poți pune la
          dispoziția AI-ului
        </li>
        <li>Clienții tăi sunt activi în afara orelor de program</li>
        <li>Vrei să eliberezi echipa pentru cazuri complicate cu emoție sau decizii sensibile</li>
      </ul>
      <p>Nu are sens (încă) dacă:</p>
      <ul>
        <li>Suportul tău e 100% emoțional, medical sau juridic complex (consult, terapie, diagnostic)</li>
        <li>Răspunsurile depind de informații pe care nu le poți documenta nicăieri</li>
        <li>Volumul tău e atât de mic încât tu sau un coleg dați răspuns în 30 de secunde oricum</li>
        <li>Clienții tăi sunt persoane care preferă insistent telefonul sau întâlnirea directă</li>
      </ul>

      <h2>Cum începi</h2>
      <p>
        Cel mai simplu mod e să încerci un produs gândit pentru piața românească. Convia indexează
        site-ul tău (sau orice PDF, Excel, text) și răspunde clienților 24/7 pe site sau pe
        WhatsApp Business. Setup în 5 minute, plan gratuit pentru 100 de conversații pe lună,
        fără card. Detalii pe pagina de <a href="/#pricing">prețuri</a>.
      </p>
      <p>
        Dacă vrei să înțelegi tehnic ce e în spatele unui chatbot AI (LLM, bază de cunoștințe, RAG),
        continuă cu articolul{" "}
        <a href="/blog/cum-functioneaza-asistentii-ai">Cum funcționează asistenții AI pentru
        clienți</a>. Iar dacă vrei argumentele concrete pentru a decide,{" "}
        <a href="/blog/5-motive-sa-automatizezi-conversatiile">5 motive să automatizezi
        conversațiile cu clienții</a> are cifrele.
      </p>

      <h2>Surse</h2>
      <ul>
        <li>
          <a
            href="https://bucharestdailynews.com/romania-ecommerce-growth-2025-ins-data/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bucharest Daily News, INS data 2025 (e-commerce România)
          </a>
        </li>
        <li>
          <a
            href="https://www.mordorintelligence.com/industry-reports/romania-ecommerce-market"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mordor Intelligence, Romania E-commerce Market 2025
          </a>
        </li>
        <li>
          <a
            href="https://www.fullview.io/blog/ai-chatbot-statistics"
            target="_blank"
            rel="noopener noreferrer"
          >
            Fullview, 100+ AI Chatbot Statistics and Trends (2026)
          </a>
        </li>
        <li>
          <a
            href="https://www.getnextphone.com/blog/ai-customer-service-statistics"
            target="_blank"
            rel="noopener noreferrer"
          >
            GetNextPhone, 75 AI Customer Service Statistics 2026
          </a>
        </li>
        <li>
          <a
            href="https://livechatai.com/blog/customer-support-response-time-statistics"
            target="_blank"
            rel="noopener noreferrer"
          >
            LiveChatAI, Customer Support Response Time Statistics
          </a>
        </li>
      </ul>
    </PostLayout>
  );
}
