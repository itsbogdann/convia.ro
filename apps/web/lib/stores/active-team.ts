import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveTeamState {
  activeTeamId: string | null;
  setActiveTeam: (teamId: string) => void;
  clear: () => void;
}

export const useActiveTeam = create<ActiveTeamState>()(
  persist(
    (set) => ({
      activeTeamId: null,
      setActiveTeam: (teamId) => set({ activeTeamId: teamId }),
      clear: () => set({ activeTeamId: null }),
    }),
    { name: "convia.active-team" },
  ),
);
