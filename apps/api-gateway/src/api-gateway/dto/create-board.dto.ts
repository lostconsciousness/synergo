import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({ description: 'Название доски' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'ID организации' })
  @IsUUID()
  organizationId: string;
}

