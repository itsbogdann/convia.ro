import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TeamMember } from './team-member.entity';

/**
 * Mirrors the `profiles` table in Supabase, which extends `auth.users`.
 * The `id` matches `auth.users.id` (UUID).
 */
@Entity('profiles')
export class Profile {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('text')
  email!: string;

  @Column('text', { name: 'full_name', nullable: true })
  fullName!: string | null;

  @Column('text', { name: 'avatar_url', nullable: true })
  avatarUrl!: string | null;

  @Column('text', { default: 'ro' })
  locale!: 'ro' | 'en';

  @Column('jsonb', { default: () => "'{}'::jsonb" })
  preferences!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => TeamMember, (member) => member.user)
  teamMemberships?: TeamMember[];
}
