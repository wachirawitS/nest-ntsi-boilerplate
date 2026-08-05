import 'dotenv/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
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
  entities: [UserEntity],
  migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
};

export default new DataSource(typeOrmDataSourceOptions);
