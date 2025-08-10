import { IsUUID,IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class orgRefreshDto{
    @ApiProperty({ example: 'some_UUID', description: 'The ID of the users organization whose refresh token is to be used' })
    @IsUUID()
    @IsString()
    orgId: string;

    @ApiProperty({ example: 'org_refresh_token_value', description: 'The org refresh token of the user' })
    @IsString()
    refreshToken: string;
}