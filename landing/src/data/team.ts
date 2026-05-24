export type TeamMember = {
  id: number;
  name: string;
  designation: string;
  image: string;
};

export const team: TeamMember[] = [
  {
    id: 1,
    name: "Andrei Popescu",
    designation: "Manager Suport",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Maria Ionescu",
    designation: "Suport Clienți",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Alex Dumitrescu",
    designation: "Vânzări",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Ioana Stanciu",
    designation: "Marketing",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Mihai Costescu",
    designation: "Tehnic",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&auto=format&fit=crop",
  },
];
