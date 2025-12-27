import { IsUUID, IsOptional, IsNotEmpty, IsDateString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiProperty({ description: 'Название задачи', required: false })
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ description: 'Описание задачи', required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Дедлайн задачи', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ description: 'Теги задачи', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

