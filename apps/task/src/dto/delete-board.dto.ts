import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteBoardDto {
  @IsUUID()
  boardId: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  deletedById: string;
}
