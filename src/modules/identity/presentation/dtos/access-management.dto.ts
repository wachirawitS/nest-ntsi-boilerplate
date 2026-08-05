import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const roleKeyPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const permissionKeyPattern =
  /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*:[a-z][A-Za-z0-9]*$/;

export class ReplaceUserRolesRequestDto {
  @ApiProperty({ type: [String], example: ['member'] })
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(roleKeyPattern, { each: true })
  roleKeys!: string[];
}

export class ReplacePermissionsRequestDto {
  @ApiProperty({ type: [String], example: ['users:read'] })
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(permissionKeyPattern, { each: true })
  permissionKeys!: string[];
}

export class CreateRoleRequestDto {
  @ApiProperty({ example: 'billing-manager' })
  @IsString()
  @Matches(roleKeyPattern)
  @MaxLength(100)
  key!: string;

  @ApiProperty({ example: 'Billing Manager' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;
}

export class UpdateRoleRequestDto {
  @ApiProperty({ example: 'Billing Manager' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;
}

export class RevokeSessionsRequestDto {
  @ApiProperty({ example: 'admin_revoked', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reason?: string;
}
