import { IsArray, IsUUID } from "class-validator";

export class changeMemberRolesDto {
    @IsUUID()
    organizationId: string;

    @IsUUID()
    updatedById: string;

    @IsUUID()
    userId: string;

    @IsArray()
    @IsUUID('all', { each: true })
    roleIds: string[];
}