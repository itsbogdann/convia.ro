import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { RealtimeEvents } from './realtime-events';
import { PusherEvent } from './pusher.service';

/**
 * Supabase Realtime Service
 *
 * Drop-in replacement for PusherService using Supabase Realtime Broadcast.
 * Implements the same public API so callers need zero changes.
 */
@Injectable()
export class SupabaseRealtimeService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseRealtimeService.name);
  private _isConfigured = false;

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    this.tryInit();
  }

  private tryInit(): boolean {
    if (this._isConfigured) return true;
    try {
      const client = this.supabaseService.getClient();
      if (!client) return false;
      this._isConfigured = true;
      this.logger.log('Supabase Realtime Service initialized');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Trigger a single event via Supabase Realtime Broadcast
   */
  async trigger(
    channel: string,
    event: string,
    data: Record<string, any>,
  ): Promise<void> {
    if (!this._isConfigured && !this.tryInit()) {
      this.logger.debug('Supabase Realtime not initialized, skipping event');
      return;
    }

    try {
      const client = this.supabaseService.getClient();
      const ch = client.channel(channel);

      await ch.send({
        type: 'broadcast',
        event,
        payload: data,
      });

      // Clean up channel after sending
      await client.removeChannel(ch);
    } catch (error) {
      this.logger.debug(`Supabase Realtime event failed: ${error.message}`);
    }
  }

  /**
   * Trigger multiple events
   */
  async triggerBatch(events: PusherEvent[]): Promise<void> {
    if (!this._isConfigured && !this.tryInit()) return;

    for (const event of events) {
      await this.trigger(event.channel, event.name, event.data);
    }
  }

  // ============================================
  // CHANNEL HELPERS
  // ============================================

  getTeamChannel(teamId: string): string {
    return `private-team-${teamId}`;
  }

  getConversationChannel(conversationId: string): string {
    return `private-conversation-${conversationId}`;
  }

  getUserChannel(userId: string): string {
    return `private-user-${userId}`;
  }

  getWidgetChannel(agentId: string, sessionId: string): string {
    return `presence-widget-${agentId}-${sessionId}`;
  }

  // ============================================
  // HIGH-LEVEL EVENT METHODS
  // ============================================

  async triggerTeamEvent(
    teamId: string,
    event: string,
    data: Record<string, any>,
  ): Promise<void> {
    await this.trigger(this.getTeamChannel(teamId), event, data);
  }

  async triggerConversationEvent(
    conversationId: string,
    event: string,
    data: Record<string, any>,
  ): Promise<void> {
    await this.trigger(this.getConversationChannel(conversationId), event, data);
  }

  async triggerUserNotification(
    userId: string,
    notification: {
      type: string;
      title: string;
      body?: string;
      link?: string;
      data?: Record<string, any>;
    },
  ): Promise<void> {
    await this.trigger(this.getUserChannel(userId), 'notification:new', notification);
  }

  async triggerWidgetEvent(
    agentId: string,
    sessionId: string,
    event: string,
    data: Record<string, any>,
  ): Promise<void> {
    await this.trigger(this.getWidgetChannel(agentId, sessionId), event, data);
  }

  async sendTypingIndicator(
    conversationId: string,
    isTyping: boolean,
    sender: 'assistant' | 'human_agent',
  ): Promise<void> {
    await this.triggerConversationEvent(
      conversationId,
      isTyping ? 'typing:start' : 'typing:end',
      { sender },
    );
  }

  async sendMessageNotification(
    conversationId: string,
    message: {
      id: string;
      content: string;
      sender: string;
      createdAt: Date;
    },
  ): Promise<void> {
    await this.triggerConversationEvent(conversationId, 'message:new', message);
  }

  // ============================================
  // EVENT CONSTANTS
  // ============================================

  static readonly Events = RealtimeEvents;
}
