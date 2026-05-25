/**
 * Convia entity registry.
 *
 * Entities are added here as feature modules are built out under Path B.
 * Keep this list aligned with the SQL schema in supabase/migrations/.
 */

import { Profile } from './profile.entity';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { Agent } from './agent.entity';
import { Channel } from './channel.entity';
import { KnowledgeBase } from './knowledge-base.entity';
import { Document } from './document.entity';
import { DocumentChunk } from './document-chunk.entity';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { Subscription } from './subscription.entity';
import { UsagePeriod } from './usage-period.entity';
import { BillingEventLog } from './billing-event-log.entity';
import { NotificationLog } from './notification-log.entity';

export {
  Profile,
  Team,
  TeamMember,
  Agent,
  Channel,
  KnowledgeBase,
  Document,
  DocumentChunk,
  Conversation,
  Message,
  Subscription,
  UsagePeriod,
  BillingEventLog,
  NotificationLog,
};

export const entities = [
  Profile,
  Team,
  TeamMember,
  Agent,
  Channel,
  KnowledgeBase,
  Document,
  DocumentChunk,
  Conversation,
  Message,
  Subscription,
  UsagePeriod,
  BillingEventLog,
  NotificationLog,
];
