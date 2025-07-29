import { IsString, IsUUID } from "class-validator";

export class UserNotifyDto {
    @IsUUID()
    userId: string;

    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsUUID()
    token: string;
}