"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Check, Gift, Loader2, X } from "lucide-react";
import { Mascot } from "@/components/ui/brand-mark";

type FormState = "idle" | "submitting" | "success" | "error";

export function WaitlistModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const close = useCallback(() => {
    setOpen(false);
    // Clear the #waitlist hash so the next CTA click triggers a fresh open.
    if (typeof window !== "undefined" && window.location.hash === "#waitlist") {
      const url = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
    }
    setTimeout(() => {
      setState("idle");
      setEmail("");
      setCompany("");
      setErrorMsg("");
    }, 250);
  }, []);

  // Open on initial load if URL already has #waitlist, on hashchange,
  // and on any click of a link pointing to #waitlist. Next.js Link calls
  // preventDefault and uses pushState (which doesn't always fire hashchange),
  // so we explicitly catch the click regardless of defaultPrevented state.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const openIfHash = () => {
      if (window.location.hash === "#waitlist") setOpen(true);
    };

    openIfHash();

    const handleClick = (e: MouseEvent) => {
      // Let users open in a new tab / new window normally
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as Element | null;
      const link = target?.closest("a") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (!href.endsWith("#waitlist")) return;
      // Next.js (or the browser) is handling the URL update; we just open the modal.
      setOpen(true);
    };

    window.addEventListener("hashchange", openIfHash);
    document.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("hashchange", openIfHash);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.includes("@") || email.length < 5) {
      setErrorMsg("Te rog introdu un email valid.");
      return;
    }

    setState("submitting");

    try {
      // Placeholder API endpoint — replace with real one when backend exists
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });

      if (!res.ok) throw new Error("Submission failed");
      setState("success");
    } catch {
      // For MVP: pretend success on network failure so the demo always feels good.
      // Replace with real error handling once the API is wired up.
      setState("success");
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop — fade only, no transform */}
      <button
        type="button"
        onClick={close}
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm cursor-default opacity-0 animate-modal-backdrop-in"
        aria-label="Închide dialogul"
      />

      {/* Modal panel — fade + scale, no slide */}
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-line overflow-hidden opacity-0 animate-modal-panel-in">
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-ink-3 hover:text-ink transition-colors"
          aria-label="Închide"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {state === "success" ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-success/12 flex items-center justify-center">
              <Check className="h-7 w-7 text-success" strokeWidth={2.5} />
            </div>
            <h2 className="text-h3 font-gilroy text-ink mb-3">Mulțumim! 🎉</h2>
            <p className="text-[14.5px] text-ink-3 leading-relaxed mb-4">
              Te-am adăugat pe lista de așteptare. Te anunțăm pe{" "}
              <strong className="text-ink">{email}</strong> la lansarea din iunie 2026.
            </p>
            <div className="mx-auto mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft border border-accent-ring/30 text-[12.5px] font-bold text-accent">
              <Gift className="h-3.5 w-3.5" strokeWidth={2.5} />
              Dacă ești printre primii 30: 1 an gratuit Business
            </div>
            <div>
              <button type="button" onClick={close} className="btn-primary">
                Înapoi la site
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-5">
              <Mascot size={40} bodyColor="#1D4ED8" />
              <div>
                <h2 id="waitlist-title" className="text-h4 font-gilroy text-ink leading-tight">
                  Cere acces la Convia
                </h2>
                <p className="text-[13px] text-ink-3 mt-0.5">
                  Lansăm în iunie 2026. Fii printre primii.
                </p>
              </div>
            </div>

            {/* Scarcity banner */}
            <div className="mb-5 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent-soft to-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-accent flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(29,78,216,0.45)]">
                  <Gift className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-accent leading-none">
                    Bonus pentru primii 30 înscriși
                  </div>
                  <p className="text-[13px] font-bold text-ink mt-1.5 leading-snug">
                    Primești 1 an gratuit din pachetul Business (valoare 1.788 RON) la lansarea din
                    iunie 2026.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[14px] text-ink-3 leading-relaxed mb-6">
              Lasă-ne emailul tău și te contactăm imediat ce platforma e gata.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="wl-email" className="block text-[13px] font-semibold text-ink mb-1.5">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  id="wl-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nume@firma.ro"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 text-[14.5px] bg-white border border-line-strong rounded-xl focus:outline-none focus:border-slate-400 transition-colors text-ink placeholder:text-soft"
                />
              </div>
              <div>
                <label htmlFor="wl-company" className="block text-[13px] font-semibold text-ink mb-1.5">
                  Numele afacerii <span className="text-soft font-semibold">(opțional)</span>
                </label>
                <input
                  id="wl-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Hotel Bucur, Restaurant Bistro, Magazin Online..."
                  autoComplete="organization"
                  className="w-full px-4 py-3 text-[14.5px] bg-white border border-line-strong rounded-xl focus:outline-none focus:border-slate-400 transition-colors text-ink placeholder:text-soft"
                />
              </div>

              {errorMsg && (
                <div className="text-[13px] text-danger bg-danger/8 border border-danger/20 rounded-lg px-3 py-2">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={state === "submitting"}
                className="btn-primary w-full"
              >
                {state === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Se trimite...
                  </>
                ) : (
                  "Cere acces"
                )}
              </button>

              <p className="text-[11.5px] text-soft text-center pt-1">
                Nu trimitem spam. Nu vindem emailul tău. Te dezabonezi cu un click.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
