import { ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../entities/board.entity';
import { ColumnEntity } from '../entities/column.entity';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { ClientProxy } from '@nestjs/microservices';
import { DeleteBoardDto } from '../dto/delete-board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
    @Inject("ORG_SERVICE")
    private readonly orgClient: ClientProxy
  ) {}

  async hasPermission(
    userId: string,
    organizationId: string,
    permission: string
  ): Promise<boolean> {
    try {
      const result = await this.orgClient
        .send<boolean>('organization_hasPermission', {
          userId,
          organizationId,
          permission,
        })
        .toPromise();

      if (!result) {
        throw new ForbiddenException('You do not have permission to perform this action');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('RPC error while checking permissions:', error);
      throw new InternalServerErrorException('Failed to verify permissions');
    }
  }

  async createBoard(dto: CreateBoardDto): Promise<Board> {
    await this.hasPermission(dto.createdBy, dto.organizationId, "board:create")

    const board = this.boardRepository.create({
      title: dto.title,
      organizationId: dto.organizationId,
      createdBy: dto.createdBy,
    });

    const savedBoard = await this.boardRepository.save(board);

    const defaultColumns = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 },
    ];

    const columns = defaultColumns.map((col) =>
      this.columnRepository.create({ ...col, board: savedBoard }),
    );

    await this.columnRepository.save(columns);

    return { ...savedBoard, columns };
  }

  async getBoards(organizationId: string): Promise<Board[]> {
    return this.boardRepository.find({
      where: { organizationId },
      relations: ['columns'],
      order: { createdAt: 'ASC' },
    });
  }

  async getBoardById(boardId: string, organizationId: string): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId, organizationId },
      relations: ['columns'],
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async updateBoard(dto: UpdateBoardDto): Promise<Board> {
    await this.hasPermission(dto.updatedById, dto.organizationId, 'board:update');

    const board = await this.getBoardById(dto.boardId, dto.organizationId);
    board.title = dto.title ?? board.title;
    board.pinned = dto.pinned ?? board.pinned;

    return await this.boardRepository.save(board);
  }

  async deleteBoard(dto: DeleteBoardDto): Promise<{ message: string }> {
    await this.hasPermission(dto.deletedById, dto.organizationId, 'board:delete')

    const board = await this.getBoardById(dto.boardId, dto.organizationId);
    board.isActive = false;
    await this.boardRepository.save(board)

    return { message: 'Board deleted successfully' };
  }
}
