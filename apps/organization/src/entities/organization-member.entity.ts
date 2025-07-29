import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Organization } from './organization.entity';
import { Role } from './role.entity';

@Entity('organization_organizations_members')
export class OrganizationMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Organization, org => org.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @Column()
    orgId: string;

    @Column()
    userId: string;

    @ManyToMany(() => Role, { eager: true })
    @JoinTable({ name: 'organization_member_roles' })
    roles: Role[];


    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    joinedAt: Date;
}