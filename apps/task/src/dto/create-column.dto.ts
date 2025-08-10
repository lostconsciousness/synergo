import { IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';

export class CreateColumnDto {
  @IsNotEmpty()
  title: string;

  @IsUUID()
  boardId: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  userId: string;

  @IsInt()
  @Min(0)
  position: number;
}
