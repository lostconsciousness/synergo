import { IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
    @ApiProperty({ example: 'My Organization', description: 'The name of the organization' })
    @IsString()
    name: string;
    
    @ApiProperty({ example: 'This is a description of my organization', description: 'A brief description of the organization', required: false })  
    @IsString()
    @IsOptional()
    description?: string;
    
    @ApiProperty({ example: 'https://example.com/logo.png', description: 'The logo URL of the organization', required: false })
    @IsString()
    @IsOptional()
    logo?: string;
}