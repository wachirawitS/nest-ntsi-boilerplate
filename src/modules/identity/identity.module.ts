import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppCacheModule } from '../../shared/cache';
import { EventsModule } from '../../shared/events';
import { IdentityFacade } from './application/identity.facade';
import { AuthRateLimiter } from './application/security/auth-rate-limiter';
import { PasswordHasher } from './application/security/password-hasher';
import { RefreshTokenService } from './application/security/refresh-token.service';
import { TokenIssuer } from './application/security/token-issuer';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { CreateRoleUseCase } from './application/use-cases/create-role.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { DeleteRoleUseCase } from './application/use-cases/delete-role.use-case';
import { GetCurrentPrincipalUseCase } from './application/use-cases/get-current-principal.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { ListPermissionsUseCase } from './application/use-cases/list-permissions.use-case';
import { ListRolesUseCase } from './application/use-cases/list-roles.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { ResolveCurrentPrincipalUseCase } from './application/use-cases/resolve-current-principal.use-case';
import { RevokeUserSessionsUseCase } from './application/use-cases/revoke-user-sessions.use-case';
import { SetUserActiveStatusUseCase } from './application/use-cases/set-user-active-status.use-case';
import { UpdateRolePermissionsUseCase } from './application/use-cases/update-role-permissions.use-case';
import { UpdateRoleUseCase } from './application/use-cases/update-role.use-case';
import { UpdateUserDirectPermissionsUseCase } from './application/use-cases/update-user-direct-permissions.use-case';
import { UpdateUserRolesUseCase } from './application/use-cases/update-user-roles.use-case';
import { PermissionEntity } from './domain/entities/permission.entity';
import { RolePermissionEntity } from './domain/entities/role-permission.entity';
import { RoleEntity } from './domain/entities/role.entity';
import { SessionEntity } from './domain/entities/session.entity';
import { UserCredentialEntity } from './domain/entities/user-credential.entity';
import { UserEntity } from './domain/entities/user.entity';
import { UserPermissionEntity } from './domain/entities/user-permission.entity';
import { UserRoleEntity } from './domain/entities/user-role.entity';
import { IdentityAccessRepository } from './domain/repositories/identity-access.repository';
import { IdentityTransaction } from './domain/repositories/identity-transaction';
import { UserRepository } from './domain/repositories/user.repository';
import { TypeOrmIdentityAccessRepository } from './infrastructure/persistence/typeorm-identity-access.repository';
import {
  TypeOrmIdentityTransaction,
  TypeOrmIdentityTransactionContext,
} from './infrastructure/persistence/typeorm-identity-transaction';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { Argon2PasswordHasher } from './infrastructure/security/argon2-password-hasher';
import { Hs256TokenIssuer } from './infrastructure/security/hs256-token-issuer';
import { AuthController } from './presentation/controllers/auth.controller';
import { PermissionsController } from './presentation/controllers/permissions.controller';
import { RolesController } from './presentation/controllers/roles.controller';
import { UsersController } from './presentation/controllers/users.controller';
import { AuthenticationGuard } from './presentation/guards/authentication.guard';
import { PermissionGuard } from './presentation/guards/permission.guard';

@Module({
  imports: [
    AppCacheModule,
    EventsModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserCredentialEntity,
      SessionEntity,
      PermissionEntity,
      RoleEntity,
      RolePermissionEntity,
      UserRoleEntity,
      UserPermissionEntity,
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    PermissionsController,
  ],
  providers: [
    IdentityFacade,
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    LoginUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    GetCurrentPrincipalUseCase,
    ResolveCurrentPrincipalUseCase,
    ChangePasswordUseCase,
    UpdateUserRolesUseCase,
    UpdateUserDirectPermissionsUseCase,
    SetUserActiveStatusUseCase,
    RevokeUserSessionsUseCase,
    ListPermissionsUseCase,
    ListRolesUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    UpdateRolePermissionsUseCase,
    RefreshTokenService,
    AuthRateLimiter,
    TypeOrmIdentityTransactionContext,
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: IdentityAccessRepository,
      useClass: TypeOrmIdentityAccessRepository,
    },
    {
      provide: IdentityTransaction,
      useClass: TypeOrmIdentityTransaction,
    },
    {
      provide: PasswordHasher,
      useClass: Argon2PasswordHasher,
    },
    {
      provide: TokenIssuer,
      useClass: Hs256TokenIssuer,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
  exports: [IdentityFacade],
})
export class IdentityModule {}
