/**
 * Shared realtime event constants.
 * Used by both PusherService and SupabaseRealtimeService.
 */
export const RealtimeEvents = {
  // Conversation events
  CONVERSATION_STARTED: 'conversation:started',
  CONVERSATION_ENDED: 'conversation:ended',
  CONVERSATION_HANDOFF: 'conversation:handoff',
  CONVERSATION_STATUS_CHANGED: 'conversation:status',

  // Message events
  MESSAGE_NEW: 'message:new',
  TYPING_START: 'typing:start',
  TYPING_END: 'typing:end',
  MESSAGE_REACTION: 'message:reaction',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',

  // Agent events
  AGENT_UPDATED: 'agent:updated',
  AGENT_STATUS_CHANGED: 'agent:status',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',

  // Visitor events
  VISITOR_PRESENCE: 'visitor:presence',

  // Team events
  MEMBER_JOINED: 'member:joined',
  MEMBER_REMOVED: 'member:removed',
  OWNERSHIP_TRANSFERRED: 'ownership:transferred',
} as const;
