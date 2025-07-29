import { IsUUID, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateColorSchemeDto {
  @ApiProperty({example: "New color scheme", description: 'The new color scheme of the user' })
  @IsString()
  @MinLength(2)
  newColorScheme: string;
}