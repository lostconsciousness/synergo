import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrganizationDto {
    @IsUUID()
    userId: string;

    @IsString()
    name: string;
    
    @IsOptional()
    description?: string;
    
    @IsOptional()
    logo?: string;
}