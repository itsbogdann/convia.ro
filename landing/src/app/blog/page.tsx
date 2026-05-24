import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Mail, Bell } from "lucide-react";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";
import { blogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articole despre AI, automatizarea suportului și e-commerce în România. Scrise pentru antreprenori, cu date reale din 2025-2026.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Blog · Convia",
    description:
      "Articole despre AI, automatizarea suportului și e-commerce în România. Scrise pentru antreprenori.",
    url: "/blog",
    locale: "ro_RO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog · Convia",
    description: "Articole despre AI și automatizarea suportului pentru afaceri din România.",
  },
  keywords: [
    "blog AI România",
    "chatbot AI",
    "automatizare suport clienți",
    "RAG",
    "asistenți AI pentru afaceri",
  ],
};

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <>
      {/* Hero */}
      <section className="section-y bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-2xl mx-auto">
              <span className="section-label">Blog</span>
              <h1 className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy">
                AI pentru afaceri din România, explicat onest.
              </h1>
              <p className="mt-5 text-body-lg text-ink-3">
                Ghiduri practice, date reale și articole scrise în limba română. Pentru
                antreprenori care vor să înțeleagă tehnologia înainte să o folosească.
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Featured post */}
      <section className="pb-10 bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <Link
              href={`/blog/${featured.slug}`}
              className="group block max-w-5xl mx-auto card card-hover p-8 sm:p-10 lg:p-12 relative overflow-hidden"
            >
              <div
                className="absolute -top-20 -right-20 w-72 h-72 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(29,78,216,0.12) 0%, transparent 70%)",
                  filter: "blur(40px)",
                }}
                aria-hidden="true"
              />
              <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent text-white text-[10.5px] font-bold uppercase tracking-[0.08em]">
                      Recomandat
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-soft">
                      {featured.category}
                    </span>
                  </div>
                  <h2 className="text-h3 sm:text-h2-mobile lg:text-h2 font-gilroy text-ink leading-tight tracking-tight mb-3">
                    {featured.title}
                  </h2>
                  <p className="text-[15.5px] text-ink-3 leading-relaxed mb-5 max-w-xl">
                    {featured.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] font-semibold text-soft">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.25} />
                      {dateFormatter.format(new Date(featured.date))}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2.25} />
                      {featured.readingMinutes} min de citit
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-2 text-accent font-bold group-hover:gap-3 transition-all">
                    Citește articolul
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Other posts grid */}
      {rest.length > 0 && (
        <section className="pb-20 bg-white">
          <div className="container-x">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
              {rest.map((post, i) => (
                <FadeInOnScroll key={post.slug} delay={i * 80}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group card card-hover p-7 h-full flex flex-col"
                  >
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent-soft text-accent text-[10.5px] font-bold uppercase tracking-[0.08em] border border-accent-ring/30 w-fit mb-3">
                      {post.category}
                    </div>
                    <h3 className="text-h5 font-gilroy text-ink mb-2 leading-tight tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-[14px] text-ink-3 leading-relaxed mb-5 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[12px] font-semibold text-soft">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" strokeWidth={2.25} />
                          {post.readingMinutes} min
                        </span>
                        <span>{dateFormatter.format(new Date(post.date))}</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-accent font-bold text-[13px] group-hover:gap-2.5 transition-all">
                        Citește
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </FadeInOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="section-y bg-soft">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="mx-auto max-w-2xl card p-8 sm:p-10 text-center">
              <div className="flex justify-center mb-5">
                <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(29,78,216,0.4)]">
                  <Bell className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="text-h4 font-gilroy text-ink mb-3">
                Primește articolele noi pe email
              </h2>
              <p className="text-[14.5px] text-ink-3 leading-relaxed mb-6 max-w-md mx-auto">
                Publicăm aproximativ 2 articole pe lună despre AI și automatizarea suportului. Te
                dezabonezi cu un click.
              </p>
              <form
                action="mailto:salut@convia.ro"
                method="post"
                encType="text/plain"
                className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto"
              >
                <label htmlFor="blog-email" className="sr-only">
                  Adresa ta de email
                </label>
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soft" />
                  <input
                    id="blog-email"
                    type="email"
                    name="email"
                    placeholder="nume@firma.ro"
                    required
                    className="w-full h-12 pl-11 pr-4 rounded-full border border-line-strong bg-white text-[14.5px] font-semibold text-ink placeholder:text-soft focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Abonează-mă
                </button>
              </form>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
