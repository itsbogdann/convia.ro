import type { WidgetTranslations } from '@convia/shared-types';

// ============================================
// WIDGET CONFIGURATION
// ============================================

export interface WidgetConfig {
  agentId: string;
  apiKey?: string;
  apiUrl?: string;
  preview?: boolean;
  // Custom fields passed by developer
  user?: UserFields;
  customFields?: Record<string, string | number | boolean>;
}

export interface UserFields {
  name?: string;
  email?: string;
  phone?: string;
  id?: string;
}

// ============================================
// THEME TYPES
// ============================================

export interface WidgetThemeBubble {
  size: number;
  iconSize?: number; // Size of the icon inside the bubble
  icon: 'chat' | 'message' | 'support' | 'custom';
  customIconUrl?: string;
  customIconSvg?: string; // SVG string for custom bubble icon
  customIconId?: string; // ID of the selected bubble icon
  backgroundColor: string;
  iconColor: string;
  pulseAnimation: boolean;
  greeting?: string;
  showGreeting?: boolean;
  borderRadius?: number; // Custom border radius for the bubble
  text?: string; // Optional text label next to the icon
}

export interface WidgetThemeHeader {
  backgroundColor: string;
  textColor: string;
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  showCloseButton: boolean;
  showMinimizeButton: boolean;
  showOnlineStatus?: boolean;
  showDotPattern?: boolean;
}

export interface WidgetThemeChat {
  backgroundColor: string;
  backgroundPattern?: 'none' | 'dots' | 'gradient' | 'custom' | 'image';
  backgroundPatternColor?: string;
  backgroundGradient?: string;
  customBackgroundCss?: string;
  backgroundImage?: string;
  backgroundBlur?: number;
  glassEffect?: boolean;
  glassBlur?: number;    // backdrop-filter blur px (default: 12)
  glassOpacity?: number; // bg opacity 0-1 (default: 0.7)
}

export interface WidgetThemeMessages {
  userBubbleColor: string;
  userTextColor: string;
  assistantBubbleColor: string;
  assistantTextColor: string;
  borderRadius: number;
  showAvatar: boolean;
  avatarUrl?: string;
  avatarIcon?: string; // ID of built-in avatar icon
  avatarSvg?: string; // SVG string for the avatar icon
  avatarBackgroundColor?: string; // Background color for the avatar circle
  showTimestamps?: boolean;
  messageSpacing?: number;
  showShadow?: boolean; // Subtle shadow on message bubbles
}

export interface WidgetThemeInput {
  backgroundColor: string;
  textColor: string;
  placeholder: string;
  borderColor: string;
  sendButtonColor: string;
  showEmojiButton?: boolean;
  showAttachButton?: boolean;
  borderRadius?: number; // Border radius for the input container
  sendButtonBorderRadius?: number; // Border radius for the send button
}

export interface WidgetThemeHumanSimulation {
  enabled: boolean;
  typingIndicator: boolean;
  typingDelayMin: number;
  typingDelayMax: number;
  showDelivered: boolean;
  showReactions: boolean;
  randomPauses: boolean;
}

export interface WidgetThemeBranding {
  showPoweredBy: boolean;
  poweredByText?: string;
  customCss?: string;
}

export interface WidgetThemeNotifications {
  showBadge?: boolean;
  badgeColor?: string;
}

export interface WidgetThemeTypingIndicator {
  enabled: boolean;
  durationMode: 'preset' | 'automatic';
  presetDuration: number;
  animation: 'dots' | 'pulse' | 'wave' | 'thinking';
  delay: number;
}

export interface WidgetThemeQuickReplies {
  style: 'outline' | 'filled';
  borderRadius: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
}

export interface WidgetTheme {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offset: { x: number; y: number };
  chatWidth: number;
  chatHeight: number;
  borderRadius: number;
  mobileFullScreen?: boolean; // When true, chat takes full screen on mobile
  windowShadow?: boolean; // Show shadow around the chat window
  // Widget mode
  mode?: 'classic' | 'portal';
  // Portal configuration (only used when mode is 'portal')
  portal?: PortalConfig;
  bubble: WidgetThemeBubble;
  header: WidgetThemeHeader;
  chat: WidgetThemeChat;
  messages: WidgetThemeMessages;
  input: WidgetThemeInput;
  humanSimulation: WidgetThemeHumanSimulation;
  branding: WidgetThemeBranding;
  notifications?: WidgetThemeNotifications;
  typingIndicator?: WidgetThemeTypingIndicator;
  quickReplies?: WidgetThemeQuickReplies;
  translations?: WidgetTranslations;
}

