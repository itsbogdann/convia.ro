import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { SignOutButton } from "@/app/onboarding/_components/sign-out-button";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-2 flex flex-col">
      <header className="h-16 flex items-center justify-between px-6 lg:px-10 border-b border-line bg-white">
        <Link href="/onboarding" aria-label="Convia">
          <BrandMark size={28} />
        </Link>
        <SignOutButton />
      </header>
      <main className="flex-1 px-4 lg:px-10 py-8 lg:py-12">{children}</main>
    </div>
  );
}
