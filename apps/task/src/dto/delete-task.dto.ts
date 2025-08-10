import { IsUUID } from 'class-validator';

export class DeleteTaskDto {
  @IsUUID()
  taskId: string;

  @IsUUID()
  boardId: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  userId: string;
}
