import { IsString, IsUUID } from 'class-validator';

export class SelectCurrentOrganizationDto { 
    @IsString()
    @IsUUID()
    userId: string;

    @IsString()
    @IsUUID()
    orgId: string 
}