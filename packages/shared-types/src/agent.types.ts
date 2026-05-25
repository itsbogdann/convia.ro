import type {
  AgentStatus,
  ChannelStatus,
  ChannelType,
  Industry,
  WidgetPosition,
} from "./enums";

/**
 * A "bot" in the UI. Code uses `agent` consistently.
 */
export interface Agent {
  id: string;
  teamId: string;
  name: string;
  description: string | null;
  status: AgentStatus;
  industry: Industry | null;
  language: "ro" | "en";
  // AI configuration
  systemPrompt: string | null;
  model: string;
  temperature: number;
  maxTokens: number;
  // Appearance
  appearance: AgentAppearance;
  // Security
  allowedDomains: string[];
  apiKey: string;
  // Lifecycle
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Widget appearance config stored on the agent */
export interface AgentAppearance {
  primaryColor: string;
  position: WidgetPosition;
  avatarUrl: string | null;
  chatTitle: string;
  welcomeMessage: string;
  inputPlaceholder: string;
  showBranding: boolean;
}

/** A channel attaches an agent to a deployment surface (web widget, WhatsApp) */
export interface Channel {
  id: string;
  agentId: string;
  teamId: string;
  type: ChannelType;
  status: ChannelStatus;
  config: WebChannelConfig | WhatsAppChannelConfig | Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** Web widget channel config */
export interface WebChannelConfig {
  /** Domains where the widget is allowed to load */
  allowedDomains: string[];
}

/** WhatsApp Business channel config */
export interface WhatsAppChannelConfig {
  phoneNumberId: string;
  businessAccountId: string;
  /** Encrypted access token; never returned to the browser */
  encryptedToken?: string;
  /** Verified display name */
  displayName?: string;
}
