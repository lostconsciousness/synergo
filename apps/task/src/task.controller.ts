import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { BoardService } from './services/board.service';
import { ColumnService } from './services/column.service';
import { TaskService } from './services/task.service';

import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { DeleteColumnDto } from './dto/delete-column.dto';
import { MoveColumnDto } from './dto/move-column.dto';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { DeleteTaskDto } from './dto/delete-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { DeleteBoardDto } from './dto/delete-board.dto';

@Controller()
export class TaskController {
  constructor(
    private readonly boardService: BoardService,
    private readonly columnService: ColumnService,
    private readonly taskService: TaskService,
  ) {}


  @MessagePattern('board_create')
  async createBoard(@Payload() dto: CreateBoardDto) {
    return this.boardService.createBoard(dto);
  }

  @MessagePattern('board_getAll')
  async getBoards(@Payload() payload: { organizationId: string }) {
    return this.boardService.getBoards(payload.organizationId);
  }

  @MessagePattern('board_getById')
  async getBoardById(@Payload() payload: { boardId: string; organizationId: string }) {
    return this.boardService.getBoardById(payload.boardId, payload.organizationId);
  }

  @MessagePattern('board_update')
  async updateBoard(@Payload() dto: UpdateBoardDto) {
    return this.boardService.updateBoard(dto);
  }

  @MessagePattern('board_delete')
  async deleteBoard(@Payload() payload: DeleteBoardDto) {
    return this.boardService.deleteBoard(payload);
  }


  @MessagePattern('column_create')
  async createColumn(@Payload() dto: CreateColumnDto) {
    return this.columnService.createColumn(dto);
  }

  @MessagePattern('column_update')
  async updateColumn(@Payload() dto: UpdateColumnDto) {
    return this.columnService.updateColumn(dto);
  }

  @MessagePattern('column_delete')
  async deleteColumn(@Payload() dto: DeleteColumnDto) {
    return this.columnService.deleteColumn(dto);
  }

  @MessagePattern('column_move')
  async moveColumn(@Payload() dto: MoveColumnDto) {
    return this.columnService.moveColumn(dto);
  }

  @MessagePattern('column_getAll')
  async getColumns(@Payload() payload: { boardId: string; userId: string; organizationId: string }) {
    return this.columnService.getColumns(payload.boardId, payload.userId, payload.organizationId);
  }

  @MessagePattern('task_create')
  async createTask(@Payload() dto: CreateTaskDto) {
    return this.taskService.createTask(dto);
  }

  @MessagePattern('task_update')
  async updateTask(@Payload() dto: UpdateTaskDto) {
    return this.taskService.updateTask(dto);
  }

  @MessagePattern('task_delete')
  async deleteTask(@Payload() dto: DeleteTaskDto) {
    return this.taskService.deleteTask(dto);
  }

  @MessagePattern('task_move')
  async moveTask(@Payload() dto: MoveTaskDto) {
    return this.taskService.moveTask(dto);
  }

  @MessagePattern('task_assign')
  async assignTask(@Payload() dto: AssignTaskDto) {
    return this.taskService.assignTask(dto);
  }

  @MessagePattern('task_getByColumn')
  async getTasksByColumn(@Payload() payload: { columnId: string; userId: string; organizationId: string }) {
    return this.taskService.getTasks(payload.columnId, payload.userId, payload.organizationId);
  }
}
