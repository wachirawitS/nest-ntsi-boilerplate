import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiEnvelopeResponse,
  ApiErrorResponseDto,
  CurrentPrincipal,
  RequirePermissions,
} from '../../../../shared/api';
import type { CurrentPrincipalContext } from '../../../../shared/api';
import { IdentityPermissions } from '../../application/permissions/identity-permissions';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { RevokeUserSessionsUseCase } from '../../application/use-cases/revoke-user-sessions.use-case';
import { SetUserActiveStatusUseCase } from '../../application/use-cases/set-user-active-status.use-case';
import { UpdateUserDirectPermissionsUseCase } from '../../application/use-cases/update-user-direct-permissions.use-case';
import { UpdateUserRolesUseCase } from '../../application/use-cases/update-user-roles.use-case';
import {
  ReplacePermissionsRequestDto,
  ReplaceUserRolesRequestDto,
  RevokeSessionsRequestDto,
} from '../dtos/access-management.dto';
import { CreateUserRequestDto } from '../dtos/create-user.request.dto';
import { UserResponseDto } from '../dtos/user.response.dto';

@ApiTags('Identity')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly updateUserRoles: UpdateUserRolesUseCase,
    private readonly updateUserDirectPermissions: UpdateUserDirectPermissionsUseCase,
    private readonly setUserActiveStatus: SetUserActiveStatusUseCase,
    private readonly revokeUserSessions: RevokeUserSessionsUseCase,
  ) {}

  @Post()
  @RequirePermissions(IdentityPermissions.UsersCreate)
  @ApiOperation({ summary: 'Create a user' })
  @ApiEnvelopeResponse({ status: HttpStatus.CREATED, type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email is already registered',
    type: ApiErrorResponseDto,
  })
  async create(
    @Body() input: CreateUserRequestDto,
    @CurrentPrincipal() principal: CurrentPrincipalContext,
  ): Promise<UserResponseDto> {
    const user = await this.createUser.execute({
      ...input,
      createdByUserId: principal.userId,
    });

    return UserResponseDto.fromEntity(user);
  }

  @Get()
  @RequirePermissions(IdentityPermissions.UsersRead)
  @ApiOperation({ summary: 'List users' })
  @ApiEnvelopeResponse({ type: UserResponseDto, isArray: true })
  async list(): Promise<UserResponseDto[]> {
    return (await this.listUsers.execute()).map((user) =>
      UserResponseDto.fromEntity(user),
    );
  }

  @Get(':id')
  @RequirePermissions(IdentityPermissions.UsersRead)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiEnvelopeResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid user ID',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User was not found',
    type: ApiErrorResponseDto,
  })
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.getUser.execute(id);

    return UserResponseDto.fromEntity(user);
  }

  @Put(':id/roles')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(IdentityPermissions.UsersManageRoles)
  @ApiOperation({ summary: 'Replace user roles' })
  async replaceRoles(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() input: ReplaceUserRolesRequestDto,
    @CurrentPrincipal() principal: CurrentPrincipalContext,
  ): Promise<void> {
    await this.updateUserRoles.execute({
      userId: id,
      roleKeys: input.roleKeys,
      changedByUserId: principal.userId,
    });
  }

  @Put(':id/direct-permissions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(IdentityPermissions.UsersManageDirectPermissions)
  @ApiOperation({ summary: 'Replace direct user permissions' })
  async replaceDirectPermissions(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() input: ReplacePermissionsRequestDto,
  ): Promise<void> {
    await this.updateUserDirectPermissions.execute({
      userId: id,
      permissionKeys: input.permissionKeys,
    });
  }

  @Put(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(IdentityPermissions.UsersDeactivate)
  @ApiOperation({ summary: 'Deactivate a user' })
  async deactivate(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.setUserActiveStatus.execute({ userId: id, isActive: false });
  }

  @Put(':id/reactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(IdentityPermissions.UsersReactivate)
  @ApiOperation({ summary: 'Reactivate a user' })
  async reactivate(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.setUserActiveStatus.execute({ userId: id, isActive: true });
  }

  @Post(':id/revoke-sessions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(IdentityPermissions.UsersRevokeSessions)
  @ApiOperation({ summary: 'Revoke all sessions for a user' })
  async revokeSessions(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() input: RevokeSessionsRequestDto,
  ): Promise<void> {
    await this.revokeUserSessions.execute({
      userId: id,
      reason: input.reason,
    });
  }
}
