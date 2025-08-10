import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ColumnEntity } from './column.entity';

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'timestamp', nullable: true })
    expiresAt?: Date;

    @Column({ type: 'uuid', nullable: true })
    assigneeId?: string;

    @Column({ type: 'uuid' })
    boardId: string;

    @ManyToOne(() => ColumnEntity, (column) => column.tasks, { onDelete: 'CASCADE' })
    column: ColumnEntity;

    @Column({ type: 'uuid' })
    columnId: string;

    @Column({ type: 'int' })
    position: number;

    @Column({ type: 'varchar', nullable: true })
    priority?: 'low' | 'medium' | 'high';

    @Column('text', { array: true, default: '{}' })
    tags: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
