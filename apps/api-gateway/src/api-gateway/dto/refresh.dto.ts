import { IsUUID, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
    @ApiProperty({ example: 'some_UUID', description: 'The ID of the user whose refresh token is to be used' })
    @IsUUID()
    userId: string;

    @ApiProperty({ example: 'refresh_token_value', description: 'The refresh token of the user' })
    @IsString()
    refreshToken: string;
}