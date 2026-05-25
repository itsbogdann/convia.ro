import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher = require('pusher');
import { RealtimeEvents } from './realtime-events';

export interface PusherEvent {
  channel: string;
  name: string; // Pusher requires 'name' for batch events
  data: Record<string, any>;
}

@Injectable()
export class PusherService implements OnModuleInit {
  private pusher: Pusher | null = null;
  private readonly logger = new Logger(PusherService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const appId = this.configService.get<string>('pusher.appId');
    const key = this.configService.get<string>('pusher.key');
    const secret = this.configService.get<string>('pusher.secret');
    const cluster = this.configService.get<string>('pusher.cluster') || 'us2';

    if (!appId || !key || !secret) {
      this.logger.warn('Pusher not configured - real-time features disabled');
      return;
    }

    this.pusher = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });

    this.logger.log('Pusher initialized');
  }

  /**
   * Trigger a single event
   */
  async trigger(
    channel: string,
    event: string,
    data: Record<string, any>,
  ): Promise<void> {
    if (!this.pusher) {
      this.logger.debug('Pusher not initialized, skipping event');
      return;
    }

    try {
      await this.pusher.trigger(channel, event, data);
    } catch (error) {
      // Only log once per session to avoid spam
      this.logger.debug(`Pusher event failed (check credentials): ${error.message}`);
    }
  }

  /**
   * Trigger multiple events in a batch
   */
  async triggerBatch(events: PusherEvent[]): Promise<void> {
    if (!this.pusher) {
      this.logger.debug('Pusher not initialized, skipping batch events');
      return;
    }

    try {
      await this.pusher.triggerBatch(events);
    } catch (error) {
      this.logger.error(`Failed to trigger Pusher batch: ${error.message}`);
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

  /**
   * Trigger team event (notifies all team members)
   */
  async triggerTeamEvent(
    teamId: string,
    event: string,
    data: Record<string, any>,
  ): Promise<void> {
    await this.trigger(this.getTeamChannel(teamId), event, data);
  }

  /**
   * Trigger conversation event (for live conversation view)
   */
  async triggerConversationEvent(
    conversationId: string,
    event: string,
    data: Record<string, any>,
  ): Promise<void> {
    await this.trigger(this.getConversationChannel(conversationId), event, data);
  }

  /**
   * Trigger user notification
   */
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

  /**
   * Trigger widget event (for chat widget)
   */
  async triggerWidgetEvent(
    agentId: string,
    sessionId: string,
    event: string,
    data: Record<string, any>,
  ): Promise<void> {
    await this.trigger(this.getWidgetChannel(agentId, sessionId), event, data);
  }

  /**
   * Send typing indicator
   */
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

  /**
   * Send new message notification
   */
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
