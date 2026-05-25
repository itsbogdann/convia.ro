import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanId } from '@convia/shared-types';
import { TeamMember } from './team-member.entity';

/**
 * UI label: "Workspace". Code: "team".
 * Plan is text + CHECK constraint at the DB level so we can add values later
 * without an enum migration.
 */
@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  name!: string;

  @Index({ unique: true })
  @Column('text')
  slug!: string;

  @Column('text', { default: PlanId.GRATUIT })
  plan!: PlanId;

  @Column('jsonb', { default: () => "'{}'::jsonb" })
  settings!: TeamSettings;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => TeamMember, (member) => member.team)
  members?: TeamMember[];
}

export interface TeamSettings {
  defaultLanguage?: 'ro' | 'en';
  brandColor?: string;
  industry?: string;
  companyLegalName?: string;
  cui?: string;
  registrationNumber?: string;
}
