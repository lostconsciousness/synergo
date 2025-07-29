import { IsUUID, IsString, IsArray, ArrayNotEmpty } from "class-validator";

export class CreateRoleDto {
    @IsUUID()
    @IsString()
    userId: string;

    @IsUUID()
    @IsString()
    orgId: string;

    @IsString()
    name: string;

    @IsArray()
    @ArrayNotEmpty()
    permissionNames: string[];
}