import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationMember } from '../entities/organization-member.entity';
import { Organization } from '../entities/organization.entity';
import { addOrganizationMemberDto } from '../dto/add-organizationMember.dto';
import { NotFoundException } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { BadRequestException } from '@nestjs/common';
import { In } from 'typeorm';
import { RoleService } from './role.service';
import { changeMemberRolesDto } from '../dto/change-member-roles.dto';

@Injectable()
export class OrganizationMemberService {
  constructor(
    @InjectRepository(OrganizationMember)
    private readonly organizationMemberRepo: Repository<OrganizationMember>,
    @InjectRepository(Organization)
    private readonly organizationEntityRepo: Repository<Organization>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly roleService: RoleService,
  ){}

  async getOrganizationMembersByUserId(userId: string): Promise<OrganizationMember[]> {
    const members = await this.organizationMemberRepo.find({
      where: { userId },
      relations: ['organization', 'roles'],
    });
    if (!members || members.length === 0) {
      throw new NotFoundException('No organization members found for user');
    }
    return members;
  }

  async getOrganizationMembersByOrgId(orgId: string): Promise<OrganizationMember[]> {
    const members = await this.organizationMemberRepo.find({
      where: { orgId },
      relations: ['organization', 'roles'],
    });
    if (!members || members.length === 0) {
      throw new NotFoundException('No organization members found for organization');
    }
    return members;
  }

  async getOrganizationMember(memberId: string, orgId): Promise<OrganizationMember> {
    const member = await this.organizationMemberRepo.findOne({
      where: { userId: memberId, orgId: orgId },
      relations: ['organization', 'roles'],
    });
    if (!member) {
      throw new NotFoundException('Organization member not found');
    }
    return member;
  }

  async updateOrganizationMember(dto: changeMemberRolesDto): Promise<OrganizationMember> {
    const member = await this.organizationMemberRepo.findOne({
      where: { userId: dto.userId, orgId: dto.organizationId },
      relations: ['organization', 'roles'],
    });
    if (!member) {
      throw new NotFoundException('Organization member not found');
    }
    
    if (dto.roleIds && dto.roleIds.length > 0) {
      const roles = await this.roleRepo.find({
        where: { id: In(dto.roleIds) }
      });
      if (roles.length !== dto.roleIds.length) {
        throw new BadRequestException('Some roles are invalid');
      }
      member.roles = roles;
    }

    return this.organizationMemberRepo.save(member);
  }

  async addOrganizationMember(dto: addOrganizationMemberDto) {
    try{
      const exists = await this.organizationMemberRepo.findOne({ where: { orgId: dto.orgId, userId: dto.userId } });
      if (exists) throw new Error('Member already exists in the organization');

      const org = await this.organizationEntityRepo.findOne({ where: { id: dto.orgId } });
      if (!org) throw new NotFoundException('Organization not found (in addOrganizationMember)');

      const roles = await this.roleRepo.find({
        where: { name: In(dto.roleNames), orgId: dto.orgId }
      });
      if (roles.length !== dto.roleNames.length) {
        throw new BadRequestException('Some roles are invalid');
      }

      const organizationMember = await this.organizationMemberRepo.create({
        orgId: dto.orgId,
        organization: org,
        userId: dto.userId,
        roles: roles,
        isActive: true,
      });

      const savedOrganizationMember = await this.organizationMemberRepo.save(organizationMember);

      return {"message": "New Organization Member added successfully", "newOrganizationMember": savedOrganizationMember};
    }
    catch (error) {
      console.error('Add Organization Member error: ', error);
      throw new Error(error.message || 'Add Organization Member failed');
    }
  }
}

