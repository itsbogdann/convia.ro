import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Tag } from "lucide-react";
import { Mascot } from "@/components/ui/brand-mark";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";
import {
  blogPosts,
  getOtherPosts,
  SITE_URL,
  type BlogPostMeta,
} from "@/data/blog-posts";

type Props = {
  meta: BlogPostMeta;
  children: React.ReactNode;
};

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function PostLayout({ meta, children }: Props) {
  const related = getOtherPosts(meta.slug).slice(0, 2);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.date,
    author: {
      "@type": "Organization",
      name: meta.author.name,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Convia",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${meta.slug}`,
    },
    articleSection: meta.category,
    inLanguage: "ro",
  };

  return (
    <>
      {/* Header / meta */}
      <section className="pt-16 pb-10 sm:pt-20 sm:pb-12 bg-white">
        <div className="container-x">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-3 hover:text-accent transition-colors mb-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Înapoi la blog
            </Link>

            <FadeInOnScroll>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-soft border border-accent-ring/30 text-[11px] font-bold uppercase tracking-[0.08em] text-accent mb-5">
                <Tag className="h-3 w-3" strokeWidth={2.5} />
                {meta.category}
              </div>
              <h1 className="text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy leading-[1.1]">
                {meta.title}
              </h1>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] font-semibold text-ink-3">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-soft" strokeWidth={2.25} />
                  {dateFormatter.format(new Date(meta.date))}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-soft" strokeWidth={2.25} />
                  {meta.readingMinutes} min de citit
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {meta.author.name}
                </span>
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="pb-20 bg-white">
        <div className="container-x">
          <div className="max-w-3xl mx-auto article-content">{children}</div>
        </div>
      </section>

      {/* In-line Convia CTA */}
      <section className="pb-16 bg-white">
        <div className="container-x">
          <div className="max-w-3xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-white to-accent-soft/40 shadow-card-lg p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-shrink-0">
                <Mascot
                  size={56}
                  bodyColor="#1D4ED8"
                  className="drop-shadow-[0_8px_20px_rgba(29,78,216,0.20)]"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-h4 font-gilroy text-ink leading-tight tracking-tight">
                  Vrei să încerci pe afacerea ta?
                </h2>
                <p className="mt-2 text-[14.5px] text-ink-3 leading-relaxed">
                  Construiești un asistent AI în 5 minute. Primii 30 înscriși primesc 1 an gratuit
                  din pachetul Business.
                </p>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Link href="/#waitlist" className="btn-primary w-full sm:w-auto">
                  Cere acces
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="section-y bg-soft">
          <div className="container-x">
            <div className="max-w-4xl mx-auto">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-soft mb-5">
                Citește mai departe
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="group card card-hover p-7 h-full flex flex-col"
                  >
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent-soft text-accent text-[10.5px] font-bold uppercase tracking-[0.08em] border border-accent-ring/30 w-fit mb-3">
                      {p.category}
                    </div>
                    <h3 className="text-h5 font-gilroy text-ink mb-2 leading-tight tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-[14px] text-ink-3 leading-relaxed mb-5 flex-1">
                      {p.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-accent font-bold text-[14px] group-hover:gap-3 transition-all">
                      Citește
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>

              {blogPosts.length > 3 && (
                <div className="mt-8 text-center">
                  <Link
                    href="/blog"
                    className="btn-secondary"
                  >
                    Toate articolele
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </>
  );
}
