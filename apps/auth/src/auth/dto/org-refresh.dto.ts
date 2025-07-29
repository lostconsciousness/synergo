import { IsUUID,IsString } from "class-validator";

export class orgRefreshDto{
    @IsString()
    @IsUUID()
    userId: string;

    @IsUUID()
    @IsString()
    orgId: string;

    @IsString()
    refreshToken: string;
}