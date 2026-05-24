"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";

const navLinks = [
  { label: "Funcționalități", href: "/#features" },
  { label: "Cum funcționează", href: "/#how" },
  { label: "Use cases", href: "/#use-cases" },
  { label: "Prețuri", href: "/#pricing" },
  { label: "Întrebări", href: "/#faq" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${scrolled ? "header-glass" : "bg-transparent"}`}
    >
      <div className="container-x flex h-16 items-center justify-between">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-16">
          <Link href="/" aria-label="Convia — Pagina principală" className="flex items-center">
            <BrandMark size={36} />
          </Link>
          <nav aria-label="Navigare principală" className="hidden lg:flex items-center gap-5">
            {navLinks.map((link, i) => (
              <div key={link.href} className="flex items-center gap-5">
                {i > 0 && (
                  <span
                    className="h-4 w-px bg-slate-300"
                    aria-hidden="true"
                  />
                )}
                <Link
                  href={link.href}
                  className="text-[16px] font-bold text-ink-2 transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </nav>
        </div>

        {/* Right: phone + sign in + CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="#signin"
            className="hidden md:inline-flex text-[16px] font-bold text-ink hover:text-accent transition-colors"
          >
            Autentificare
          </Link>
          <Link
            href="#waitlist"
            className="btn-primary btn-sm"
          >
            Începe gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-2"
            onClick={() => setOpen(true)}
            aria-label="Deschide meniul"
          >
            <Menu className="h-5 w-5 text-ink" />
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex h-16 items-center justify-between px-5 border-b border-line">
              <BrandMark size={32} />
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-2"
                onClick={() => setOpen(false)}
                aria-label="Închide meniul"
              >
                <X className="h-5 w-5 text-ink" />
              </button>
            </div>
            <nav className="flex-1 px-5 py-6 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg text-[15px] font-semibold text-ink hover:bg-surface-2 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-4 divider" />
              <Link
                href="#signin"
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg text-[15px] font-semibold text-ink-3 hover:bg-surface-2 transition-colors"
              >
                Autentificare
              </Link>
            </nav>
            <div className="p-5 border-t border-line">
              <Link
                href="#waitlist"
                onClick={() => setOpen(false)}
                className="btn-primary w-full"
              >
                Începe gratuit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
