import { IsUUID } from "class-validator";

export class GetOrganizationMembersDto {
  @IsUUID()
  organizationId: string;
}