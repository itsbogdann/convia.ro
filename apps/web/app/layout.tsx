import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Convia — Dashboard",
    template: "%s · Convia",
  },
  description: "Construiește și gestionează chatbot-ii Convia pentru afacerea ta.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#1D4ED8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className="bg-surface-2 text-ink antialiased">
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
