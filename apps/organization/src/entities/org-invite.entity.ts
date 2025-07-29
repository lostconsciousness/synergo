import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('organization_org_invites')
export class OrgInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, org => org.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
  
  @Column()
  organizationId: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  invitedByUserId: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'enum', enum: ['pending', 'accepted', 'declined'], default: 'pending' })
  status: 'pending' | 'accepted' | 'declined';

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  declinedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
