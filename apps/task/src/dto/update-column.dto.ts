import { IsOptional, IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';

export class UpdateColumnDto {
  @IsUUID()
  columnId: string;

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
  @IsInt()
  @Min(0)
  position?: number;
}
