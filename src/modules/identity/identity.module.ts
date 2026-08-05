import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppCacheModule } from '../../shared/cache';
import { EventsModule } from '../../shared/events';
import { IdentityFacade } from './application/identity.facade';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { UserEntity } from './domain/entities/user.entity';
import { UserRepository } from './domain/repositories/user.repository';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { UsersController } from './presentation/controllers/users.controller';

@Module({
  imports: [
    AppCacheModule,
    EventsModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UsersController],
  providers: [
    IdentityFacade,
    CreateUserUseCase,
    GetUserUseCase,
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [IdentityFacade],
})
export class IdentityModule {}
