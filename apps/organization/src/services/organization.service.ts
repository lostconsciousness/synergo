import { ForbiddenException, forwardRef, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { OrganizationMemberService } from './organization-member.service';
import { InviteUserDto } from '../dto/invite-user.dto';
import { InviteService } from './invites.service';
import { RoleService } from './role.service';
import { PermissionAction } from '../enums/permission.enum';
import { AcceptOrgInviteDto } from '../dto/accept-orgInvite.dto';
import { getOrgsForUserDto } from '../dto/get-orgs-for-user.dto';
import { GetOrganizationRolesDto } from '../dto/get-org-roles.dto';
import { Role } from '../entities/role.entity';
import { GetOrganizationMembersDto } from '../dto/get-org-members.dto';
import { OrganizationMember } from '../entities/organization-member.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { changeMemberRolesDto } from '../dto/change-member-roles.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    private readonly organizationMemberService: OrganizationMemberService,
    private readonly inviteService: InviteService,
    private readonly roleService: RoleService,
  ){}

  async getOrganizationById(id: string): Promise<Organization> {
    const organization = await this.organizationRepo.findOne({
      where: { id },
      relations: ['members', 'members.roles'],
    });
    if (!organization) {
      throw new NotFoundException('Organization not found (getOrganizationById)');
    }
    return organization;
  }

  async getOrganizationNameById(id: string): Promise<string> {
    const organization = await this.organizationRepo.findOne({ where: { id } });
    if (!organization) {
      throw new NotFoundException('Organization not found (getOrganizationNameById)');
    }
    return organization.name;
  }

  async getOrganizationsForUser(dto: getOrgsForUserDto): Promise<Organization[]> {
    const members = await this.organizationMemberService.getOrganizationMembersByUserId(dto.userId);
    if (!members || members.length === 0) {
      throw new NotFoundException('No organizations found for user');
    }
    
    const orgIds = members.map(member => member.orgId);
    const orgs = await this.organizationRepo
      .createQueryBuilder('org')
      .select(['org.id', 'org.name', 'org.logoUrl', 'org.description'])
      .where('org.id IN (:...ids) AND org.isActive IS true', { ids: orgIds })
      .orderBy('org.name', 'ASC')
      .getMany();

    return orgs;
  }

  async getOrganizationRoles(dto: GetOrganizationRolesDto): Promise<Role[]> {
    const organization = await this.organizationRepo.findOne({ where: { id: dto.organizationId } });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const roles = await this.roleService.getRolesByOrganizationId(dto.organizationId);

    return roles;
  }

  async getOrganizationMembers(dto: GetOrganizationMembersDto): Promise<OrganizationMember[]> {
    const organization = await this.organizationRepo.findOne({ where: { id: dto.organizationId } });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const members = await this.organizationMemberService.getOrganizationMembersByOrgId(dto.organizationId);
    return members;
  }

  async getPermissionsList(): Promise<PermissionAction[]> {
    return Object.values(PermissionAction);
  }

  async createOrganization(dto: CreateOrganizationDto) {
    try{
      const exists = await this.organizationRepo.findOne({ where: { name: dto.name } });
      if (exists) throw new Error('Organization already exists');

      const organization = this.organizationRepo.create({
        name: dto.name,
        description: dto.description,
        logo: dto.logo,
        members: [],
      });

      let savedOrganization = await this.organizationRepo.save(organization);

      const tokens = await this.userClient.send('user_selectCurrentOrganization', {
        organizationId: savedOrganization.id,
        userId: dto.userId,
      }).toPromise();

      await this.roleService.createDefaultRoles(savedOrganization.id);

      const member = await this.organizationMemberService.addOrganizationMember({
        orgId: savedOrganization.id,
        userId: dto.userId,
        roleNames: ['owner'],
      });

      
      savedOrganization.members ??= [];

      savedOrganization.members.push(member.newOrganizationMember);
      savedOrganization = await this.organizationRepo.save(savedOrganization);

      return {"message": "New Organization saved successfully", "newOrganization": savedOrganization, "orgTokens": tokens};
    }
    catch (error) {
      console.error('Create Organization error: ', error);
      throw new Error(error.message || 'Create Organization failed');
    }
  }

  async createNewRoleForOrganization(dto: CreateRoleDto): Promise<Role> {
    const hasPermission = await this.hasPermission(dto.userId, dto.orgId, PermissionAction.ROLE_CREATE);
    if (!hasPermission) {
      throw new ForbiddenException('User does not have permission to create roles');
    }
    const permissions = await this.getPermissionsList();
    if (!permissions) {
      throw new NotFoundException('No permissions found for this organization');
    }

    const role = await this.roleService.createCustomRole(dto);

    return role;
  }

  async updateRoleForOrganization(dto: UpdateRoleDto): Promise<Role> {
    const hasPermission = await this.hasPermission(dto.updatedById, dto.organizationId, PermissionAction.ROLE_UPDATE);
    if (!hasPermission) {
      throw new ForbiddenException('User does not have permission to update roles');
    }

    const updatedRole = await this.roleService.updateRole(dto);

    return updatedRole;
  }

  async updateMemberRoles(dto: changeMemberRolesDto): Promise<OrganizationMember> {
    const hasPermission = await this.hasPermission(dto.updatedById, dto.organizationId, PermissionAction.MEMBER_UPDATE);
    if (!hasPermission) {
      throw new ForbiddenException('User does not have permission to update member roles');
    }

    const member = await this.organizationMemberService.getOrganizationMember(dto.userId, dto.organizationId);
    if (!member) {
      throw new NotFoundException('Organization member not found');
    }

    const roles = await this.roleService.getRolesByOrganizationId(dto.organizationId);
    const updatedRoles = roles.filter(role => dto.roleIds.includes(role.name));

    if (updatedRoles.length !== dto.roleIds.length) {
      throw new NotFoundException('Some roles not found');
    }

    member.roles = updatedRoles;
    return this.organizationMemberService.updateOrganizationMember(dto);
  }

  async inviteOrganizationMember(dto: InviteUserDto) {
    try {
      console.log('Inviting user to organization:', dto);

      const hasPermission = await this.hasPermission(dto.invitedByUserId, dto.organizationId, PermissionAction.MEMBER_INVITE);

      if (!hasPermission) {
        throw new ForbiddenException('User does not have permission to invite members');
      }

      const invite = await this.inviteService.inviteUserToOrg(dto);

      if (!invite) {
        throw new Error('Failed to create invite');
      }

      return { message: 'User invited successfully', invite };
    } catch (error) {
      console.error('Invite Organization Member error: ', error);
      throw new Error(error.message || 'Invite Organization Member failed');
    }
  }

  async acceptOrganizationInvite(dto: AcceptOrgInviteDto) {
    try{
      const userEmail = await this.resolveUserEmailById(dto.userId);

      const invite = await this.inviteService.acceptInvite(dto.token, userEmail);
      if (!invite) {
        throw new NotFoundException('Invite not found');
      }

      const tokens = await this.userClient.send('user_selectCurrentOrganization', {
        organizationId: invite.organizationId,
        userId: dto.userId,
      }).toPromise();

      const organizationMember = await this.organizationMemberService.addOrganizationMember({
        orgId: invite.organizationId,
        userId: dto.userId,
        roleNames: ['member'], // Default role for invited members
      });

      return organizationMember ? {"message": "Organization invite accepted successfully", "organizationMember": organizationMember, "orgTokens": tokens} :
        new NotFoundException('Failed to accept organization invite');
    } catch (error) {
      console.error('Accept Organization Invite error: ', error);
      throw new Error(error.message || 'Accept Organization Invite failed');
    }
  }

  private async resolveUserEmailById(userId: string): Promise<string | null | undefined> {
    return await this.userClient.send<string>('user_getUserEmailById', userId).toPromise();
  }

  async hasPermission(
    userId: string,
    organizationId: string,
    permission: PermissionAction
  ): Promise<boolean> {
    const orgMember = await this.organizationMemberService.getOrganizationMember(userId, organizationId);

    const hasPermission = await this.roleService.rolesHavePermission(orgMember.roles, permission);

    return hasPermission;
  }
}
