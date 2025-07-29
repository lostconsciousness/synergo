import { IsUUID, IsString, MinLength } from 'class-validator';

export class UpdateLanguageDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MinLength(2)
  language: string;
}