import { IsEmail } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
    @ApiProperty({ example: 'test@email.com', description: 'The email of the user' })
    @IsEmail()
    email: string;
}