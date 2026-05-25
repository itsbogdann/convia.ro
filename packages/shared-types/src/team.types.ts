import type { TeamRole, PlanId } from "./enums";

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  locale: "ro" | "en";
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** A team is a workspace. "Team" in code, "Workspace" in UI copy. */
export interface Team {
  id: string;
  name: string;
  slug: string;
  plan: PlanId;
  settings: TeamSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TeamSettings {
  /** Default language for new bots created in this team */
  defaultLanguage?: "ro" | "en";
  /** Brand color picked during onboarding */
  brandColor?: string;
  /** Industry the team selected during onboarding */
  industry?: string;
  /** Custom company name shown in invoices */
  companyLegalName?: string;
  /** Romanian fiscal code (CUI) */
  cui?: string;
  /** Trade Register number */
  registrationNumber?: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  /** For HUMAN_AGENT role: list of bot IDs this user can handle. Empty = all bots. */
  assignedAgentIds: string[];
  invitedBy: string | null;
  invitedAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

/** Joined view: team + the current user's role within it */
export interface TeamWithRole extends Team {
  role: TeamRole;
}
