import { IsUUID, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLanguageDto {
  @ApiProperty({example: "New Language", description: 'The new Language of the user' })
  @IsString()
  @MinLength(2)
  newLanguage: string;
}