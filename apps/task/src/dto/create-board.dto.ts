import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty()
  title: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  createdBy: string;
}
