import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";
import { blogPosts } from "@/data/blog-posts";

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function RecentArticlesSection() {
  const recent = blogPosts.slice(0, 3);

  return (
    <section
      aria-labelledby="recent-articles-heading"
      className="section-y bg-soft"
    >
      <div className="container-x">
        <FadeInOnScroll>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 max-w-5xl mx-auto">
            <div className="max-w-xl">
              <span className="section-label">Din blog</span>
              <h2
                id="recent-articles-heading"
                className="mt-5 text-h2-mobile sm:text-h2 gradient-ink font-gilroy"
              >
                Învață mai multe despre AI și automatizare.
              </h2>
            </div>
            <Link
              href="/blog"
              className="btn-secondary self-start sm:self-end flex-shrink-0"
            >
              Toate articolele
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeInOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {recent.map((post, i) => (
            <FadeInOnScroll key={post.slug} delay={i * 80}>
              <Link
                href={`/blog/${post.slug}`}
                className="group card card-hover p-6 h-full flex flex-col bg-white"
              >
                <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent-soft text-accent text-[10.5px] font-bold uppercase tracking-[0.08em] border border-accent-ring/30 w-fit mb-4">
                  {post.category}
                </div>
                <h3 className="text-[18px] font-bold font-gilroy text-ink mb-2.5 leading-tight tracking-tight">
                  {post.title}
                </h3>
                <p className="text-[13.5px] text-ink-3 leading-relaxed mb-5 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-line">
                  <div className="flex items-center gap-3 text-[11.5px] font-semibold text-soft">
                    <span>{dateFormatter.format(new Date(post.date))}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={2.25} />
                      {post.readingMinutes} min
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-accent font-bold text-[12.5px] group-hover:gap-2.5 transition-all">
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
  );
}
