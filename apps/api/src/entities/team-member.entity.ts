import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { TeamRole } from '@convia/shared-types';
import { Team } from './team.entity';
import { Profile } from './profile.entity';

/**
 * Membership row: pairs a Profile with a Team and a role.
 * For role=human_agent, the `assignedAgentIds` array scopes which bots the
 * user can see in the inbox (empty array = all bots in the team).
 */
@Entity('team_members')
@Unique(['teamId', 'userId'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid', { name: 'team_id' })
  teamId!: string;

  @Index()
  @Column('uuid', { name: 'user_id' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: TeamRole,
    default: TeamRole.DEVELOPER,
  })
  role!: TeamRole;

  @Column('uuid', { name: 'assigned_agent_ids', array: true, default: () => "'{}'::uuid[]" })
  assignedAgentIds!: string[];

  @Column('uuid', { name: 'invited_by', nullable: true })
  invitedBy!: string | null;

  @Column({ name: 'invited_at', type: 'timestamptz', default: () => 'NOW()' })
  invitedAt!: Date;

  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true })
  acceptedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team?: Team;

  @ManyToOne(() => Profile, (profile) => profile.teamMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: Profile;
}
