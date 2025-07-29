import { IsOptional, IsString, IsArray, IsUUID } from 'class-validator';

export class UpdateRoleDto {
    @IsUUID()
    organizationId: string;
    
    @IsUUID()
    updatedById: string;

    @IsUUID()
    roleId: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissionIds?: string[];
}
