import { IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberRolesDto {
  @ApiProperty({
    example: [
      'role-uuid-1a',
      'role-uuid-2b',
    ],
    description: 'Список ID ролей, которые нужно назначить',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  roleIds: string[];
}
