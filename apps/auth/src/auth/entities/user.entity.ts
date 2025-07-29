import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('auth_users')
export class AuthUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    userId: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;
}