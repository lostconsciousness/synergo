import { IsUUID, IsInt, Min } from 'class-validator';

export class MoveColumnDto {
  @IsUUID()
  columnId: string;

  @IsUUID()
  boardId: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  userId: string;

  @IsInt()
  @Min(0)
  newPosition: number;
}
