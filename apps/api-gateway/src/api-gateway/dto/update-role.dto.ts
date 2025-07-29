import {
  IsUUID,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ example: 'r1111111-s222-t333-u444-v55555555555', description: 'ID роли для обновления' })
  @IsUUID()
  roleId: string;

  @ApiPropertyOptional({ example: 'Moderator', description: 'Новое название роли (если нужно изменить)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: ['perm-read', 'perm-write'],
    description: 'Список ID разрешений для роли',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];
}
