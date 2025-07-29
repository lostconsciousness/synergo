import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfilePictureDto {
  @ApiProperty({example: "New profile picture", description: 'The new profile picture of the user' })
  @IsString()
  @MinLength(2)
  newProfilePicture: string;
}