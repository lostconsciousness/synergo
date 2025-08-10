import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ColumnEntity } from './column.entity';

@Entity('boards')
export class Board {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    organizationId: string;

    @Column()
    title: string;

    @Column({default: false})
    pinned: boolean;

    @Column({ type: 'uuid' })
    createdBy: string;

    @OneToMany(() => ColumnEntity, (column) => column.board, { cascade: true })
    columns: ColumnEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({default: true})
    isActive: boolean;
}