export type FaqItem = {
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    question: "Cât durează configurarea unui chatbot Convia?",
    answer:
      "În medie, 5–10 minute. Te înregistrezi, încarci site-ul tău sau un document cu informațiile despre afacere, alegi unde îl pui (site, WhatsApp), copiezi un cod pe site și gata. Botul e live și răspunde clienților tăi.",
  },
  {
    question: "Pot folosi propriile mele informații (site, PDF-uri, Excel)?",
    answer:
      "Da, asta e ideea principală. Convia învață din site-ul tău (introduci linkul și el citește singur), din PDF-uri (meniu, broșură, manual), din fișiere Excel (prețuri, stoc) sau direct din text pe care îl scrii tu. Răspunsurile sunt mereu pe baza informațiilor tale, nu invenții.",
  },
  {
    question: "Ce se întâmplă când botul nu știe răspunsul?",
    answer:
      "Primești o notificare instant (pe email sau WhatsApp) și poți prelua conversația fără să o iei de la zero — vezi tot contextul. Sau poți seta botul să spună „Te conectez cu un coleg, te rog așteaptă un moment”. Tu decizi.",
  },
  {
    question: "Funcționează corect în limba română?",
    answer:
      "Da, Convia e construit din start pentru limba română. Înțelege diacritice, regionalisme, prescurtări (mersi/mulțam, pls, k înseamnă ok). Toate răspunsurile sunt verificate gramatical. Și suportul nostru e în română.",
  },
  {
    question: "Care e prețul? Sunt costuri ascunse?",
    answer:
      "Nu. Avem 3 pachete fixe (Free, Start 29€/lună, Pro 89€/lună) plus TVA. Nu plătești per conversație, per mesaj sau per răspuns. Limita ta lunară e clar afișată. Dacă o depășești, te anunțăm — nu îți blocăm botul brusc.",
  },
  {
    question: "Datele clienților mei sunt în siguranță?",
    answer:
      "Da, GDPR-compliant. Datele sunt stocate criptat (AES-256) pe servere din Uniunea Europeană. Nu le folosim pentru antrenament. Poți șterge oricând conversațiile sau toate datele unui client. Avem și DPA semnabil pentru clienții care îl cer.",
  },
  {
    question: "Se poate conecta cu WhatsApp Business?",
    answer:
      "Da. Conectarea durează ~10 minute și folosim WhatsApp Business API oficial (de la Meta). Vei putea răspunde automat la mesajele primite pe WhatsApp, exact ca pe site. Conversațiile sunt sincronizate într-un singur loc.",
  },
  {
    question: "Pot anula oricând?",
    answer:
      "Da. Anulezi cu un click din contul tău, nu ai nevoie să suni sau să scrii pe email. Contul rămâne activ până la finalul perioadei plătite, fără reînnoire automată după anulare. Datele ți le poți exporta înainte.",
  },
];
