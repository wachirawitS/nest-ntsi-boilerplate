import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import type { CurrentPrincipal } from '../types/current-principal';

export const AUTH_PUBLIC_KEY = 'auth:public';
export const AUTH_AUTHENTICATED_KEY = 'auth:authenticated';
export const AUTH_PERMISSIONS_ALL_KEY = 'auth:permissions:all';
export const AUTH_PERMISSIONS_ANY_KEY = 'auth:permissions:any';

export const Public = () => SetMetadata(AUTH_PUBLIC_KEY, true);

export function Authenticated(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    SetMetadata(AUTH_AUTHENTICATED_KEY, true),
    ApiBearerAuth(),
  );
}

export function RequirePermissions(
  ...permissions: string[]
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    SetMetadata(AUTH_PERMISSIONS_ALL_KEY, permissions),
    ApiBearerAuth(),
  );
}

export function RequireAnyPermission(
  ...permissions: string[]
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    SetMetadata(AUTH_PERMISSIONS_ANY_KEY, permissions),
    ApiBearerAuth(),
  );
}

export const CurrentPrincipalDecorator = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentPrincipal | undefined => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { currentPrincipal?: CurrentPrincipal }>();

    return request.currentPrincipal;
  },
);