export type { WidgetTranslations } from '@convia/shared-types';

// ============================================
// DEFAULT THEME
// ============================================

export const DEFAULT_THEME: WidgetTheme = {
  position: 'bottom-right',
  offset: { x: 20, y: 20 },
  chatWidth: 380,
  chatHeight: 600,
  borderRadius: 16,
  windowShadow: true,
  bubble: {
    size: 60,
    icon: 'chat',
    backgroundColor: '#1D4ED8',
    iconColor: '#FFFFFF',
    pulseAnimation: true,
    greeting: 'Salut! Cu ce te ajut?',
    showGreeting: true,
    borderRadius: 30, // Half of size for circular bubble by default
    text: '',
  },
  header: {
    backgroundColor: '#1D4ED8',
    textColor: '#FFFFFF',
    title: 'Asistent',
    subtitle: 'Răspundem de obicei în câteva minute',
    showCloseButton: true,
    showMinimizeButton: true,
    showOnlineStatus: true,
  },
  chat: {
    backgroundColor: '#F8FAFC',
    backgroundPattern: 'none',
  },
  messages: {
    userBubbleColor: '#1D4ED8',
    userTextColor: '#FFFFFF',
    assistantBubbleColor: '#FFFFFF',
    assistantTextColor: '#1F2937',
    borderRadius: 18,
    showAvatar: true,
    showTimestamps: false,
    messageSpacing: 8,
    showShadow: true,
  },
  input: {
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    placeholder: 'Scrie un mesaj...',
    borderColor: '#E5E7EB',
    sendButtonColor: '#1D4ED8',
    showEmojiButton: false,
    showAttachButton: false,
    borderRadius: 12,
    sendButtonBorderRadius: 8,
  },
  humanSimulation: {
    enabled: true,
    typingIndicator: true,
    typingDelayMin: 1500,
    typingDelayMax: 4000,
    showDelivered: true,
    showReactions: true,
    randomPauses: true,
  },
  branding: {
    showPoweredBy: true,
    poweredByText: 'Susținut de Convia',
  },
  notifications: {
    showBadge: true,
    badgeColor: '#EF4444',
  },
  typingIndicator: {
    enabled: true,
    durationMode: 'automatic',
    presetDuration: 3,
    animation: 'dots',
    delay: 0,
  },
  quickReplies: {
    style: 'outline',
    borderRadius: 20,
  },
};

// ============================================
// PORTAL MODE TYPES
// ============================================

export type PortalView =
  | 'home'
  | 'messages'
  | 'messages:chat'
  | 'feedback'
  | 'feedback:success'
  | 'search'
  | 'search:article'
  | 'updates'
  | 'updates:detail'
  | 'help';

export interface ConversationListItem {
  id: string;
  status: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KBSearchResult {
  content: string;
  score: number;
  source: string;
  sourceId: string;
  sourceName: string;
}

export interface UpdateEntry {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  coverImage: string | null;
  label: 'new' | 'improvement' | 'fix' | 'announcement';
  publishedAt: string | null;
  createdAt: string;
}

export interface FaqEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface PortalQuickAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  action: 'messages' | 'feedback' | 'help' | 'url';
  url?: string;
  imageUrl?: string;
  enabled: boolean;
}

export interface PortalTab {
  id: 'home' | 'messages' | 'help' | 'changelog';
  enabled: boolean;
  label: string;
}

export interface PortalConfig {
  greeting: string;
  subheading: string;
  showTeamAvatars: boolean;
  quickActions: PortalQuickAction[];
  showSearch: boolean;
  searchPlaceholder: string;
  showLatestUpdates: boolean;
  latestUpdatesTitle: string;
  tabs: PortalTab[];
  navBackgroundColor: string;
  navTextColor: string;
  navActiveColor: string;
}

