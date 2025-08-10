import { IsNotEmpty, IsUUID, IsOptional, IsDateString, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsUUID()
  columnId: string;

  @IsUUID()
  boardId: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  tags?: string[];

  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}
