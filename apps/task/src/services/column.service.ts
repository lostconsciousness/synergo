import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnEntity } from '../entities/column.entity';
import { CreateColumnDto } from '../dto/create-column.dto';
import { UpdateColumnDto } from '../dto/update-column.dto';
import { DeleteColumnDto } from '../dto/delete-column.dto';
import { MoveColumnDto } from '../dto/move-column.dto';
import { BoardService } from './board.service';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
    private readonly boardService: BoardService,
  ) {}

  async createColumn(dto: CreateColumnDto) {
    await this.boardService.hasPermission(dto.userId, dto.organizationId, 'column:create');

    const column = this.columnRepository.create({
      title: dto.title,
      position: dto.position,
      board: { id: dto.boardId } as any,
    });

    return await this.columnRepository.save(column);
  }

  async updateColumn(dto: UpdateColumnDto) {
    await this.boardService.hasPermission(dto.userId, dto.organizationId, 'column:update');

    const column = await this.columnRepository.findOne({ where: { id: dto.columnId, board: { id: dto.boardId } } });
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    if (dto.title !== undefined) column.title = dto.title;
    if (dto.position !== undefined) column.position = dto.position;

    return await this.columnRepository.save(column);
  }

  async deleteColumn(dto: DeleteColumnDto) {
    await this.boardService.hasPermission(dto.userId, dto.organizationId, 'column:delete');

    const column = await this.columnRepository.findOne({ where: { id: dto.columnId, board: { id: dto.boardId } } });
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    await this.columnRepository.remove(column);
    return { message: 'Column deleted successfully' };
  }

  async moveColumn(dto: MoveColumnDto) {
    await this.boardService.hasPermission(dto.userId, dto.organizationId, 'column:update');

    const column = await this.columnRepository.findOne({ where: { id: dto.columnId, board: { id: dto.boardId } } });
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    column.position = dto.newPosition;
    return await this.columnRepository.save(column);
  }

  async getColumns(boardId: string, userId: string, organizationId: string) {
    await this.boardService.hasPermission(userId, organizationId, 'column:read');

    return this.columnRepository.find({
      where: { board: { id: boardId } },
      order: { position: 'ASC' },
    });
  }
}
