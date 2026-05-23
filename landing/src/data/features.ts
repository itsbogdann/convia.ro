import type { LucideIcon } from "lucide-react";
import {
  Clock,
  BookOpen,
  MessagesSquare,
  UserCheck,
  BarChart3,
  Zap,
} from "lucide-react";

export type Feature = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    id: "always-on",
    icon: Clock,
    title: "Răspunsuri instant, 24/7",
    description:
      "Botul tău răspunde clienților oricând — la 9 dimineața sau la 3 noaptea. Niciun client pierdut pentru că nu erai la birou.",
  },
  {
    id: "knowledge",
    icon: BookOpen,
    title: "Învață cu informațiile tale",
    description:
      "Încarci site-ul, un PDF cu meniul, un Excel cu prețurile sau scrii direct. Botul învață și răspunde corect, pe limba ta.",
  },
  {
    id: "channels",
    icon: MessagesSquare,
    title: "Site web și WhatsApp",
    description:
      "Pui botul pe site cu un cod copy-paste, sau îl conectezi la WhatsApp Business — clienții te găsesc unde le e mai ușor.",
  },
  {
    id: "human",
    icon: UserCheck,
    title: "Preluare umană când e nevoie",
    description:
      "Când botul nu știe ce să răspundă, primești o notificare și preiei conversația fără să o iei de la zero. Tu rămâi în control.",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Vezi ce întreabă clienții tăi",
    description:
      "Statistici simple: câte conversații, ce întrebări frecvente, unde abandonează. Înțelegi clienții fără să citești toate mesajele.",
  },
  {
    id: "setup",
    icon: Zap,
    title: "Gata în 5 minute",
    description:
      "Fără cod, fără echipa de IT, fără bătăi de cap. Te înregistrezi, urci informațiile și botul e live. Mai repede decât o cafea.",
  },
];
