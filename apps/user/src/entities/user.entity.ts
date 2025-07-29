import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user_users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fullName: string;

    @Column({ unique: true })
    email: string;

    @Column({ default: 'user' })
    role: string;

    @Column({default: 'en'})
    language: string;

    @Column({ default: 'light' })
    colorScheme: string;

    @Column({ nullable: true })
    profilePicture: string;

    @Column({ type: 'uuid', nullable: true, default: null })
    currentOrganizationId: string | null;
}