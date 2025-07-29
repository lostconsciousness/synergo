import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'test@email.com', description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'The password of the user' })
  @MinLength(6)
  password: string;
}
