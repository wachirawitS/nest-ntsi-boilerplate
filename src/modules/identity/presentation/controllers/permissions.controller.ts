import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiEnvelopeResponse,
  RequirePermissions,
} from '../../../../shared/api';
import { IdentityPermissions } from '../../application/permissions/identity-permissions';
import { ListPermissionsUseCase } from '../../application/use-cases/list-permissions.use-case';
import { PermissionResponseDto } from '../dtos/access-management.response.dto';

@ApiTags('Identity Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly listPermissions: ListPermissionsUseCase) {}

  @Get()
  @RequirePermissions(IdentityPermissions.PermissionsRead)
  @ApiOperation({ summary: 'List permission catalog' })
  @ApiEnvelopeResponse({ type: PermissionResponseDto, isArray: true })
  async list(): Promise<PermissionResponseDto[]> {
    return (await this.listPermissions.execute()).map((permission) =>
      PermissionResponseDto.fromEntity(permission),
    );
  }
}
