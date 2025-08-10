import { IsUUID, IsInt, Min } from 'class-validator';

export class MoveTaskDto {
  @IsUUID()
  taskId: string;

  @IsUUID()
  fromColumnId: string;

  @IsUUID()
  toColumnId: string;

  @IsUUID()
  boardId: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  userId: string;

  @IsInt()
  @Min(0)
  newPosition: number;
}
