import { IsUUID, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MinLength(2)
  password: string;
}
