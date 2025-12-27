import { IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({ description: 'Название колонки' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'ID доски' })
  @IsUUID()
  boardId: string;

  @ApiProperty({ description: 'Позиция колонки' })
  @IsInt()
  @Min(0)
  position: number;
}

