import { FileText, Globe, Sheet, Type, Link as LinkIcon, FileBox } from "lucide-react";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

const sources = [
  { icon: Globe, label: "Site web", description: "Citește singur paginile" },
  { icon: FileText, label: "PDF & DOCX", description: "Meniu, broșură, manual" },
  { icon: Sheet, label: "Excel & CSV", description: "Prețuri, stoc, listă" },
  { icon: Type, label: "Text simplu", description: "Scrii direct ce vrei" },
  { icon: LinkIcon, label: "Link-uri externe", description: "Articole, blog, FAQ" },
  { icon: FileBox, label: "Documente Google", description: "Sincronizare automată" },
];

export function KnowledgeBaseSection() {
  return (
    <section aria-labelledby="kb-heading" className="section-y bg-white relative overflow-hidden">
      <div className="container-x">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-label">Bază de cunoștințe</span>
            <h2
              id="kb-heading"
              className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy"
            >
              Învață botul cu propriile<br className="hidden sm:block" /> tale informații.
            </h2>
            <p className="mt-5 text-body-lg text-ink-3">
              Botul răspunde doar pe baza informațiilor pe care i le dai. Nu inventează, nu
              halucinează — știe exact ce vinzi, ce program ai și ce prețuri.
            </p>
          </div>
        </FadeInOnScroll>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: sources grid */}
          <FadeInOnScroll>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sources.map((source) => {
                const Icon = source.icon;
                return (
                  <div
                    key={source.label}
                    className="card card-hover p-5 text-center"
                  >
                    <div className="mx-auto h-10 w-10 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-3">
                      <Icon className="h-4.5 w-4.5 text-accent" />
                    </div>
                    <div className="text-[14px] font-semibold text-ink mb-1">{source.label}</div>
                    <div className="text-[12px] text-muted leading-snug">{source.description}</div>
                  </div>
                );
              })}
            </div>
          </FadeInOnScroll>

          {/* Right: copy + bullets */}
          <FadeInOnScroll delay={100}>
            <div>
              <h3 className="text-h3 font-gilroy text-ink mb-4">
                Răspunsuri pe baza datelor tale, nu invenții.
              </h3>
              <p className="text-body text-ink-3 mb-6 leading-relaxed">
                Convia folosește tehnologie RAG (Retrieval-Augmented Generation) — caută informația
                în documentele tale înainte să răspundă. Așa eviti situațiile când botul „inventează"
                răspunsuri greșite.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    title: "Update automat",
                    description:
                      "Schimbi prețul pe site? Botul învață singur. Nu trebuie să-l reconfigurezi.",
                  },
                  {
                    title: "Citează sursa",
                    description:
                      "Răspunsurile pot include linkul către pagina de unde a luat informația.",
                  },
                  {
                    title: "Limită clară de cunoștințe",
                    description:
                      "Când nu știe, spune „Nu am această informație” — nu inventează.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3.5">
                    <div className="h-7 w-7 rounded-full bg-accent-soft border border-accent-ring/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="h-3.5 w-3.5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold text-ink mb-1">{item.title}</div>
                      <div className="text-[14px] text-ink-3 leading-relaxed">{item.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </section>
  );
}
