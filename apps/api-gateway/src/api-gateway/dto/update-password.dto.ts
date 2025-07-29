import { IsUUID, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({example: "New password", description: 'The new password of the user' })
  @IsString()
  @MinLength(2)
  newPassword: string;
}
