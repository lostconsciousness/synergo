import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTaskDto {
  @ApiProperty({ description: 'ID задачи' })
  @IsUUID()
  taskId: string;

  @ApiProperty({ description: 'ID исполнителя' })
  @IsUUID()
  assigneeId: string;
}

