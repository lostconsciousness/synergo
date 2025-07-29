import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    fullName: string;

    @IsEmail()
    @IsString()
    email: string;

    @IsOptional()
    language?: string;

    @IsOptional()
    colorScheme?: string;
}