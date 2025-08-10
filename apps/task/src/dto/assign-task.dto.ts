import { IsUUID } from 'class-validator';

export class AssignTaskDto {
  @IsUUID()
  taskId: string;

  @IsUUID()
  boardId: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  assigneeId: string;
}
