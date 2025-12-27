import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { OrganizationService } from './services/organization.service';
import { MessagePattern } from '@nestjs/microservices';
import { getOrgsForUserDto } from './dto/get-orgs-for-user.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { AcceptOrgInviteDto } from './dto/accept-orgInvite.dto';
import { GetOrganizationMembersDto } from './dto/get-org-members.dto';
import { GetOrganizationRolesDto } from './dto/get-org-roles.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { changeMemberRolesDto } from './dto/change-member-roles.dto';
import { PermissionAction } from './enums/permission.enum';

@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @MessagePattern('organization_getOrganizationsForUser')
  async getOrganizationsForUser(data: getOrgsForUserDto) {
    try {
      return await this.organizationService.getOrganizationsForUser(data);
    } catch (error) {
      console.error('getOrganizationsForUser error: ', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to get organizations for user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @MessagePattern('organization_getOrganizationMembers')
  async getOrganizationMembers(data: GetOrganizationMembersDto) {
    try {
      return await this.organizationService.getOrganizationMembers({ organizationId: data.organizationId });
    } catch (error) {
      console.error('getOrganizationMembers error: ', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to get organization members',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @MessagePattern('organization_getOrganizationRoles')
  async getOrganizationRoles(data: GetOrganizationRolesDto) {
    try {
      return await this.organizationService.getOrganizationRoles(data);
    } catch (error) {
      console.error('getOrganizationRoles error: ', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to get organization roles',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @MessagePattern('organization_getPermissionsList')
  async getPermissionsList() {
    try {
      return await this.organizationService.getPermissionsList();
    } catch (error) {
      console.error('getPermissionsList error: ', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to get permissions list',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @MessagePattern('organization_updateRole')
  async updateRole(data: { dto: UpdateRoleDto }) {
    return this.organizationService.updateRoleForOrganization(data.dto);
  }

  @MessagePattern('organization_updateMemberRoles')
  async updateMemberRoles(data: changeMemberRolesDto){
    return this.organizationService.updateMemberRoles(data)
  }

  @MessagePattern('organization_create')
  async createOrganization(data: CreateOrganizationDto) {
    return this.organizationService.createOrganization(data);
  }

  @MessagePattern('organization_createRole')
  async createRole(data: { dto: CreateRoleDto }) {
    return this.organizationService.createNewRoleForOrganization(data.dto);
  }

  @MessagePattern('organization_inviteMember')
  async inviteOrganizationMember(data: InviteUserDto) {
    return this.organizationService.inviteOrganizationMember(data);
  }

  @MessagePattern('organization_acceptInvite')
  async acceptOrganizationInvite(data: AcceptOrgInviteDto) {
    return this.organizationService.acceptOrganizationInvite(data);
  }

  @MessagePattern('organization_getById')
  async getOrganizationById(data: { id: string }) {
    return this.organizationService.getOrganizationById(data.id);
  }

  @MessagePattern('organization_hasPermission')
  async memberHasPermission(data: {
    userId: string;
    organizationId: string;
    permission: PermissionAction;
  }) {
    try {
      return await this.organizationService.hasPermission(
        data.userId,
        data.organizationId,
        data.permission,
      );
    } catch (error) {
      console.error('hasPermission error: ', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to check permission',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
