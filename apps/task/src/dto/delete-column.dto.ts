import { IsUUID } from 'class-validator';

export class DeleteColumnDto {
  @IsUUID()
  columnId: string;

  @IsUUID()
  boardId: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  userId: string;
}
