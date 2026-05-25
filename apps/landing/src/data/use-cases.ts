export type ConversationTurn = {
  from: "user" | "bot";
  text: string;
};

export type UseCase = {
  id: string;
  industry: string;
  icon: string;
  headline: string;
  description: string;
  examples: string[];
  conversation: ConversationTurn[];
};

export const useCases: UseCase[] = [
  {
    id: "hotel",
    industry: "Hoteluri & Pensiuni",
    icon: "🏨",
    headline: "Rezervări și răspunsuri instant pentru oaspeții tăi",
    description:
      "Convia răspunde la întrebări despre disponibilitate, prețuri și facilități, și poate prelua rezervări direct pe site sau pe WhatsApp.",
    examples: [
      "Verifică disponibilitatea camerelor",
      "Calculează prețul pentru perioada cerută",
      "Răspunde despre check-in, mic dejun, parcare",
      "Preia rezervări și trimite confirmarea pe email",
    ],
    conversation: [
      { from: "user", text: "Bună! Aveți camere libere weekendul ăsta?" },
      {
        from: "bot",
        text: "Salut! Pentru 23–25 mai am 3 tipuri de camere disponibile: Standard (320 RON/noapte), Deluxe (450 RON) și Suite (650 RON). Toate includ mic dejun și WiFi gratuit. Doriți să rezervați? 🏨",
      },
      { from: "user", text: "O cameră Deluxe pentru 2 persoane, vă rog." },
      {
        from: "bot",
        text: "Perfect! Cameră Deluxe pentru 2 adulți, 23–25 mai (2 nopți) = 900 RON, mic dejun inclus. Pentru a finaliza, am nevoie de numele tău și un număr de telefon. ✅",
      },
    ],
  },
  {
    id: "restaurant",
    industry: "Restaurante & Cafenele",
    icon: "🍝",
    headline: "Rezervări, comenzi și răspunsuri despre meniu, non-stop",
    description:
      "Convia preia rezervările, răspunde la întrebări despre meniu, alergeni și program, și poate prelua comenzi pentru delivery sau take-away.",
    examples: [
      "Preia rezervări de mese cu confirmare instant",
      "Răspunde despre meniu, alergeni, opțiuni vegane",
      "Comunică programul și locația",
      "Trimite reminders cu o oră înainte de rezervare",
    ],
    conversation: [
      {
        from: "user",
        text: "Salut, vreau o rezervare pentru 4 persoane sâmbătă seara la 20:00.",
      },
      {
        from: "bot",
        text: "Mulțumesc! Pentru sâmbătă 25 mai, ora 20:00, 4 persoane, am o masă disponibilă în sala principală, lângă fereastră. Confirm rezervarea? 🍽️",
      },
      {
        from: "user",
        text: "Da, te rog. Avem și un copil de 6 ani, aveți scaun special?",
      },
      {
        from: "bot",
        text: "Sigur! Adaug un scaun pentru copil la rezervare. Confirmarea îți va veni pe WhatsApp cu 1 oră înainte. Aveți alergii sau preferințe (vegan, fără gluten)?",
      },
    ],
  },
  {
    id: "ecommerce",
    industry: "Magazine online",
    icon: "🛍️",
    headline: "Reduce coșurile abandonate și suportul repetitiv",
    description:
      "Convia răspunde la întrebări despre produse, status comandă, livrare și retur, și recomandă produse pe baza preferințelor clientului.",
    examples: [
      "Urmărește statusul comenzilor în timp real",
      "Recomandă produse după nevoia clientului",
      "Răspunde la întrebări despre stoc, mărime, livrare",
      "Procesează retururi și schimburi",
    ],
    conversation: [
      { from: "user", text: "Bună, unde-i comanda mea? Numărul #12345" },
      {
        from: "bot",
        text: "Salut! Comanda #12345 (2 produse, 247 RON) a fost expediată azi prin Sameday. Va ajunge mâine, 24 mai, între 14:00–18:00. Cod tracking: SD123456789. 📦",
      },
      { from: "user", text: "Pot să o schimb să o livrați la birou?" },
      {
        from: "bot",
        text: "Sigur, schimb adresa. Spune-mi adresa biroului (stradă, număr, oraș) și apoi o trimit la curier înainte să plece din depozit.",
      },
    ],
  },
  {
    id: "servicii",
    industry: "Servicii & Programări",
    icon: "📅",
    headline: "Programări automate pentru salon, clinică, atelier",
    description:
      "Convia preia programări pe baza programului tău, trimite confirmări și reminders, și poate replanifica dacă clientul nu poate veni.",
    examples: [
      "Programări automate cu sincronizare în calendar",
      "Confirmări și reminders prin SMS/WhatsApp",
      "Replanifică automat când e nevoie",
      "Răspunde la prețuri, durată, locație",
    ],
    conversation: [
      { from: "user", text: "Salut, vreau o programare la tuns mâine după-amiază." },
      {
        from: "bot",
        text: "Sigur! Pentru mâine, 24 mai, după-amiază, am liber la 14:00, 15:30 sau 17:00 cu Andrei. La ce oră preferi? ✂️",
      },
      { from: "user", text: "15:30, te rog." },
      {
        from: "bot",
        text: "Excelent! Programare confirmată: mâine 24 mai, 15:30, cu Andrei. Tunsoare clasică (40 RON, ~30 min). Îți trimit un reminder pe WhatsApp cu 1h înainte. Mulțumim! 🙌",
      },
    ],
  },
];
