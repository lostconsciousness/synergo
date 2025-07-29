import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
export class LogoutDto {
    @IsUUID()
    @ApiProperty({ example: 'some_UUID', description: 'The ID of the user who is logging out' })
    userId: string;
}