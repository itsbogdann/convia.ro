import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";

const productLinks = [
  { label: "Funcționalități", href: "/#features" },
  { label: "Cum funcționează", href: "/#how" },
  { label: "Use cases", href: "/#use-cases" },
  { label: "Prețuri", href: "/#pricing" },
  { label: "Întrebări", href: "/#faq" },
];

const companyLinks = [
  { label: "Despre noi", href: "/despre-noi" },
  { label: "Contact", href: "/contact" },
  { label: "Cariere", href: "/cariere" },
  { label: "Blog", href: "/blog" },
];

const resourceLinks = [
  { label: "Centru de ajutor", href: "/ajutor" },
  { label: "Documentație", href: "/docs" },
  { label: "Status", href: "/status" },
  { label: "Schimbări", href: "/schimbari" },
];

const legalLinks = [
  { label: "Termeni și condiții", href: "/termeni" },
  { label: "Politica de confidențialitate", href: "/confidentialitate" },
  { label: "Cookies", href: "/cookies" },
  { label: "GDPR", href: "/gdpr" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-soft">
      <div className="container-x py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <BrandMark size={32} />
            <p className="mt-4 text-[14px] leading-6 text-ink-3 max-w-xs">
              Primul chatbot AI gândit pentru afaceri din România. Răspunde clienților tăi 24/7,
              pe site sau pe WhatsApp.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11.5px] font-semibold text-ink-2">
                <span className="text-base leading-none">🇷🇴</span>
                100% Dezvoltat în România
              </span>
            </div>
          </div>
          <FooterColumn title="Produs" links={productLinks} />
          <FooterColumn title="Companie" links={companyLinks} />
          <FooterColumn title="Resurse" links={resourceLinks} />
        </div>

        <div className="mt-14 divider" />

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-[13px] text-muted">
            © {year} Convia. Toate drepturile rezervate.
          </div>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[13px] text-ink-3 hover:text-ink transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[14px] text-ink-2 hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
