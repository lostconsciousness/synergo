import { IsUUID, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';

export class UpdateTaskDto {
  @IsUUID()
  taskId: string;

  @IsUUID()
  boardId: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  tags?: string[];
}