export const DEFAULT_PORTAL_CONFIG: PortalConfig = {
  greeting: 'Hey there! 👋',
  subheading: 'How can we help?',
  showTeamAvatars: true,
  quickActions: [
    { id: 'send-message', label: 'Send us a message', icon: 'send', action: 'messages', enabled: true },
    { id: 'leave-feedback', label: 'Leave us feedback', icon: 'star', action: 'feedback', enabled: true },
    { id: 'book-a-call', label: 'Book a call', icon: 'calendar', action: 'url', url: '', enabled: false },
  ],
  showSearch: true,
  searchPlaceholder: 'Search for help...',
  showLatestUpdates: true,
  latestUpdatesTitle: 'Latest updates',
  tabs: [
    { id: 'home', enabled: true, label: 'Home' },
    { id: 'messages', enabled: true, label: 'Conversations' },
    { id: 'help', enabled: true, label: 'Help Center' },
    { id: 'changelog', enabled: false, label: 'Changelog' },
  ],
  navBackgroundColor: '#1a1a1a',
  navTextColor: '#9ca3af',
  navActiveColor: '#6366f1',
};

// ============================================
// AGENT CONFIG (from API)
// ============================================

export interface AgentConfig {
  agentId: string;
  theme: WidgetTheme;
  isPreview: boolean;
  // Realtime config (Supabase)
  realtime?: {
    supabaseUrl: string;
    supabaseAnonKey: string;
  } | null;
  // Legacy support
  appearance?: LegacyAppearance;
  humanSimulation?: LegacyHumanSimulation;
  // Widget redesign features
  enableStreaming?: boolean;
  showCitations?: boolean;
  fileUpload?: {
    enabled: boolean;
    maxFileSizeMb: number;
    allowedTypes: string[];
  };
}

// Legacy types for backwards compatibility
export interface LegacyAppearance {
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  avatarUrl: string | null;
  chatTitle: string;
  welcomeMessage: string;
  inputPlaceholder: string;
  showBranding: boolean;
  // Can be legacy string enum OR full theme object (dashboard saves full theme here)
  theme?: 'light' | 'dark' | 'auto' | Partial<WidgetTheme>;
  borderRadius?: number;
}

