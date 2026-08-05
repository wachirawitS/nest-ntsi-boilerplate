import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  AUTH_PERMISSIONS_ALL_KEY,
  AUTH_PERMISSIONS_ANY_KEY,
  AUTH_PUBLIC_KEY,
  CurrentPrincipalContext,
} from '../../../../shared/api';
import { InsufficientPermissionsError } from '../../domain/errors/insufficient-permissions.error';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      AUTH_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const requiredAll = this.reflector.getAllAndOverride<string[]>(
      AUTH_PERMISSIONS_ALL_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredAny = this.reflector.getAllAndOverride<string[]>(
      AUTH_PERMISSIONS_ANY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredAll?.length && !requiredAny?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { currentPrincipal?: CurrentPrincipalContext }>();
    const permissionSet = new Set(request.currentPrincipal?.permissions ?? []);

    if (
      requiredAll?.length &&
      !requiredAll.every((permission) => permissionSet.has(permission))
    ) {
      throw new InsufficientPermissionsError(requiredAll);
    }

    if (
      requiredAny?.length &&
      !requiredAny.some((permission) => permissionSet.has(permission))
    ) {
      throw new InsufficientPermissionsError(requiredAny);
    }

    return true;
  }
}
