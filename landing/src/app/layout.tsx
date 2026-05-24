import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WaitlistModal } from "@/components/ui/waitlist-modal";

const SITE_URL = "https://convia.ro";
const OG_IMAGE = "/og.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Convia — Primul chatbot AI pentru afaceri din România",
    template: "%s · Convia",
  },
  description:
    "Răspunde clienților tăi 24/7 pe site și pe WhatsApp. Construiești un asistent AI pentru afacerea ta în 5 minute. Fără cod, fără efort. 100% românesc.",
  keywords: [
    "chatbot AI",
    "chatbot românesc",
    "asistent virtual",
    "automatizare suport clienți",
    "WhatsApp bot",
    "chatbot site web",
    "AI pentru afaceri",
    "chatbot hotel",
    "chatbot restaurant",
    "chatbot e-commerce",
    "GDPR",
    "România",
  ],
  authors: [{ name: "Convia" }],
  creator: "Convia",
  publisher: "Convia",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: "Convia",
    url: SITE_URL,
    title: "Convia — Primul chatbot AI pentru afaceri din România",
    description:
      "Răspunde clienților tăi 24/7 pe site și pe WhatsApp. Construiești un asistent AI pentru afacerea ta în 5 minute. Fără cod, fără efort.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Convia — Chatbot AI pentru afaceri din România" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convia — Primul chatbot AI pentru afaceri din România",
    description:
      "Răspunde clienților tăi 24/7 pe site și pe WhatsApp. Fără cod, fără efort.",
    images: [OG_IMAGE],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  other: {
    "msapplication-TileColor": "#1D4ED8",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Convia",
  url: SITE_URL,
  logo: `${SITE_URL}/images/mascot-blue.svg`,
  description:
    "Platformă românească de chatbot AI care răspunde clienților 24/7 pe site și pe WhatsApp.",
  areaServed: "RO",
  inLanguage: "ro",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "salut@convia.ro",
    availableLanguage: ["ro"],
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Convia",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Chatbot AI românesc pentru hoteluri, restaurante, magazine online și servicii. Învață botul cu propriile informații. Răspunde 24/7 pe site și pe WhatsApp.",
  url: SITE_URL,
  inLanguage: "ro",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "349",
    priceCurrency: "RON",
    offerCount: "3",
  },
  provider: {
    "@type": "Organization",
    name: "Convia",
    url: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <a href="#main" className="skip-link">Sari la conținut</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <WaitlistModal />

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
      </body>
    </html>
  );
}
