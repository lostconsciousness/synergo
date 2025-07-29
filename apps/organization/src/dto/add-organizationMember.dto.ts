import { IsUUID, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class addOrganizationMemberDto {
    @IsUUID()
    @IsString()
    orgId: string;

    @IsUUID()
    @IsString() 
    userId: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    roleNames: string[];
}