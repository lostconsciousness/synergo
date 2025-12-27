import { IsNotEmpty, IsUUID, IsOptional, IsDateString, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ description: 'Название задачи' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Описание задачи', required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Дедлайн задачи', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ description: 'ID колонки' })
  @IsUUID()
  columnId: string;

  @ApiProperty({ description: 'ID доски' })
  @IsUUID()
  boardId: string;

  @ApiProperty({ description: 'Теги задачи', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ description: 'ID исполнителя', required: false })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}

