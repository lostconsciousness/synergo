import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { OrgAccessGuard } from '../guards/jwt-org.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtPayload } from 'jsonwebtoken';
import { rmqTaskClient } from '../clients/task.client';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { CreateColumnDto } from '../dto/create-column.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { MoveTaskDto } from '../dto/move-task.dto';
import { AssignTaskDto } from '../dto/assign-task.dto';

@ApiTags('Boards')
@Controller('organization/:organizationId/boards')
export class BoardController {
  constructor() {}

  @Post()
  @ApiOperation({ summary: 'Создать новую доску' })
  @ApiResponse({ status: 201, description: 'Доска успешно создана' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async createBoard(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateBoardDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('board_create', {
        ...dto,
        organizationId,
        createdBy: user.id,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Create board failed');
      }
      
      return result;
    } catch (error) {
      console.error('Create board error: ', error);
      throw new InternalServerErrorException(error.message || 'Create board failed');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Получить все доски организации' })
  @ApiResponse({ status: 200, description: 'Список досок' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async getBoards(@Param('organizationId') organizationId: string) {
    await rmqTaskClient.connect();
    try {
      const result = await Promise.race([
        rmqTaskClient.send('board_getAll', { organizationId }).toPromise(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]) as any;
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Get boards failed');
      }
      
      return result || [];
    } catch (error) {
      console.error('Get boards error: ', error);
      if (error.message === 'Request timeout') {
        throw new InternalServerErrorException('Task service is not responding. Please check if task-service is running.');
      }
      throw new InternalServerErrorException(error.message || 'Get boards failed');
    }
  }

  @Get(':boardId')
  @ApiOperation({ summary: 'Получить доску по ID' })
  @ApiResponse({ status: 200, description: 'Доска найдена' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async getBoardById(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('board_getById', { boardId, organizationId }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Get board failed');
      }
      
      return result;
    } catch (error) {
      console.error('Get board error: ', error);
      throw new InternalServerErrorException(error.message || 'Get board failed');
    }
  }

  @Patch(':boardId')
  @ApiOperation({ summary: 'Обновить доску' })
  @ApiResponse({ status: 200, description: 'Доска обновлена' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async updateBoard(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
    @Body() dto: UpdateBoardDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('board_update', {
        ...dto,
        boardId,
        organizationId,
        updatedById: user.id,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Update board failed');
      }
      
      return result;
    } catch (error) {
      console.error('Update board error: ', error);
      throw new InternalServerErrorException(error.message || 'Update board failed');
    }
  }

  @Delete(':boardId')
  @ApiOperation({ summary: 'Удалить доску' })
  @ApiResponse({ status: 200, description: 'Доска удалена' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async deleteBoard(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('board_delete', {
        boardId,
        organizationId,
        deletedById: user.id,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Delete board failed');
      }
      
      return result;
    } catch (error) {
      console.error('Delete board error: ', error);
      throw new InternalServerErrorException(error.message || 'Delete board failed');
    }
  }

  // Columns endpoints
  @Post(':boardId/columns')
  @ApiOperation({ summary: 'Создать новую колонку' })
  @ApiResponse({ status: 201, description: 'Колонка создана' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async createColumn(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
    @Body() dto: CreateColumnDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('column_create', {
        ...dto,
        boardId,
        organizationId,
        userId: user.id,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Create column failed');
      }
      
      return result;
    } catch (error) {
      console.error('Create column error: ', error);
      throw new InternalServerErrorException(error.message || 'Create column failed');
    }
  }

  @Get(':boardId/columns')
  @ApiOperation({ summary: 'Получить все колонки доски' })
  @ApiResponse({ status: 200, description: 'Список колонок' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async getColumns(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('column_getAll', {
        boardId,
        userId: user.id,
        organizationId,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Get columns failed');
      }
      
      return result;
    } catch (error) {
      console.error('Get columns error: ', error);
      throw new InternalServerErrorException(error.message || 'Get columns failed');
    }
  }

  @Patch(':boardId/columns/:columnId')
  @ApiOperation({ summary: 'Обновить колонку' })
  @ApiResponse({ status: 200, description: 'Колонка обновлена' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async updateColumn(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() dto: { title?: string; position?: number },
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('column_update', {
        columnId,
        boardId,
        organizationId,
        userId: user.id,
        ...dto,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Update column failed');
      }
      
      return result;
    } catch (error) {
      console.error('Update column error: ', error);
      throw new InternalServerErrorException(error.message || 'Update column failed');
    }
  }

  @Delete(':boardId/columns/:columnId')
  @ApiOperation({ summary: 'Удалить колонку' })
  @ApiResponse({ status: 200, description: 'Колонка удалена' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async deleteColumn(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('column_delete', {
        columnId,
        boardId,
        organizationId,
        userId: user.id,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Delete column failed');
      }
      
      return result;
    } catch (error) {
      console.error('Delete column error: ', error);
      throw new InternalServerErrorException(error.message || 'Delete column failed');
    }
  }

  // Tasks endpoints
  @Post(':boardId/tasks')
  @ApiOperation({ summary: 'Создать новую задачу' })
  @ApiResponse({ status: 201, description: 'Задача создана' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async createTask(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('task_create', {
        ...dto,
        boardId,
        organizationId,
        userId: user.id,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Create task failed');
      }
      
      return result;
    } catch (error) {
      console.error('Create task error: ', error);
      throw new InternalServerErrorException(error.message || 'Create task failed');
    }
  }

  @Get(':boardId/columns/:columnId/tasks')
  @ApiOperation({ summary: 'Получить все задачи колонки' })
  @ApiResponse({ status: 200, description: 'Список задач' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async getTasks(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('task_getByColumn', {
        columnId,
        userId: user.id,
        organizationId,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Get tasks failed');
      }
      
      return result;
    } catch (error) {
      console.error('Get tasks error: ', error);
      throw new InternalServerErrorException(error.message || 'Get tasks failed');
    }
  }

  @Patch(':boardId/tasks/:taskId')
  @ApiOperation({ summary: 'Обновить задачу' })
  @ApiResponse({ status: 200, description: 'Задача обновлена' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async updateTask(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('task_update', {
        ...dto,
        taskId,
        boardId,
        organizationId,
        userId: user.id,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Update task failed');
      }
      
      return result;
    } catch (error) {
      console.error('Update task error: ', error);
      throw new InternalServerErrorException(error.message || 'Update task failed');
    }
  }

  @Post(':boardId/tasks/:taskId/move')
  @ApiOperation({ summary: 'Переместить задачу' })
  @ApiResponse({ status: 200, description: 'Задача перемещена' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async moveTask(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
    @Param('taskId') taskId: string,
    @Body() dto: MoveTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      // Получаем доску, чтобы найти текущую колонку задачи
      const boardResult = await rmqTaskClient.send('board_getById', { boardId, organizationId }).toPromise();
      if (!boardResult || boardResult.status === 'error') {
        throw new InternalServerErrorException('Board not found');
      }
      
      // Находим задачу во всех колонках доски
      let fromColumnId = '';
      for (const column of (boardResult.columns || [])) {
        const tasks = await rmqTaskClient.send('task_getByColumn', {
          columnId: column.id,
          userId: user.id,
          organizationId,
        }).toPromise();
        
        if (tasks && Array.isArray(tasks)) {
          const task = tasks.find((t: any) => t.id === taskId);
          if (task) {
            fromColumnId = column.id;
            break;
          }
        }
      }
      
      if (!fromColumnId) {
        throw new InternalServerErrorException('Task not found in board');
      }
      
      const result = await rmqTaskClient.send('task_move', {
        taskId,
        fromColumnId,
        toColumnId: dto.toColumnId,
        newPosition: dto.newPosition,
        boardId,
        organizationId,
        userId: user.id,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Move task failed');
      }
      
      return result;
    } catch (error) {
      console.error('Move task error: ', error);
      throw new InternalServerErrorException(error.message || 'Move task failed');
    }
  }

  @Post(':boardId/tasks/:taskId/assign')
  @ApiOperation({ summary: 'Назначить исполнителя задачи' })
  @ApiResponse({ status: 200, description: 'Исполнитель назначен' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async assignTask(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
    @Param('taskId') taskId: string,
    @Body() dto: AssignTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('task_assign', {
        taskId,
        boardId,
        organizationId,
        userId: user.id,
        assigneeId: dto.assigneeId,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Assign task failed');
      }
      
      return result;
    } catch (error) {
      console.error('Assign task error: ', error);
      throw new InternalServerErrorException(error.message || 'Assign task failed');
    }
  }

  @Delete(':boardId/tasks/:taskId')
  @ApiOperation({ summary: 'Удалить задачу' })
  @ApiResponse({ status: 200, description: 'Задача удалена' })
  @UseGuards(JwtAuthGuard, OrgAccessGuard)
  async deleteTask(
    @Param('organizationId') organizationId: string,
    @Param('boardId') boardId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await rmqTaskClient.connect();
    try {
      const result = await rmqTaskClient.send('task_delete', {
        taskId,
        boardId,
        organizationId,
        userId: user.id,
      }).toPromise();
      
      if (result && result.status === 'error') {
        throw new InternalServerErrorException(result.message || 'Delete task failed');
      }
      
      return result;
    } catch (error) {
      console.error('Delete task error: ', error);
      throw new InternalServerErrorException(error.message || 'Delete task failed');
    }
  }
}

