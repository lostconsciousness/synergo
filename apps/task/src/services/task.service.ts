import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { DeleteTaskDto } from '../dto/delete-task.dto';
import { MoveTaskDto } from '../dto/move-task.dto';
import { AssignTaskDto } from '../dto/assign-task.dto';
import { BoardService } from './board.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly boardService: BoardService,
  ) {}

  async createTask(dto: CreateTaskDto) {
    await this.boardService.hasPermission(dto.userId, dto.organizationId, 'task:create');

  const task = this.taskRepository.create({
    title: dto.title,
    description: dto.description,
    expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    columnId: dto.columnId,
    boardId: dto.boardId,
    tags: dto.tags ?? [],
    assigneeId: dto.assigneeId ?? null,
    position: await this.getNextPosition(dto.columnId),
  } as Partial<Task>);

    return await this.taskRepository.save(task);
  }

  async updateTask(dto: UpdateTaskDto) {
    await this.boardService.hasPermission(dto.userId, dto.organizationId, 'task:update');

    const task = await this.taskRepository.findOne({ where: { id: dto.taskId, boardId: dto.boardId } });
    if (!task) throw new NotFoundException('Task not found');

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.expiresAt !== undefined) task.expiresAt = new Date(dto.expiresAt);
    if (dto.tags !== undefined) task.tags = dto.tags;

    return await this.taskRepository.save(task);
  }

  async deleteTask(dto: DeleteTaskDto) {
    await this.boardService.hasPermission(dto.userId, dto.organizationId, 'task:delete');

    const task = await this.taskRepository.findOne({ where: { id: dto.taskId, boardId: dto.boardId } });
    if (!task) throw new NotFoundException('Task not found');

    await this.taskRepository.remove(task);
    return { message: 'Task deleted successfully' };
  }

  async moveTask(dto: MoveTaskDto) {
    await this.boardService.hasPermission(dto.userId, dto.organizationId, 'task:move');

    const task = await this.taskRepository.findOne({ where: { id: dto.taskId, boardId: dto.boardId } });
    if (!task) throw new NotFoundException('Task not found');

    task.columnId = dto.toColumnId;
    task.position = dto.newPosition;

    await this.reorderTasks(dto.toColumnId, dto.newPosition, dto.taskId);

    return await this.taskRepository.save(task);
  }

  async assignTask(dto: AssignTaskDto) {
    await this.boardService.hasPermission(dto.userId, dto.organizationId, 'task:assign');

    const task = await this.taskRepository.findOne({ where: { id: dto.taskId, boardId: dto.boardId } });
    if (!task) throw new NotFoundException('Task not found');

    task.assigneeId = dto.assigneeId;
    return await this.taskRepository.save(task);
  }

  async getTasks(columnId: string, userId: string, organizationId: string) {
    await this.boardService.hasPermission(userId, organizationId, 'task:read');

    return this.taskRepository.find({
      where: { columnId },
      order: { position: 'ASC' },
    });
  }

  private async getNextPosition(columnId: string): Promise<number> {
    const count = await this.taskRepository.count({ where: { columnId } });
    return count;
  }

  private async reorderTasks(columnId: string, newPos: number, movingTaskId: string) {
    const tasks = await this.taskRepository.find({
      where: { columnId },
      order: { position: 'ASC' },
    });

    let position = 0;
    for (const task of tasks) {
      if (task.id === movingTaskId) continue;
      if (position === newPos) position++;
      task.position = position++;
      await this.taskRepository.save(task);
    }
  }
}
