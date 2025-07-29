// dto/create-role.dto.ts

import {
  IsUUID,
  IsString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Admin',
    description: 'Название новой роли',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: ['perm.read', 'perm.write'],
    description: 'Список имён разрешений (permissions), связанных с ролью',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissionNames: string[];
}
