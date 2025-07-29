import { IsUUID, IsString, MinLength } from 'class-validator';

export class UpdateColorSchemeDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MinLength(2)
  colorScheme: string;
}