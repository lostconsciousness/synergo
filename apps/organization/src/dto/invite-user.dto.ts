import { IsEmail, IsString, IsUUID } from 'class-validator';

export class InviteUserDto {
  @IsUUID()
  organizationId: string;

  @IsEmail()
  email: string;

  @IsUUID()
  invitedByUserId: string;
}
