import { IsUUID, IsString } from 'class-validator';

export class GetCurrentOrganizationIdDto {
    @IsString()
    @IsUUID()
    userId: string;
}