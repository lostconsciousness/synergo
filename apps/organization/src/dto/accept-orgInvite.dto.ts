import { IsUUID } from "class-validator";

export class AcceptOrgInviteDto {
    @IsUUID()
    userId: string;

    @IsUUID()
    token: string;
}