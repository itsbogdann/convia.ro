import type {
  ConversationStatus,
  MessageContentType,
  MessageSender,
} from "./enums";

export interface Conversation {
  id: string;
  agentId: string;
  teamId: string;
  channelId: string | null;
  status: ConversationStatus;
  visitorId: string;
  visitorMetadata: VisitorMetadata;
  sessionId: string;
  lastActivityAt: string;
  assignedTo: string | null;
  takenOverAt: string | null;
  variables: Record<string, unknown>;
  context: Record<string, unknown>;
  messageCount: number;
  source: "web" | "whatsapp" | "api" | "test";
  sourceUrl: string | null;
  isOverage: boolean;
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
}

/** Browser/device info captured at the start of a conversation */
export interface VisitorMetadata {
  userAgent?: string;
  language?: string;
  timezone?: string;
  referrer?: string;
  ipCountry?: string;
  /** Custom fields the host site passed via the widget */
  custom?: Record<string, string | number | boolean | null>;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  /** Set when sender === HUMAN_AGENT */
  senderId: string | null;
  contentType: MessageContentType;
  content: string;
  model: string | null;
  tokensUsed: number | null;
  toolName: string | null;
  toolResult: Record<string, unknown> | null;
  uiComponent: Record<string, unknown> | null;
  createdAt: string;
  deliveredAt: string | null;
  readAt: string | null;
}

/** Wire payload for sending a message from the widget */
export interface IncomingMessagePayload {
  agentApiKey: string;
  sessionId: string;
  visitorId: string;
  content: string;
  contentType?: MessageContentType;
  visitorMetadata?: VisitorMetadata;
  sourceUrl?: string;
}

/** Wire payload returned by the API after processing an incoming message */
export interface OutgoingMessagePayload {
  conversationId: string;
  messages: Message[];
  conversationEnded: boolean;
  humanTakeoverActive: boolean;
}
