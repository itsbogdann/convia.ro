import { create } from 'zustand';
import type {
  AgentConfig,
  Message,
  WidgetTheme,
  QuickReply,
  UserFields,
  UIComponent,
  PortalView,
  ConversationListItem,
  KBSearchResult,
  UpdateEntry,
  FaqEntry,
} from './types';
import {
  DEFAULT_THEME,
  mergeTheme,
  convertLegacyToTheme,
} from './types';
import api from './api';
import { initRealtime, subscribeToConversation, unsubscribeFromConversation } from './realtime';

// Heartbeat interval management
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let heartbeatPaused = false;

function startHeartbeat(conversationId: string) {
  stopHeartbeat();

  // Send immediately
  api.heartbeat(conversationId).catch(() => { });

  // Then every 30 seconds
  heartbeatInterval = setInterval(() => {
    if (!heartbeatPaused) {
      api.heartbeat(conversationId).catch(() => { });
    }
  }, 30000);

  // Pause when tab hidden, resume when visible
  const handleVisibility = () => {
    if (document.hidden) {
      heartbeatPaused = true;
    } else {
      heartbeatPaused = false;
      api.heartbeat(conversationId).catch(() => { });
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);

  // Store cleanup ref
  (startHeartbeat as any)._visibilityHandler = handleVisibility;
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  heartbeatPaused = false;
  if ((startHeartbeat as any)._visibilityHandler) {
    document.removeEventListener('visibilitychange', (startHeartbeat as any)._visibilityHandler);
    (startHeartbeat as any)._visibilityHandler = null;
  }
}

interface WidgetState {
  // UI State
  isOpen: boolean;
  isMinimized: boolean;
  isExpanded: boolean;
  isLoading: boolean;
  isTyping: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;

  // Config
  config: AgentConfig | null;
  theme: WidgetTheme;
  isPreview: boolean;

  // User info (from developer)
  userFields: UserFields | null;
  customFields: Record<string, string | number | boolean>;

  // Conversation
  conversationId: string | null;
  messages: Message[];
  hasEnded: boolean;
  shopifyCart: {
    cartId: string;
    checkoutUrl: string;
    totalQuantity?: number;
    currency?: string;
    totalAmount?: number;
  } | null;

  // Pre-chat form
  isFormVisible: boolean;
  formData: {
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
  } | null;

  // Portal state
  portalView: PortalView;
  portalTab: 'home' | 'messages' | 'help' | 'changelog';
  conversationsList: ConversationListItem[];
  conversationsLoading: boolean;
  feedbackRating: number;
  feedbackComment: string;
  feedbackEmail: string;
  feedbackSubmitting: boolean;
  feedbackSubmitted: boolean;
  searchQuery: string;
  searchResults: KBSearchResult[];
  searchLoading: boolean;
  updates: UpdateEntry[];
  updatesLoading: boolean;
  selectedUpdateId: string | null;
  selectedSearchResult: KBSearchResult | null;
  faqs: FaqEntry[];
  faqsLoading: boolean;

  // Actions
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setMinimized: (minimized: boolean) => void;
  toggleExpanded: () => void;
  initialize: (params: {
    apiKey?: string;
    preview?: boolean;
    agentId?: string;
    user?: UserFields;
    customFields?: Record<string, string | number | boolean>;
  }) => Promise<void>;
  startConversation: (portalSessionId?: string) => Promise<void>;
  sendMessage: (content: string, displayContent?: string) => Promise<void>;
  sendQuickReply: (reply: QuickReply) => Promise<void>;
  addMessage: (message: Message) => void;
  setTyping: (typing: boolean) => void;
  addReaction: (messageId: string, emoji: string) => void;
  uploadFile: (file: File) => Promise<void>;
  showPreChatForm: (data: {
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
  }) => void;
  dismissForm: () => void;
  submitPreChatForm: (formData: Record<string, string>) => Promise<void>;
  reset: () => void;

  // Portal actions
  navigatePortal: (view: PortalView) => void;
  setPortalTab: (tab: 'home' | 'messages' | 'help' | 'changelog') => void;
  loadConversationsList: () => Promise<void>;
  openConversation: (id: string) => Promise<void>;
  startNewPortalConversation: () => Promise<void>;
  submitFeedback: () => Promise<void>;
  searchKnowledge: (query: string) => Promise<void>;
  loadUpdates: () => Promise<void>;
  loadFaqs: () => Promise<void>;
  setFeedbackRating: (rating: number) => void;
  setFeedbackComment: (comment: string) => void;
  setFeedbackEmail: (email: string) => void;
  setSelectedSearchResult: (result: KBSearchResult | null) => void;
  setSelectedUpdateId: (id: string | null) => void;
}

// Crypto-strong random hex generator
const randomHex = (n: number) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n)),
    b => b.toString(16).padStart(2, '0')).join('');

