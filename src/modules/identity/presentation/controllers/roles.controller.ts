import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiEnvelopeResponse,
  CurrentPrincipal,
  RequirePermissions,
} from '../../../../shared/api';
import type { CurrentPrincipalContext } from '../../../../shared/api';
import { IdentityPermissions } from '../../application/permissions/identity-permissions';
import { CreateRoleUseCase } from '../../application/use-cases/create-role.use-case';
import { DeleteRoleUseCase } from '../../application/use-cases/delete-role.use-case';
import { ListRolesUseCase } from '../../application/use-cases/list-roles.use-case';
import { UpdateRolePermissionsUseCase } from '../../application/use-cases/update-role-permissions.use-case';
import { UpdateRoleUseCase } from '../../application/use-cases/update-role.use-case';
import {
  CreateRoleRequestDto,
  ReplacePermissionsRequestDto,
  UpdateRoleRequestDto,
} from '../dtos/access-management.dto';
import { RoleResponseDto } from '../dtos/access-management.response.dto';

@ApiTags('Identity Roles')
@Controller('roles')
export class RolesController {
  constructor(
    private readonly listRoles: ListRolesUseCase,
    private readonly createRole: CreateRoleUseCase,
    private readonly updateRole: UpdateRoleUseCase,
    private readonly deleteRole: DeleteRoleUseCase,
    private readonly updateRolePermissions: UpdateRolePermissionsUseCase,
  ) {}

  @Get()
  @RequirePermissions(IdentityPermissions.RolesRead)
  @ApiOperation({ summary: 'List roles' })
  @ApiEnvelopeResponse({ type: RoleResponseDto, isArray: true })
  async list(): Promise<RoleResponseDto[]> {
    return (await this.listRoles.execute()).map((role) =>
      RoleResponseDto.fromEntity(role),
    );
  }

  @Post()
  @RequirePermissions(IdentityPermissions.RolesCreate)
  @ApiOperation({ summary: 'Create a custom role' })
  @ApiEnvelopeResponse({ status: HttpStatus.CREATED, type: RoleResponseDto })
  async create(@Body() input: CreateRoleRequestDto): Promise<RoleResponseDto> {
    return RoleResponseDto.fromEntity(await this.createRole.execute(input));
  }

  @Put(':key')
  @RequirePermissions(IdentityPermissions.RolesUpdate)
  @ApiOperation({ summary: 'Update a role' })
  @ApiEnvelopeResponse({ type: RoleResponseDto })
  async update(
    @Param('key') key: string,
    @Body() input: UpdateRoleRequestDto,
  ): Promise<RoleResponseDto> {
    return RoleResponseDto.fromEntity(
      await this.updateRole.execute({ key, name: input.name }),
    );
  }

  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(IdentityPermissions.RolesDelete)
  @ApiOperation({ summary: 'Delete a custom role' })
  async delete(@Param('key') key: string): Promise<void> {
    await this.deleteRole.execute(key);
  }

  @Put(':key/permissions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(IdentityPermissions.RolesManagePermissions)
  @ApiOperation({ summary: 'Replace role permissions' })
  async replacePermissions(
    @Param('key') key: string,
    @Body() input: ReplacePermissionsRequestDto,
    @CurrentPrincipal() principal: CurrentPrincipalContext,
  ): Promise<void> {
    await this.updateRolePermissions.execute({
      roleKey: key,
      permissionKeys: input.permissionKeys,
      changedByUserId: principal.userId,
    });
  }
}
