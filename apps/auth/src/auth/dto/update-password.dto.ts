import { IsUUID, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    @IsUUID()
    userId: string;

    @IsString()
    @MinLength(6)
    newPassword: string;
}