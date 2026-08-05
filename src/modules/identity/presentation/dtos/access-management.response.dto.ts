import { ApiProperty } from '@nestjs/swagger';
import { PermissionEntity } from '../../domain/entities/permission.entity';
import { RoleEntity } from '../../domain/entities/role.entity';

export class PermissionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'users:read' })
  key!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: true })
  isDeclared!: boolean;

  static fromEntity(permission: PermissionEntity): PermissionResponseDto {
    return {
      id: permission.id,
      key: permission.key,
      description: permission.description,
      isActive: permission.isActive,
      isDeclared: permission.isDeclared,
    };
  }
}

export class RoleResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'admin' })
  key!: string;

  @ApiProperty({ example: 'Administrator' })
  name!: string;

  @ApiProperty({ example: true })
  isSystem!: boolean;

  static fromEntity(role: RoleEntity): RoleResponseDto {
    return {
      id: role.id,
      key: role.key,
      name: role.name,
      isSystem: role.isSystem,
    };
  }
}
