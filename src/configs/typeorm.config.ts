import 'dotenv/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { PermissionEntity } from '../modules/identity/domain/entities/permission.entity';
import { RolePermissionEntity } from '../modules/identity/domain/entities/role-permission.entity';
import { RoleEntity } from '../modules/identity/domain/entities/role.entity';
import { SessionEntity } from '../modules/identity/domain/entities/session.entity';
import { UserCredentialEntity } from '../modules/identity/domain/entities/user-credential.entity';
import { UserPermissionEntity } from '../modules/identity/domain/entities/user-permission.entity';
import { UserRoleEntity } from '../modules/identity/domain/entities/user-role.entity';
import { UserEntity } from '../modules/identity/domain/entities/user.entity';

const ssl =
  process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : undefined;

export const typeOrmDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USERNAME ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'nest_ntsi_boilerplate',
  ssl,
  synchronize: false,
  entities: [
    UserEntity,
    UserCredentialEntity,
    SessionEntity,
    PermissionEntity,
    RoleEntity,
    RolePermissionEntity,
    UserRoleEntity,
    UserPermissionEntity,
  ],
  migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
};

export default new DataSource(typeOrmDataSourceOptions);
