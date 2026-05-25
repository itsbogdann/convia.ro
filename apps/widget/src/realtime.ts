import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;
let currentChannel: RealtimeChannel | null = null;
let currentConversationId: string | null = null;

/**
 * Initialize the Supabase client for realtime subscriptions.
 * Called once when the widget config is loaded.
 */
export function initRealtime(supabaseUrl: string, supabaseAnonKey: string) {
  if (supabaseClient) return;
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { heartbeatIntervalMs: 30000 },
  });
}

export interface RealtimeCallbacks {
  onMessage: (message: { id: string; content: string; sender: string; createdAt: string }) => void;
  onHandoff: (data: { agentName: string }) => void;
  onReturnToAI: (data: { agentName: string }) => void;
}

/**
 * Subscribe to a conversation channel and listen for realtime events.
 */
export function subscribeToConversation(
  conversationId: string,
  callbacks: RealtimeCallbacks,
) {
  // Don't double-subscribe
  if (currentConversationId === conversationId && currentChannel) return;

  // Clean up previous subscription
  unsubscribeFromConversation();

  if (!supabaseClient) return;

  const channelName = `private-conversation-${conversationId}`;
  const channel = supabaseClient.channel(channelName);

  channel.on('broadcast', { event: 'message:new' }, ({ payload }) => {
    if (payload) callbacks.onMessage(payload);
  });

  channel.on('broadcast', { event: 'conversation:handoff' }, ({ payload }) => {
    if (payload) callbacks.onHandoff({ agentName: payload.agentName || 'A support agent' });
  });

  channel.on('broadcast', { event: 'conversation:status' }, ({ payload }) => {
    if (payload?.returnedToAI) {
      callbacks.onReturnToAI({ agentName: payload.agentName || 'The support agent' });
    }
  });

  channel.subscribe();

  currentChannel = channel;
  currentConversationId = conversationId;
}

/**
 * Unsubscribe from the current conversation channel.
 */
export function unsubscribeFromConversation() {
  if (currentChannel && supabaseClient) {
    supabaseClient.removeChannel(currentChannel);
  }
  currentChannel = null;
  currentConversationId = null;
}
