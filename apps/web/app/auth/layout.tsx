import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-2">
      {/* Top bar */}
      <header className="h-16 flex items-center px-6">
        <Link href="/" className="inline-flex items-center" aria-label="Convia">
          <BrandMark size={32} />
        </Link>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-5 text-center text-[12px] text-soft">
        © {new Date().getFullYear()} Convia. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
