import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-2 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-h1 font-gilroy text-ink mb-2">404</div>
        <h1 className="text-h4 font-gilroy text-ink mb-3">Pagină negăsită</h1>
        <p className="text-[14px] text-ink-3 mb-7">
          Pagina pe care o cauți nu există sau a fost mutată.
        </p>
        <Link href="/dashboard" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Înapoi la dashboard
        </Link>
      </div>
    </div>
  );
}
