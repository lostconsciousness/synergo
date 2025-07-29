import { IsUUID, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFullNameDto {
  @ApiProperty({example: "some_UUID", description: 'The ID of the user whose full name is to be updated' })
  @IsUUID()
  userId: string;

  @ApiProperty({example: "New FullName", description: 'The new full name of the user' })
  @IsString()
  @MinLength(2)
  fullName: string;
}
