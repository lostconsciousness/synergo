import { IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveTaskDto {
  @ApiProperty({ description: 'ID задачи' })
  @IsUUID()
  taskId: string;

  @ApiProperty({ description: 'ID колонки назначения' })
  @IsUUID()
  toColumnId: string;

  @ApiProperty({ description: 'Новая позиция задачи' })
  @IsInt()
  @Min(0)
  newPosition: number;
}

