import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsString } from "class-validator";

export class SelectCurrentOrganizationDto {
    @ApiProperty({ example: 'some_UUID', description: 'The ID of the organization on which users currentOrganization will be switched' })
    @IsUUID()
    @IsString()
    organizationId: string;
}