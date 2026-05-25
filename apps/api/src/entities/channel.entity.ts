import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ChannelStatus, ChannelType } from '@convia/shared-types';
import { Agent } from './agent.entity';
import { Team } from './team.entity';

/**
 * A channel attaches an agent to a deployment surface.
 * One agent can have at most one channel per type (UNIQUE constraint).
 *
 * config payload by type:
 *   web:       { allowedDomains: ['shop.example.ro'] }
 *   whatsapp:  { phoneNumberId, businessAccountId, encryptedToken, displayName }
 */
@Entity('channels')
@Unique(['agentId', 'type'])
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid', { name: 'agent_id' })
  agentId!: string;

  @Index()
  @Column('uuid', { name: 'team_id' })
  teamId!: string;

  @Column({ type: 'enum', enum: ChannelType })
  type!: ChannelType;

  @Column({
    type: 'enum',
    enum: ChannelStatus,
    default: ChannelStatus.DISCONNECTED,
  })
  status!: ChannelStatus;

  @Column('jsonb', { default: () => "'{}'::jsonb" })
  config!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent?: Agent;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team?: Team;
}