// Generate session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('lr_session_id');
  if (!sessionId) {
    sessionId = `session_${randomHex(16)}`;
    localStorage.setItem('lr_session_id', sessionId);
  }
  return sessionId;
};

// Generate/load visitor ID (persists across sessions for portal mode)
const getVisitorId = () => {
  let visitorId = localStorage.getItem('lr_visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${randomHex(16)}`;
    localStorage.setItem('lr_visitor_id', visitorId);
  }
  return visitorId;
};

// Generate a fresh session ID for new portal conversations
const newPortalSessionId = () => {
  return `portal_${randomHex(16)}`;
};

// Random delay helper
const randomDelay = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Extract quick replies from API response (handles both formats)
const extractQuickReplies = (
  quickReplies?: QuickReply[],
  uiComponent?: UIComponent
): QuickReply[] | undefined => {
  // Direct quickReplies take priority
  if (quickReplies && quickReplies.length > 0) {
    return quickReplies;
  }
  // Extract from uiComponent if it's quick_replies type
  if (uiComponent?.type === 'quick_replies' && uiComponent.buttons) {
    return uiComponent.buttons.map((btn, idx) => ({
      id: `qr_${idx}`,
      label: btn.label,
      value: btn.value,
    }));
  }
  return undefined;
};

export const useWidgetStore = create<WidgetState>((set, get) => ({
  // Initial state
  isOpen: false,
  isMinimized: false,
  isExpanded: false,
  isLoading: false,
  isTyping: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  config: null,
  theme: DEFAULT_THEME,
  isPreview: false,
  userFields: null,
  customFields: {},
  conversationId: null,
  messages: [],
  hasEnded: false,
  shopifyCart: null,

  // Pre-chat form initial state
  isFormVisible: false,
  formData: null,

  // Portal initial state
  portalView: 'home',
  portalTab: 'home',
  conversationsList: [],
  conversationsLoading: false,
  feedbackRating: 0,
  feedbackComment: '',
  feedbackEmail: '',
  feedbackSubmitting: false,
  feedbackSubmitted: false,
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  updates: [],
  updatesLoading: false,
  selectedUpdateId: null,
  selectedSearchResult: null,
  faqs: [],
  faqsLoading: false,

  setOpen: (open) => {
    const { theme } = get();
    const isPortalMode = theme.mode === 'portal';

    set({ isOpen: open, isMinimized: false, isExpanded: open ? get().isExpanded : false });

    if (open) {
      if (isPortalMode) {
        // Portal mode: show home screen, don't auto-start conversation
        if (!get().conversationId || get().portalView === 'home') {
          set({ portalView: 'home', portalTab: 'home' });
        }
      } else {
        // Classic mode: auto-start conversation
        if (!get().conversationId) {
          get().startConversation();
        }
      }
    }

    // Start/stop heartbeat based on widget open state
    if (open && get().conversationId && !get().hasEnded) {
      startHeartbeat(get().conversationId!);
    } else if (!open) {
      stopHeartbeat();
    }
  },

  toggleOpen: () => {
    const { isOpen } = get();
    get().setOpen(!isOpen);
  },

  setMinimized: (minimized) => set({ isMinimized: minimized }),

  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),

  initialize: async ({ apiKey, preview = false, agentId, user, customFields }) => {
    // Preview mode: agentId without apiKey (dashboard preview / playground)
    // Production mode: apiKey is provided (external website embed)
    const isPreviewMode = !apiKey && (preview || !!agentId);

    set({
      isLoading: true,
      error: null,
      isPreview: isPreviewMode,
      userFields: user || null,
      customFields: customFields || {},
    });

    try {
      if (apiKey) {
        api.setApiKey(apiKey);
      }

      // Only set preview agent ID when in actual preview mode (no API key)
      if (isPreviewMode && agentId) {
        api.setPreviewAgentId(agentId);
      } else {
        api.setPreviewAgentId(null);
      }

      // Get config - use preview endpoint only for dashboard preview (no API key)
      const config = isPreviewMode && agentId
        ? await api.getPreviewConfig(agentId)
        : await api.getConfig(preview);

      // Build theme from config
      let theme = DEFAULT_THEME;

      // Check for theme object stored inside appearance (dashboard saves full theme here)
      const appearanceTheme = config.appearance?.theme;
      const hasAppearanceTheme = appearanceTheme &&
        typeof appearanceTheme === 'object' &&
        Object.keys(appearanceTheme).length > 0;

      if (config.theme && Object.keys(config.theme).length > 0) {
        // New theme system - direct theme field
        theme = mergeTheme(DEFAULT_THEME, config.theme);
        // Also merge appearance.theme overrides (portal saves translations/portal config here)
        if (hasAppearanceTheme) {
          theme = mergeTheme(theme, appearanceTheme as Partial<WidgetTheme>);
        }
      } else if (hasAppearanceTheme) {
        // Theme stored inside appearance (dashboard saves theme here)
        theme = mergeTheme(DEFAULT_THEME, appearanceTheme as Partial<WidgetTheme>);
      } else if (config.appearance) {
        // Legacy appearance system - convert basic fields to new theme
        const legacyTheme = convertLegacyToTheme(
          config.appearance,
          config.humanSimulation
        );
        theme = mergeTheme(DEFAULT_THEME, legacyTheme);
      }
      // Initialize realtime if Supabase config is available
      if (config.realtime?.supabaseUrl && config.realtime?.supabaseAnonKey) {
        initRealtime(config.realtime.supabaseUrl, config.realtime.supabaseAnonKey);
      }

      set({ config, theme, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize',
        isLoading: false,
      });
    }
  },

  startConversation: async (portalSessionId?: string) => {
    const { config, userFields, customFields, theme } = get();
    if (!config) return;

    set({ isLoading: true, error: null });

    try {
      const isPortalMode = theme.mode === 'portal';
      const sessionId = portalSessionId || getSessionId();
      const visitorId = isPortalMode ? getVisitorId() : undefined;
      const response = await api.startConversation(sessionId, {
        userFields,
        customFields,
        visitorId,
      });

      const messages: Message[] = [];
      let pendingFormData: WidgetState['formData'] = null;
      for (const m of (response?.messages || [])) {
        // Intercept pre_chat_form messages — show as form overlay instead of chat message
        if (m.sender === 'assistant' && m.uiComponent?.type === 'pre_chat_form' && m.uiComponent?.formData) {
          const fd = m.uiComponent.formData as any;
          pendingFormData = {
            steps: fd.steps,
            dismissable: fd.dismissable ?? true,
            submitButtonText: fd.submitButtonText || 'Submit',
            successMessage: fd.successMessage,
            nodeId: fd.nodeId,
          };
          continue;
        }

        {
          messages.push({
            id: m.id,
            content: m.content,
            sender: m.sender,
            createdAt: new Date(m.createdAt),
            status: 'delivered',
            quickReplies: extractQuickReplies(m.quickReplies, m.uiComponent),
            uiComponent: m.uiComponent,
            citations: m.citations,
          });
        }
      }

      set({
        conversationId: response.conversationId,
        messages,
        isLoading: false,
        hasEnded: false,
        shopifyCart: response.cart ?? null,
      });

      // Show pre-chat form if one was found in the initial messages
      if (pendingFormData) {
        get().showPreChatForm(pendingFormData);
      }

      // Subscribe to realtime + heartbeat — isolated so failures don't break the conversation
      try {
        subscribeToConversation(response.conversationId, {
          onMessage: (msg) => {
            if (msg.sender !== 'human_agent') return;
            const { messages } = get();
            if (messages.some((m) => m.id === msg.id)) return;
            const newMessage: Message = {
              id: msg.id,
              content: msg.content,
              sender: 'assistant',
              createdAt: new Date(msg.createdAt),
              status: 'delivered',
            };
            set((state) => ({ messages: [...state.messages, newMessage] }));
          },
          onHandoff: ({ agentName }) => {
            const divider: Message = {
              id: `handoff_${Date.now()}`,
              content: `${agentName} joined the conversation`,
              sender: 'system',
              createdAt: new Date(),
              status: 'delivered',
            };
            set((state) => ({ messages: [...state.messages, divider] }));
          },
          onReturnToAI: ({ agentName }) => {
            const divider: Message = {
              id: `return_${Date.now()}`,
              content: `${agentName} left the conversation`,
              sender: 'system',
              createdAt: new Date(),
              status: 'delivered',
            };
            set((state) => ({ messages: [...state.messages, divider] }));
          },
        });

        if (get().isOpen) {
          startHeartbeat(response.conversationId);
        }
      } catch (realtimeErr) {
        // Realtime/heartbeat failures are non-fatal — conversation still works
        console.warn('[Convia] Realtime setup failed (non-fatal):', realtimeErr);
      }
    } catch (err) {
      console.error('[Convia] Failed to start conversation:', err);
      const { theme } = get();
      if (theme.mode === 'portal') {
        // Stay on chat view with a system error message so user can retry
        set({
          isLoading: false,
          messages: [{
            id: `error_${Date.now()}`,
            content: 'Something went wrong. Please go back and try again.',
            sender: 'system' as const,
            createdAt: new Date(),
            status: 'delivered' as const,
          }],
        });
      } else {
        set({
          error: err instanceof Error ? err.message : 'Failed to start conversation',
          isLoading: false,
        });
      }
    }
  },

  sendMessage: async (content, displayContent?: string) => {
    const { conversationId, config, theme, hasEnded } = get();
    if (!conversationId || !config || hasEnded) return;

    const useStreaming = config.enableStreaming === true;

    // Add user message immediately (use displayContent if provided, otherwise content)
    const userMessage: Message = {
      id: `temp_${Date.now()}`,
      content: displayContent || content,
      sender: 'user',
      createdAt: new Date(),
      status: useStreaming ? 'delivered' : 'sending',
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
    }));

    // ============================================
    // STREAMING PATH
    // ============================================
    if (useStreaming) {
      // Create a placeholder assistant message for streaming
      const streamingMsgId = `streaming_${Date.now()}`;
      const streamingMessage: Message = {
        id: streamingMsgId,
        content: '',
        sender: 'assistant',
        createdAt: new Date(),
        status: 'delivered',
        isStreaming: true,
      };

      set((state) => ({
        messages: [...state.messages, streamingMessage],
      }));

      try {
        await api.sendMessageStreaming(
          conversationId,
          content,
          displayContent,
          (data) => {
            if (data.error) {
              // Server sent an error event
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === streamingMsgId
                    ? { ...m, content: data.error || 'Something went wrong.', isStreaming: false }
                    : m
                ),
              }));
              return;
            }

            if (data.done) {
              // Stream complete — replace the streaming placeholder with real messages.
              // The done event may include a `messages` array with UI components (forms, cards, etc.)
              const serverMessages = data.messages;

              if (serverMessages && serverMessages.length > 0) {
                // Replace the streaming placeholder with actual server data, but keep
                // the placeholder's ID for the first message to avoid a React key change
                // (which causes a visible flicker as the component unmounts/remounts).
                set((state) => {
                  const newMessages: Message[] = serverMessages.map((msg: any, idx: number) => ({
                    id: idx === 0 ? streamingMsgId : msg.id,
                    content: msg.content?.replace(/\n?\[ROUTE:.+?\]/g, '').trim() || '',
                    sender: msg.sender as 'user' | 'assistant' | 'system',
                    createdAt: new Date(msg.createdAt),
                    status: 'delivered' as const,
                    isStreaming: false,
                    quickReplies: extractQuickReplies(msg.quickReplies, msg.uiComponent),
                    uiComponent: msg.uiComponent || undefined,
                    citations: msg.citations || undefined,
                  }));
                  // Replace the placeholder in-place with the first message, append extras
                  const updated = state.messages.map((m) =>
                    m.id === streamingMsgId ? newMessages[0] : m
                  );
                  if (newMessages.length > 1) {
                    updated.push(...newMessages.slice(1));
                  }
                  return { messages: updated };
                });

                // Update Shopify cart from the done event if present
                if (data.cart !== undefined) {
                  set({ shopifyCart: data.cart });
                }

                // Check for pre_chat_form UI component — show form overlay after a delay
                // so the message finishes streaming first
                for (const msg of serverMessages) {
                  if (msg.uiComponent?.type === 'pre_chat_form' && msg.uiComponent?.formData) {
                    const fd = msg.uiComponent.formData;
                    setTimeout(() => {
                      get().showPreChatForm({
                        steps: fd.steps,
                        dismissable: fd.dismissable ?? true,
                        submitButtonText: fd.submitButtonText || 'Submit',
                        successMessage: fd.successMessage,
                        nodeId: fd.nodeId,
                      });
                    }, 1000);
                  }
                }
              } else {
                // No server messages — just finalize the streaming placeholder
                set((state) => ({
                  messages: state.messages.map((m) =>
                    m.id === streamingMsgId
                      ? {
                        ...m,
                        content: m.content.replace(/\n?\[ROUTE:.+?\]/g, '').trim(),
                        isStreaming: false,
                      }
                      : m
                  ),
                }));
              }
            } else if (data.token) {
              // Append token to the streaming message
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === streamingMsgId
                    ? { ...m, content: m.content + data.token }
                    : m
                ),
              }));
            }
          },
        );
      } catch (error) {
        // Network error or stream failure
        if ((error as any)?.status === 429) {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === streamingMsgId
                ? {
                  ...m,
                  content: "I'm receiving too many messages right now. Please wait a moment and try again.",
                  isStreaming: false,
                }
                : m
            ),
          }));
        } else {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === streamingMsgId
                ? {
                  ...m,
                  content: 'Something went wrong. Please try again.',
                  isStreaming: false,
                }
                : m
            ),
          }));
        }
      }

      return;
    }

    // ============================================
    // NON-STREAMING PATH (existing behavior)
    // ============================================

    // Simulate typing delay and indicator
    const humanSim = theme.humanSimulation;

    // Fire API call immediately — don't wait for animations
    const apiCallStart = Date.now();
    const apiPromise = api.sendMessage(conversationId, content, displayContent);

    // Run delivered + typing animations in parallel with the API call
    if (humanSim.enabled && humanSim.typingIndicator) {
      if (humanSim.showDelivered) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === userMessage.id ? { ...m, status: 'delivered' as const } : m
              ),
            }));
            resolve();
          }, 500);
        });
        await new Promise((resolve) => setTimeout(resolve, 800));
        set({ isTyping: true });
      } else {
        set({ isTyping: true });
      }
    }

    try {
      // Wait for API (may already be done if animations took a while)
      const response = await apiPromise;
      const apiDuration = Date.now() - apiCallStart;

      // Update user message status
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === userMessage.id ? { ...m, status: 'delivered' as const } : m
        ),
      }));

      // Check if conversation ended
      const systemMsg = (response?.messages || []).find((m) => m.sender === 'system');
      if (systemMsg?.content?.includes('ended')) {
        set({ hasEnded: true });
      }

      // Handle human simulation — subtract time already spent waiting
      // const responseSim = response.humanSimulation;
      const assistantMessages = (response?.messages || []).filter(
        (m) => m.sender === 'assistant',
      );

      // Find any pre-chat form across the returned messages. The workflow
      // can return multiple messages in one turn (e.g., AI Response text
      // followed by a Pre-Chat Form UI component).
      const formMsg = assistantMessages.find(
        (m) => m.uiComponent?.type === 'pre_chat_form' && m.uiComponent?.formData,
      );

      // Chat messages to render in the transcript — everything EXCEPT the
      // form itself (the form is shown as an overlay, not an inline bubble).
      const chatMessages = assistantMessages.filter((m) => m !== formMsg);

      if (assistantMessages.length === 0) {
        set({ isTyping: false });
      } else {
        // Optional post-response delay for human simulation
        if (humanSim.enabled) {
          const minPerceived = 800;
          const remainingDelay = Math.max(0, minPerceived - apiDuration);
          if (remainingDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, remainingDelay));
          }
        }
        set({ isTyping: false });

        // Append all chat messages to the transcript
        if (chatMessages.length > 0) {
          const newMessages: Message[] = chatMessages.map((m) => ({
            id: m.id,
            content: m.content,
            sender: 'assistant',
            createdAt: new Date(m.createdAt),
            status: 'delivered',
            quickReplies: extractQuickReplies(m.quickReplies, m.uiComponent),
            uiComponent: m.uiComponent,
            citations: m.citations,
          }));

          set((state) => ({
            messages: [...state.messages, ...newMessages],
          }));
        }

        // Show the pre-chat form overlay if the response contained one.
        // Delay slightly so the preceding text message has a chance to
        // appear before the overlay slides in.
        if (formMsg?.uiComponent?.formData) {
          const fd = formMsg.uiComponent.formData;
          setTimeout(() => {
            get().showPreChatForm({
              steps: fd.steps,
              dismissable: fd.dismissable ?? true,
              submitButtonText: fd.submitButtonText || 'Submit',
              successMessage: fd.successMessage,
              nodeId: fd.nodeId,
            });
          }, chatMessages.length > 0 ? 600 : 0);
        }

        // Add reaction to user's message if enabled (only if we rendered
        // a real chat reply, not a pure form response)
        if (
          chatMessages.length > 0 &&
          humanSim.enabled &&
          humanSim.showReactions &&
          Math.random() < 0.3
        ) {
          const reactions = ['❤️', '👍', '😊', '🙌', '✨'];
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];

          setTimeout(() => {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === userMessage.id ? { ...m, reaction: randomReaction } : m
              ),
            }));
          }, randomDelay(1000, 3000));
        }
      }
    } catch (error) {
      set({ isTyping: false });

      // Show a friendly bot message for rate limiting instead of an error banner
      if ((error as any)?.status === 429) {
        const rateLimitMsg: Message = {
          id: `system_${Date.now()}`,
          content: "I'm receiving too many messages right now. Please wait a moment and try again.",
          sender: 'assistant',
          createdAt: new Date(),
          status: 'delivered',
        };
        set((state) => ({ messages: [...state.messages, rateLimitMsg] }));
      } else {
        set({ error: error instanceof Error ? error.message : 'Failed to send message' });
      }
    }
  },

  sendQuickReply: async (reply) => {
    // Clear quick replies from all messages
    set((state) => ({
      messages: state.messages.map((m) => ({ ...m, quickReplies: undefined })),
    }));

    // Send value to API but display label to user
    const apiContent = reply.value || reply.label;
    const displayContent = reply.label;
    await get().sendMessage(apiContent, displayContent);
  },

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setTyping: (typing) => set({ isTyping: typing }),

  addReaction: (messageId, emoji) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, reaction: emoji } : m
      ),
    })),

  uploadFile: async (file: File) => {
    const { conversationId, config } = get();
    if (!conversationId || !config) return;

    // Client-side validation
    const maxSize = config.fileUpload?.maxFileSizeMb || 10;
    if (file.size > maxSize * 1024 * 1024) {
      const errMsg: Message = {
        id: `error_${Date.now()}`,
        content: `File too large. Maximum size is ${maxSize}MB.`,
        sender: 'system',
        createdAt: new Date(),
        status: 'delivered',
      };
      set((state) => ({ messages: [...state.messages, errMsg] }));
      return;
    }

    set({ isUploading: true, uploadProgress: 10 });

    // Add optimistic user file message
    const userFileMsg: Message = {
      id: `file_${Date.now()}`,
      content: file.name,
      sender: 'user',
      createdAt: new Date(),
      status: 'sending',
    };
    set((state) => ({ messages: [...state.messages, userFileMsg] }));

    try {
      set({ uploadProgress: 50 });
      const result = await api.uploadFile(conversationId, file);
      set({ uploadProgress: 100 });

      // Update file message with server response
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === userFileMsg.id
            ? { ...m, status: 'delivered' as const, content: result.fileName }
            : m
        ),
        isUploading: false,
        uploadProgress: 0,
      }));
    } catch (err) {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === userFileMsg.id
            ? { ...m, content: 'Failed to upload file', sender: 'system' as const }
            : m
        ),
        isUploading: false,
        uploadProgress: 0,
      }));
    }
  },

  // ============================================
  // PRE-CHAT FORM ACTIONS
  // ============================================

  showPreChatForm: (data) => {
    set({ isFormVisible: true, formData: data });
  },

  dismissForm: () => {
    set({ isFormVisible: false });
  },

  submitPreChatForm: async (formData) => {
    const { conversationId } = get();
    const currentFormData = get().formData;
    const nodeId = currentFormData?.nodeId;
    if (!conversationId || !nodeId) return;

    // Build read-only field labels from the form steps
    const responseFields: Array<{ label: string; value: string }> = [];
    if (currentFormData?.steps) {
      for (const step of currentFormData.steps) {
        for (const field of step.fields) {
          responseFields.push({
            label: field.label,
            value: formData[field.variableName] || '',
          });
        }
      }
    }

    try {
      const response = await api.submitForm(conversationId, formData, nodeId);

      set({ isFormVisible: false, formData: null });

      // Insert a local assistant message with form responses for read-only viewing
      if (responseFields.length > 0) {
        const formResponseMsg: Message = {
          id: `form-response-${Date.now()}`,
          content: 'Your form has been submitted.',
          sender: 'assistant',
          createdAt: new Date(),
          status: 'delivered',
          uiComponent: {
            type: 'form_response',
            fields: responseFields,
          },
        };
        set((state) => ({ messages: [...state.messages, formResponseMsg] }));
      }

      // Process response messages (workflow continues after form submission)
      if (response?.messages) {
        for (const m of response.messages) {
          // Check for pre_chat_form uiComponent in response
          if (m.sender === 'assistant' && m.uiComponent?.type === 'pre_chat_form' && m.uiComponent?.formData) {
            const fd = m.uiComponent.formData as any;
            get().showPreChatForm({
              steps: fd.steps,
              dismissable: fd.dismissable ?? true,
              submitButtonText: fd.submitButtonText || 'Submit',
              successMessage: fd.successMessage,
              nodeId: fd.nodeId,
            });
          } else if (m.sender !== 'user') {
            const newMessage: Message = {
              id: m.id,
              content: m.content,
              sender: m.sender === 'assistant' ? 'assistant' : m.sender === 'system' ? 'system' : 'user',
              createdAt: new Date(m.createdAt),
              status: 'delivered',
              quickReplies: extractQuickReplies(m.quickReplies, m.uiComponent),
              uiComponent: m.uiComponent,
              citations: m.citations,
            };
            set((state) => ({ messages: [...state.messages, newMessage] }));
          }
        }
      }
    } catch (err) {
      console.error('[Convia] Failed to submit form:', err);
      set({ isFormVisible: false, formData: null });
    }
  },

  // ============================================
  // PORTAL ACTIONS
  // ============================================

  navigatePortal: (view) => {
    set({ portalView: view });

    // Load data when navigating to certain views
    if (view === 'messages') {
      get().loadConversationsList();
    } else if (view === 'updates') {
      get().loadUpdates();
    } else if (view === 'help') {
      get().loadFaqs();
      get().loadUpdates();
    }
  },

  setPortalTab: (tab) => {
    set({ portalTab: tab });
    if (tab === 'home') {
      set({ portalView: 'home' });
    } else if (tab === 'messages') {
      set({ portalView: 'messages' });
      get().loadConversationsList();
    } else if (tab === 'help') {
      set({ portalView: 'help' });
      get().loadFaqs();
      get().loadUpdates();
    } else if (tab === 'changelog') {
      set({ portalView: 'updates' });
      get().loadUpdates();
    }
  },

  loadConversationsList: async () => {
    set({ conversationsLoading: true });
    try {
      const visitorId = getVisitorId();
      const result = await api.listConversations(visitorId);
      const sorted = [...result.conversations].sort((a, b) => {
        const dateA = new Date(a.lastMessageAt || a.updatedAt).getTime();
        const dateB = new Date(b.lastMessageAt || b.updatedAt).getTime();
        return dateB - dateA;
      });
      set({ conversationsList: sorted, conversationsLoading: false });
    } catch {
      set({ conversationsLoading: false });
    }
  },

  openConversation: async (id) => {
    set({ isLoading: true, portalView: 'messages:chat' });
    try {
      const response = await api.getConversation(id);
      const messages: Message[] = (response?.messages || []).map((m) => ({
        id: m.id,
        content: m.content,
        parts: m.parts,
        sender: m.sender,
        createdAt: new Date(m.createdAt),
        status: 'delivered' as const,
        quickReplies: extractQuickReplies(m.quickReplies, m.uiComponent),
        uiComponent: m.uiComponent,
        citations: m.citations,
      }));

      set({
        conversationId: id,
        messages,
        isLoading: false,
        hasEnded: false,
      });

      // Subscribe to realtime — isolated so failures don't break the conversation
      try {
        subscribeToConversation(id, {
          onMessage: (msg) => {
            if (msg.sender !== 'human_agent') return;
            const { messages: currentMessages } = get();
            if (currentMessages.some((m) => m.id === msg.id)) return;
            set((state) => ({
              messages: [...state.messages, {
                id: msg.id,
                content: msg.content,
                sender: 'assistant' as const,
                createdAt: new Date(msg.createdAt),
                status: 'delivered' as const,
              }],
            }));
          },
          onHandoff: ({ agentName }) => {
            set((state) => ({
              messages: [...state.messages, {
                id: `handoff_${Date.now()}`,
                content: `${agentName} joined the conversation`,
                sender: 'system' as const,
                createdAt: new Date(),
                status: 'delivered' as const,
              }],
            }));
          },
          onReturnToAI: ({ agentName }) => {
            set((state) => ({
              messages: [...state.messages, {
                id: `return_${Date.now()}`,
                content: `${agentName} left the conversation`,
                sender: 'system' as const,
                createdAt: new Date(),
                status: 'delivered' as const,
              }],
            }));
          },
        });
        startHeartbeat(id);
      } catch (realtimeErr) {
        console.warn('[Convia] Realtime setup failed (non-fatal):', realtimeErr);
      }
    } catch (err) {
      console.error('[Convia] Failed to load conversation:', err);
      // Stay on chat view with error message so user can go back
      set({
        isLoading: false,
        messages: [{
          id: `error_${Date.now()}`,
          content: 'Failed to load conversation. Please go back and try again.',
          sender: 'system' as const,
          createdAt: new Date(),
          status: 'delivered' as const,
        }],
      });
    }
  },

  startNewPortalConversation: async () => {
    const sessionId = newPortalSessionId();
    set({
      conversationId: null,
      messages: [],
      hasEnded: false,
      shopifyCart: null,
      portalView: 'messages:chat',
    });
    await get().startConversation(sessionId);
  },

  submitFeedback: async () => {
    const { feedbackRating, feedbackComment, conversationId } = get();
    if (feedbackRating === 0) return;

    set({ feedbackSubmitting: true });
    try {
      const visitorId = getVisitorId();
      const sessionId = newPortalSessionId();

      await api.submitFeedback({
        rating: feedbackRating,
        comment: feedbackComment || undefined,
        visitorId,
        sessionId,
        conversationId: conversationId || undefined,
      });

      set({
        feedbackSubmitting: false,
        feedbackSubmitted: true,
        portalView: 'feedback:success',
      });
    } catch {
      set({ feedbackSubmitting: false });
    }
  },

  searchKnowledge: async (query) => {
    set({ searchQuery: query, searchLoading: true });
    if (!query.trim()) {
      set({ searchResults: [], searchLoading: false });
      return;
    }
    try {
      const results = await api.searchKnowledge(query);
      set({ searchResults: results, searchLoading: false });
    } catch {
      set({ searchResults: [], searchLoading: false });
    }
  },

  loadUpdates: async () => {
    set({ updatesLoading: true });
    try {
      const updates = await api.getUpdates();
      set({ updates, updatesLoading: false });
    } catch {
      set({ updatesLoading: false });
    }
  },

  loadFaqs: async () => {
    set({ faqsLoading: true });
    try {
      const faqs = await api.getFaqs();
      set({ faqs, faqsLoading: false });
    } catch {
      set({ faqsLoading: false });
    }
  },

  setFeedbackRating: (rating) => set({ feedbackRating: rating }),
  setFeedbackComment: (comment) => set({ feedbackComment: comment }),
  setFeedbackEmail: (email) => set({ feedbackEmail: email }),
  setSelectedSearchResult: (result) => set({
    selectedSearchResult: result,
    portalView: result ? 'search:article' : 'search',
  }),
  setSelectedUpdateId: (id) => set({
    selectedUpdateId: id,
    portalView: id ? 'updates:detail' : 'updates',
  }),

  reset: () => {
    stopHeartbeat();
    unsubscribeFromConversation();
    set({
      isOpen: false,
      isMinimized: false,
      isExpanded: false,
      isLoading: false,
      isTyping: false,
      isUploading: false,
      uploadProgress: 0,
      error: null,
      conversationId: null,
      messages: [],
      hasEnded: false,
      shopifyCart: null,
      // Reset form state
      isFormVisible: false,
      formData: null,
      // Reset portal state
      portalView: 'home',
      portalTab: 'home',
      conversationsList: [],
      conversationsLoading: false,
      feedbackRating: 0,
      feedbackComment: '',
      feedbackEmail: '',
      feedbackSubmitting: false,
      feedbackSubmitted: false,
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      updates: [],
      updatesLoading: false,
      selectedUpdateId: null,
      selectedSearchResult: null,
      faqs: [],
      faqsLoading: false,
    });
  },
}));
