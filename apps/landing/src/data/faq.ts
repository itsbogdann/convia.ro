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
    question: "Trebuie să știu cod ca să-l pun pe site? Pot să-mi ajute cineva?",
    answer:
      "Nu, nu ai nevoie de cunoștințe tehnice. Botul se adaugă cu o singură linie de cod copy-paste și funcționează pe WordPress, Shopify, Webflow, Gomag și orice site. Dacă nu te descurci sau pur și simplu nu vrei să te chinui, echipa noastră îl instalează gratuit pe site-ul tău. Tu ne dai accesul la admin (sau ne arăți unde să-l adăugăm), iar noi îl punem la treabă în 5 minute.",
  },
  {
    question: "Pot folosi propriile mele informații (site, PDF-uri, Excel)?",
    answer:
      "Da, asta e ideea principală. Convia învață din site-ul tău (introduci linkul și el citește singur), din PDF-uri (meniu, broșură, manual), din fișiere Excel (prețuri, stoc) sau direct din text pe care îl scrii tu. Răspunsurile sunt mereu pe baza informațiilor tale, nu invenții.",
  },
  {
    question: "Ce se întâmplă când botul nu știe răspunsul?",
    answer:
      "Primești o notificare instant (pe email sau WhatsApp) și poți prelua conversația fără să o iei de la zero, vezi tot contextul. Sau poți seta botul să spună „Te conectez cu un coleg, te rog așteaptă un moment”. Tu decizi.",
  },
  {
    question: "Funcționează corect în limba română?",
    answer:
      "Da, Convia e construit din start pentru limba română. Înțelege diacritice, regionalisme, prescurtări (mersi/mulțam, pls, k înseamnă ok). Toate răspunsurile sunt verificate gramatical. Și suportul nostru e în română.",
  },
  {
    question: "Care e prețul? Sunt costuri ascunse?",
    answer:
      "Nu. Avem 3 pachete fixe: Gratuit (100 conv/lună, 0 RON), Business (1.000 conv/lună, 149 RON lunar sau 119 RON anual) și Premium (5.000 conv/lună, 349 RON lunar sau 279 RON anual). Toate sunt + TVA. Dacă depășești limita lunară, plătești doar pentru conversațiile suplimentare: 0,25 RON/conv pe Business și 0,12 RON/conv pe Premium. Nu îți blocăm botul, te anunțăm transparent.",
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