export interface LegacyHumanSimulation {
  enabled: boolean;
  typingIndicator: boolean;
  typingDelayMs: { min: number; max: number };
  messageChunking: boolean;
  maxChunkSize: number;
  chunkDelayMs: { min: number; max: number };
  showDeliveredStatus: boolean;
  showReadStatus: boolean;
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface Message {
  id: string;
  content: string;
  parts?: string[];
  sender: 'user' | 'assistant' | 'system';
  createdAt: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  reaction?: string;
  quickReplies?: QuickReply[];
  isStreaming?: boolean;
  citations?: Array<{ sourceName: string; content: string; score: number }>;
  uiComponent?: UIComponent;
}

export interface QuickReply {
  id: string;
  label: string;
  value?: string;
}

export interface Conversation {
  id: string;
  messages: Message[];
}

export interface UIComponent {
  type: 'quick_replies' | 'cards' | 'pre_chat_form' | 'form_response';
  buttons?: Array<{ label: string; value: string }>;
  fields?: Array<{ label: string; value: string }>;
  cards?: Array<{
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    buttons?: Array<{ id: string; label: string; value: string }>;
  }>;
  displayMode?: 'single' | 'carousel';
  formData?: {
    steps: Array<{
      id: string;
      title: string;
      description?: string;
      fields: Array<{
        id: string;
        type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select';
        label: string;
        placeholder?: string;
        required: boolean;
        variableName: string;
        options?: Array<{ label: string; value: string }>;
      }>;
    }>;
    dismissable: boolean;
    submitButtonText: string;
    successMessage?: string;
    nodeId: string;
  };
  metadata?: Record<string, unknown>;
}

export interface WidgetResponse {
  conversationId: string;
  messages: Array<{
    id: string;
    content: string;
    parts?: string[];
    sender: 'user' | 'assistant' | 'system';
    createdAt: string;
    quickReplies?: QuickReply[];
    uiComponent?: UIComponent;
    citations?: Array<{ sourceName: string; content: string; score: number }>;
  }>;
  humanSimulation?: {
    typingDelayMs: number;
    chunks?: string[];
  };
  /** Live Shopify cart — populated when the conversation has an active cart. */
  cart?: ShopifyCart | null;
}

export interface ShopifyCart {
  cartId: string;
  checkoutUrl: string;
  totalQuantity?: number;
  currency?: string;
  totalAmount?: number;
}

// ============================================
// HELPER TO CONVERT LEGACY TO NEW THEME
// ============================================

export function convertLegacyToTheme(
  appearance?: LegacyAppearance,
  humanSim?: LegacyHumanSimulation
): Partial<WidgetTheme> {
  if (!appearance) return {};

  return {
    position: appearance.position,
    borderRadius: appearance.borderRadius || 16,
    bubble: {
      ...DEFAULT_THEME.bubble,
      backgroundColor: appearance.primaryColor,
    },
    header: {
      ...DEFAULT_THEME.header,
      backgroundColor: appearance.primaryColor,
      title: appearance.chatTitle,
      avatarUrl: appearance.avatarUrl || undefined,
    },
    messages: {
      ...DEFAULT_THEME.messages,
      userBubbleColor: appearance.primaryColor,
      showAvatar: !!appearance.avatarUrl,
      avatarUrl: appearance.avatarUrl || undefined,
    },
    input: {
      ...DEFAULT_THEME.input,
      placeholder: appearance.inputPlaceholder,
      sendButtonColor: appearance.primaryColor,
    },
    humanSimulation: humanSim
      ? {
        enabled: humanSim.enabled,
        typingIndicator: humanSim.typingIndicator,
        typingDelayMin: humanSim.typingDelayMs.min,
        typingDelayMax: humanSim.typingDelayMs.max,
        showDelivered: humanSim.showDeliveredStatus,
        showReactions: true,
        randomPauses: true,
      }
      : DEFAULT_THEME.humanSimulation,
    branding: {
      showPoweredBy: appearance.showBranding,
      poweredByText: 'Susținut de Convia',
    },
  };
}

export function mergeTheme(base: WidgetTheme, override: Partial<WidgetTheme>): WidgetTheme {
  const result: Record<string, unknown> = { ...base };

  for (const key of Object.keys(override)) {
    const value = (override as Record<string, unknown>)[key];
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = {
          ...(result[key] as Record<string, unknown>),
          ...(value as Record<string, unknown>),
        };
      } else {
        result[key] = value;
      }
    }
  }

  // Merge portal config with defaults to ensure all fields (nav colors, etc.) are present
  if (result.portal) {
    const savedPortal = result.portal as Record<string, unknown>;
    const mergedPortal = { ...DEFAULT_PORTAL_CONFIG, ...savedPortal } as PortalConfig;

    // Reconcile quick actions: ensure new default actions are present
    const savedActions = (savedPortal.quickActions || DEFAULT_PORTAL_CONFIG.quickActions) as PortalConfig['quickActions'];
    const savedActionIds = new Set(savedActions.map((a) => a.id));
    const mergedActions = [...savedActions];
    for (const defaultAction of DEFAULT_PORTAL_CONFIG.quickActions) {
      if (!savedActionIds.has(defaultAction.id)) {
        mergedActions.push(defaultAction);
      }
    }
    mergedPortal.quickActions = mergedActions;

    // Reconcile tabs: ensure new default tabs are present
    const savedTabs = (savedPortal.tabs || DEFAULT_PORTAL_CONFIG.tabs) as PortalConfig['tabs'];
    const savedTabIds = new Set(savedTabs.map((t) => t.id));
    const mergedTabs = [...savedTabs];
    for (const defaultTab of DEFAULT_PORTAL_CONFIG.tabs) {
      if (!savedTabIds.has(defaultTab.id)) {
        mergedTabs.push(defaultTab);
      }
    }
    // Auto-enable help tab — was a non-functional placeholder before
    const helpIdx = mergedTabs.findIndex((t) => t.id === 'help');
    if (helpIdx !== -1 && !mergedTabs[helpIdx].enabled) {
      mergedTabs[helpIdx] = { ...mergedTabs[helpIdx], enabled: true };
    }
    // Rename "Messages" → "Conversations"
    const messagesIdx = mergedTabs.findIndex((t) => t.id === 'messages');
    if (messagesIdx !== -1 && mergedTabs[messagesIdx].label === 'Messages') {
      mergedTabs[messagesIdx] = { ...mergedTabs[messagesIdx], label: 'Conversations' };
    }
    mergedPortal.tabs = mergedTabs;
    result.portal = mergedPortal;
  }

  return result as unknown as WidgetTheme;
}
