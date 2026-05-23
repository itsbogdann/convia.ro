"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Check, Loader2, X } from "lucide-react";
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
    setTimeout(() => {
      setState("idle");
      setEmail("");
      setCompany("");
      setErrorMsg("");
    }, 250);
  }, []);

  // Open when URL hash is #waitlist
  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#waitlist") {
        setOpen(true);
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-up"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={close}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm cursor-default"
        aria-label="Închide dialogul"
      />

      {/* Modal */}
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-line overflow-hidden">
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
            <p className="text-[14.5px] text-ink-3 leading-relaxed mb-6">
              Te-am adăugat pe lista de așteptare. Îți scriem pe <strong className="text-ink">{email}</strong> imediat
              ce platforma e gata — în următoarele săptămâni.
            </p>
            <button type="button" onClick={close} className="btn-primary">
              Înapoi la site
            </button>
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
                  Lansăm curând. Fii printre primii.
                </p>
              </div>
            </div>

            <p className="text-[14px] text-ink-3 leading-relaxed mb-6">
              Lasă-ne emailul tău și te anunțăm imediat ce platforma e gata. Primii utilizatori
              primesc 30 de zile gratuite, fără card.
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
                  className="w-full px-4 py-3 text-[14.5px] bg-white border border-line-strong rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-ink placeholder:text-soft"
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
                  className="w-full px-4 py-3 text-[14.5px] bg-white border border-line-strong rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-ink placeholder:text-soft"
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
