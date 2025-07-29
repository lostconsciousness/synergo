import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
export class RegisterDto {
    @IsUUID()
    userId: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    fullName: string;

    @IsOptional()
    @IsString()
    userLanguage?: string;

    @IsOptional()
    @IsString()
    userColorScheme?: string;
}
