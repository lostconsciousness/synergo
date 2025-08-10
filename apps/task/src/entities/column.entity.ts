import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Board } from './board.entity';
import { Task } from './task.entity';

@Entity('columns')
export class ColumnEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'int' })
    position: number;

    @Column({ type: 'int', nullable: true })
    wipLimit?: number;

    @ManyToOne(() => Board, (board) => board.columns, { onDelete: 'CASCADE' })
    board: Board;

    @OneToMany(() => Task, (task) => task.column)
    tasks: Task[];
}
