import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';
import { Organization } from './organization.entity';
import { ManyToOne, JoinColumn } from 'typeorm';

@Entity('organization_roles')
export class Role {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true })
  orgId: string;

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable()
  permissions: Permission[];
}
