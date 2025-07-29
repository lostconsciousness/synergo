import {IsUUID, IsString, MinLength } from 'class-validator';

export class UpdateProfilePictureDto {
    @IsUUID()
    userId: string;

    @IsString()
    @MinLength(2)
    profilePicture: string;
}