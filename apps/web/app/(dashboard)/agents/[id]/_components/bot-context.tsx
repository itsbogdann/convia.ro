"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Agent } from "@convia/shared-types";

interface BotContextValue {
  teamId: string;
  agent: Agent;
}

const BotContext = createContext<BotContextValue | null>(null);

export function BotProvider({
  children,
  teamId,
  agent,
}: BotContextValue & { children: ReactNode }) {
  return (
    <BotContext.Provider value={{ teamId, agent }}>{children}</BotContext.Provider>
  );
}

export function useBot(): BotContextValue {
  const ctx = useContext(BotContext);
  if (!ctx) {
    throw new Error("useBot must be used inside <BotProvider>");
  }
  return ctx;
}
