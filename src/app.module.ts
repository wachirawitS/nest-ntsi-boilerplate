import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmDataSourceOptions } from './configs/typeorm.config';
import { IdentityModule } from './modules/identity';
import {
  ApiExceptionFilter,
  ApiResponseInterceptor,
  ApplicationError,
  ErrorCode,
  flattenValidationErrors,
  RequestIdMiddleware,
} from './shared/api';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmDataSourceOptions),
    IdentityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
          exceptionFactory: (errors) =>
            new ApplicationError({
              code: ErrorCode.ValidationFailed,
              message: 'Validation failed',
              details: flattenValidationErrors(errors),
            }),
        }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
