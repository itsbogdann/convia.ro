import type { Metadata } from "next";
import { PostLayout } from "@/components/blog/post-layout";
import { getPostBySlug, SITE_URL } from "@/data/blog-posts";

const meta = getPostBySlug("cum-functioneaza-asistentii-ai")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: `/blog/${meta.slug}` },
  openGraph: {
    type: "article",
    title: `${meta.title} · Convia`,
    description: meta.description,
    url: `${SITE_URL}/blog/${meta.slug}`,
    locale: "ro_RO",
    publishedTime: `${meta.date}T08:00:00.000Z`,
    authors: [meta.author.name],
    tags: ["AI", "LLM", "RAG", "chatbot", "knowledge base"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${meta.title} · Convia`,
    description: meta.description,
  },
  keywords: [
    "cum funcționează chatbot AI",
    "RAG explicat",
    "asistent AI clienți",
    "bază de cunoștințe AI",
    "LLM pentru suport",
  ],
};

export default function Page() {
  return (
    <PostLayout meta={meta}>
      <p className="lead">
        Când oamenii spun „AI”, se gândesc la ChatGPT. ChatGPT e doar o piesă din puzzle. Un
        asistent AI care răspunde clienților tăi combină 3 elemente care lucrează împreună, și
        fiecare are un rol clar.
      </p>

      <p>
        Dacă încă te întrebi <em>ce este, de fapt, un chatbot AI</em>, începe cu articolul{" "}
        <a href="/blog/ce-este-un-chatbot-ai">Ce este un chatbot AI și cum poate ajuta afacerea ta</a>.
        Aici intrăm direct în tehnologie.
      </p>

      <h2>Cele 3 ingrediente</h2>
      <p>
        <strong>1. Modelul de limbă (LLM).</strong> Partea de „ChatGPT”. E un model antrenat pe
        miliarde de cuvinte care a învățat să înțeleagă și să genereze text natural în zeci de
        limbi, inclusiv română. Modele cunoscute: GPT-4o de la OpenAI, Claude de la Anthropic. Toate
        marile produse AI pentru afaceri folosesc unul sau mai multe dintre ele.
      </p>
      <p>
        <strong>2. Baza ta de cunoștințe.</strong> Informațiile despre afacerea ta. Site, PDF-uri
        (meniu, prețuri, condiții), fișiere Excel, text scris direct în dashboard. Asta
        diferențiază botul tău de un asistent generic care vorbește frumos dar nu știe nimic
        concret despre tine.
      </p>
      <p>
        <strong>3. Sistemul de retrieval (RAG).</strong> Partea care leagă cele două. Numele tehnic
        e <em>retrieval-augmented generation</em>. Când un client întreabă ceva, sistemul caută în
        baza ta de cunoștințe informațiile relevante, le pune în fața modelului de limbă, iar
        acesta generează răspunsul folosind doar acele informații.
      </p>

      <h2>O metaforă simplă</h2>
      <p>
        Imaginează un coleg nou care lucrează pentru tine. Vorbește perfect româna, e politicos,
        răspunde calm. Dar nu știe absolut nimic despre afacerea ta în prima zi.
      </p>
      <p>
        Lângă el e un dulap cu toate informațiile relevante: meniu, prețuri, condiții de rezervare,
        program, FAQ-uri vechi. Când vine o întrebare de la un client, colegul deschide dulapul,
        găsește informația potrivită, citește, și răspunde corect.
      </p>
      <p>
        RAG e procesul prin care colegul „cere informația din dulap” și o folosește. Fără dulap, ai
        avea un coleg care vorbește frumos dar inventează tot ce zice.
      </p>

      <h2>Limita LLM-urilor pure</h2>
      <p>Modelele de limbă singure (LLM fără RAG) au două probleme practice:</p>
      <ul>
        <li>
          Nu cunosc informații specifice despre afacerea ta. Nu îți știu meniul, prețurile,
          programul, condițiile actuale.
        </li>
        <li>
          Au tendința să inventeze (în jargon: <em>halucinează</em>) când nu știu ceva. Și pot face
          asta cu un ton convingător, ceea ce e periculos.
        </li>
      </ul>
      <p>RAG rezolvă ambele. Cum?</p>
      <ol>
        <li>Clientul scrie întrebarea. Exemplu: „Aveți rezervări sâmbătă seara?”.</li>
        <li>
          Sistemul caută în baza ta de cunoștințe chunk-urile relevante. Găsește, să zicem, program
          de funcționare, condiții pentru rezervare, capacitatea maximă pe seri de weekend.
        </li>
        <li>Aceste informații sunt date modelului LLM ca context.</li>
        <li>
          Modelul generează răspuns folosind <strong>doar</strong> acele informații. Nu inventează
          ce nu i s-a dat.
        </li>
      </ol>
      <p>
        Conform{" "}
        <a
          href="https://www.ibm.com/think/topics/retrieval-augmented-generation"
          target="_blank"
          rel="noopener noreferrer"
        >
          IBM
        </a>
        , asta reduce dramatic halucinațiile și permite citarea sursei pentru fiecare răspuns.{" "}
        <a
          href="https://www.mckinsey.com/featured-insights/mckinsey-explainers/what-is-retrieval-augmented-generation-rag"
          target="_blank"
          rel="noopener noreferrer"
        >
          McKinsey
        </a>{" "}
        explică același principiu: RAG-ul „înrădăcinează” răspunsurile în informația ta concretă,
        nu în memoria generală a modelului.
      </p>

      <h2>Cum se construiește baza de cunoștințe</h2>
      <p>Un asistent AI învață de la tine în trei pași tehnici:</p>
      <ol>
        <li>
          <strong>Indexare</strong>. Tu dai surse (link la site, PDF-uri, Excel, text scris direct).
          Sistemul citește, împarte conținutul în chunk-uri logice (paragrafe, secțiuni), și le
          stochează într-o bază specială numită <em>vector store</em>.
        </li>
        <li>
          <strong>Embedding</strong>. Fiecare chunk e convertit într-un vector matematic care
          reprezintă „sensul” textului. Asta permite căutarea bazată pe sens: dacă întrebi „cât
          plătesc pentru livrare?”, sistemul găsește chunk-uri despre „costuri de transport”, chiar
          dacă nu folosesc cuvântul „livrare”.
        </li>
        <li>
          <strong>Retrieval la rulare</strong>. Când vine o întrebare reală, sistemul caută
          chunk-urile cele mai apropiate de întrebare ca sens, și le dă modelului LLM ca context
          pentru răspuns.
        </li>
      </ol>
      <p>
        Tehnic, există mai mult de atât (reranking, query rewriting, hybrid search). Dar acelea
        sunt ideile principale și e suficient să le înțelegi la nivel conceptual.
      </p>

      <h2>Ce poate face, ce încă nu poate</h2>
      <p>
        Lucruri pe care un asistent AI modern le face bine:
      </p>
      <ul>
        <li>Răspunde la întrebări care se repetă, cu informații exacte din sursele tale</li>
        <li>Înțelege întrebări scrise prost gramatical, cu prescurtări, în argou („pls”, „k”, „mersi”)</li>
        <li>Lucrează în mai multe limbi simultan (română prioritar, engleză sau alte la nevoie)</li>
        <li>Răspunde sub 3 secunde, 24/7, fără pauză de masă</li>
        <li>Recunoaște când nu știe și transferă conversația la un coleg uman cu tot contextul</li>
      </ul>
      <p>Lucruri pe care încă nu le face suficient de bine:</p>
      <ul>
        <li>Întrebări care necesită raționament complex pe mai mulți pași (cazuri excepționale)</li>
        <li>Decizii cu consecințe importante (rambursări mari, contracte personalizate, dispute)</li>
        <li>Empatie reală în situații emoționale grele (deces, divorț, criză)</li>
        <li>Integrări cu sisteme externe foarte vechi sau personalizate (ERP-uri custom)</li>
      </ul>
      <p>
        Limitele astea se reduc lună de lună. Modele noi apar la fiecare 3-6 luni cu îmbunătățiri
        vizibile. Dar nu sunt zero încă, și e cinstit să știi asta înainte să cumperi.
      </p>

      <h2>Cum recunoști un asistent AI bun</h2>
      <p>Întrebări utile când evaluezi un produs:</p>
      <ul>
        <li>
          Cum „învață” botul din informațiile mele? (Cuvinte-cheie de auzit: bază de cunoștințe,
          knowledge base, RAG, vector store)
        </li>
        <li>Cât durează indexarea unui site sau PDF? (Sub 5 minute pentru documente normale)</li>
        <li>Botul citează sursele când răspunde? (Răspuns ideal: da)</li>
        <li>Ce se întâmplă dacă nu știe răspunsul? (Răspuns ideal: transferă cu context la om)</li>
        <li>
          Informațiile mele sunt folosite să antreneze modelul lor sau al furnizorilor AI? (Răspuns
          dorit: nu, niciodată)
        </li>
      </ul>
      <p>
        Dacă nu primești răspunsuri clare la întrebările astea, mai întreabă. Sau caută alt
        furnizor. Pentru un argument concret de business,{" "}
        <a href="/blog/5-motive-sa-automatizezi-conversatiile">5 motive să automatizezi
        conversațiile cu clienții</a> are cifrele din 2025-2026.
      </p>

      <h2>Convia, pe scurt</h2>
      <p>
        Convia folosește exact arhitectura descrisă mai sus: modele AI premium de la OpenAI și
        Anthropic, bază de cunoștințe indexată din sursele tale, retrieval RAG la fiecare răspuns.
        Datele tale nu antrenează niciun model, nici al nostru, nici al furnizorilor AI cu care
        lucrăm. Indexarea unui site mediu durează 2-3 minute. Vezi detaliile complete pe pagina{" "}
        <a href="/gdpr">GDPR</a> sau cum integrezi widget-ul pe site-ul tău în{" "}
        <a href="/docs">documentația tehnică</a>.
      </p>

      <h2>Surse</h2>
      <ul>
        <li>
          <a
            href="https://www.ibm.com/think/topics/retrieval-augmented-generation"
            target="_blank"
            rel="noopener noreferrer"
          >
            IBM Think, What is RAG (Retrieval-Augmented Generation)?
          </a>
        </li>
        <li>
          <a
            href="https://www.mckinsey.com/featured-insights/mckinsey-explainers/what-is-retrieval-augmented-generation-rag"
            target="_blank"
            rel="noopener noreferrer"
          >
            McKinsey Explainers, What is retrieval-augmented generation (RAG)?
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
      </ul>
    </PostLayout>
  );
}
