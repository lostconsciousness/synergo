import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { PermissionAction } from '../enums/permission.enum';
import { In } from 'typeorm';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission) private readonly permRepo: Repository<Permission>,
  ) {}

  async getRolesByOrganizationId(orgId: string): Promise<Role[]> {
    const roles = await this.roleRepo.find({ where: { orgId } });
    if (!roles || roles.length === 0) {
      throw new NotFoundException('No roles found for this organization');
    }
    return roles;
  }

  async getRoleById(roleId: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id: roleId }, relations: ['permissions'] });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async updateRole(dto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id: dto.roleId, orgId: dto.organizationId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (dto.name) {
      role.name = dto.name;
    }
    if (dto.permissionIds) {
      const permissions = await this.permRepo.find({ where: { id: In(dto.permissionIds) } });
      if (permissions.length !== dto.permissionIds.length) {
        throw new NotFoundException('Some permissions not found');
      }
      role.permissions = permissions;
    }
    return this.roleRepo.save(role);
  }

  async createDefaultRoles(orgId: string) {
    const allPerms = Object.values(PermissionAction);

    const defaults = [
  {
    name: 'owner',
    perms: allPerms,
  },
  {
    name: 'admin',
    perms: [
      // Org
      'organization:read',
      'organization:update',
      // Members
      'member:invite',
      'member:read',
      'member:update',
      'member:remove',
      // Roles
      'role:create',
      'role:read',
      'role:update',
      'role:delete',
      // Boards
      'board:create',
      'board:read',
      'board:update',
      'board:delete',
      // Columns
      'column:create',
      'column:read',
      'column:update',
      'column:delete',
      // Tasks
      'task:create',
      'task:read',
      'task:update',
      'task:delete',
      'task:move',
      'task:assign',
      'task:tag:update',
    ],
  },
  {
    name: 'member',
    perms: [
      // Orgs
      'organization:read',
      // Members
      'member:read',
      // Boards
      'board:read',
      // Columns
      'column:read',
      // tasks
      'task:create',
      'task:read',
      'task:update',
      'task:move',
      'task:tag:update',
    ],
  },
  {
    name: 'guest',
    perms: [
      'organization:read',
      'board:read',
      'column:read',
      'task:read',
    ],
  },
];

    const roles = await Promise.all(defaults.map(async def => {
        const permissions = await this.permRepo.find({
                where: { action: In(def.perms) }
        });
        const role = this.roleRepo.create({ name: def.name, orgId, permissions });
        return role;
    }));

    return this.roleRepo.save(roles);
  }

  async createCustomRole(dto: CreateRoleDto) {
    const permissions = await this.permRepo.find({
        where: { action: In(dto.permissionNames) }
    });
    const role = this.roleRepo.create({
      name: dto.name,
      orgId: dto.orgId,
      permissions: permissions,
    });
    return this.roleRepo.save(role);
  }

  async rolesHavePermission(roles: Role[], action: PermissionAction): Promise<boolean> {
    for (const role of roles) {
      const fullRole = await this.roleRepo.findOne({
        where: { id: role.id },
        relations: ['permissions'],
      });

      if (fullRole?.permissions.some(p => p.action === action)) {
        return true;
      }
    }
    return false;
  }

  async getRolesForOrg(orgId: string) {
    return this.roleRepo.find({ where: { orgId } });
  }

  async getRoleByName(orgId: string, roleName: string) {
    return this.roleRepo.findOne({ where: { orgId, name: roleName } });
  }

  async deleteRole(orgId: string, roleName: string) {
    const role = await this.getRoleByName(orgId, roleName);
    if (!role) throw new NotFoundException('Role not found');
    await this.roleRepo.remove(role);
    return { deleted: roleName };
  }
}
