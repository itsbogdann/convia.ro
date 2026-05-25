import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";

export const metadata = { title: "Resetare parolă" };

export default function ForgotPasswordPage() {
  return (
    <div className="card p-8">
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-ink mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Înapoi la conectare
      </Link>

      <div className="text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
          <KeyRound className="h-6 w-6 text-accent" strokeWidth={2.25} />
        </div>
        <h1 className="text-h3 font-gilroy text-ink mb-2">Resetare parolă</h1>
        <p className="text-[14px] text-ink-3">
          Funcționalitatea de resetare a parolei va fi disponibilă în curând.
          Contactează-ne la{" "}
          <a
            href="mailto:contact@convia.ro"
            className="text-accent font-semibold hover:underline"
          >
            contact@convia.ro
          </a>{" "}
          pentru asistență.
        </p>
      </div>
    </div>
  );
}
