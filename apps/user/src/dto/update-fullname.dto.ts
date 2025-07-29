import { IsUUID, IsString, MinLength } from 'class-validator';

export class UpdateFullNameDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MinLength(2)
  fullName: string;
}
