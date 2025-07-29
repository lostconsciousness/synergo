import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrganizationMember } from './organization-member.entity';

@Entity('organization_organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => OrganizationMember, member => member.organization, { cascade: true })
  members: OrganizationMember[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}