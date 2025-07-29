import { IsUUID, IsString } from "class-validator";

export class SelectCurrentOrganizationDto {
    @IsUUID()
    @IsString()
    userId: string;

    @IsUUID()
    @IsString()
    organizationId: string;
}