import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'test@email.com', description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'The password of the user' })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'The full name of the user', required: false })  
  @IsOptional()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'en', description: 'The language preference of the user', required: false })
  @IsOptional()
  @IsString()
  userLanguage?: string;

  @ApiProperty({ example: 'light', description: 'The color scheme preference of the user', required: false })
  @IsOptional()
  @IsString()
  userColorScheme?: string;
}