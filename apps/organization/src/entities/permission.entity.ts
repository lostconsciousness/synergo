import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PermissionAction } from '../enums/permission.enum';

@Entity('organization_permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PermissionAction,
  })
  action: PermissionAction;
}