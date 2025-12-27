import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBoardDto {
  @ApiProperty({ description: 'Название доски', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Закрепить доску', required: false })
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}

