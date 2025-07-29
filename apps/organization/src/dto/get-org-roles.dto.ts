import { IsUUID } from "class-validator";

export class GetOrganizationRolesDto {
  @IsUUID()
  organizationId: string;

  @IsUUID()
  userId: string;
}