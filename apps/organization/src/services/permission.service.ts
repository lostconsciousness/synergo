import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { PermissionAction } from '../enums/permission.enum';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

    async onModuleInit(): Promise<void> {
        this.logger.log('Checking and syncing permissions...');
        await this.syncPermissions();
    }

  async syncPermissions(): Promise<void> {
    const enumValues = Object.values(PermissionAction);
    const existing = await this.permissionRepository.find({
      where: {
        action: In(enumValues),
      },
    });

    const existingActions = existing.map(p => p.action);

    const missingActions = enumValues.filter(action => !existingActions.includes(action));

    if (missingActions.length === 0) {
      this.logger.log('All permissions already exist.');
      return;
    }

    this.logger.log(`Missing permissions: ${missingActions.join(', ')}`);

    const newPermissions = missingActions.map(action => this.permissionRepository.create({ action }));

    await this.permissionRepository.save(newPermissions);

    this.logger.log(`Added ${newPermissions.length} missing permissions.`);
  }
}
