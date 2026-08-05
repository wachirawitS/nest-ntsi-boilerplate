import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AUTH_PERMISSIONS_ALL_KEY,
  AUTH_PERMISSIONS_ANY_KEY,
  AUTH_PUBLIC_KEY,
} from '../../../../shared/api';
import { InsufficientPermissionsError } from '../../domain/errors/insufficient-permissions.error';
import { PermissionGuard } from './permission.guard';

describe('PermissionGuard', () => {
  it('allows all-of permission checks when every permission is present', () => {
    const guard = new PermissionGuard(
      reflectorFor({
        [AUTH_PERMISSIONS_ALL_KEY]: ['users:read', 'roles:read'],
      }),
    );

    expect(
      guard.canActivate(contextWithPermissions(['roles:read', 'users:read'])),
    ).toBe(true);
  });

  it('rejects all-of permission checks when a permission is missing', () => {
    const guard = new PermissionGuard(
      reflectorFor({
        [AUTH_PERMISSIONS_ALL_KEY]: ['users:read', 'roles:read'],
      }),
    );

    expect(() =>
      guard.canActivate(contextWithPermissions(['users:read'])),
    ).toThrow(InsufficientPermissionsError);
  });

  it('allows any-of permission checks when one permission is present', () => {
    const guard = new PermissionGuard(
      reflectorFor({
        [AUTH_PERMISSIONS_ANY_KEY]: [
          'invoices:approve',
          'invoices:adminOverride',
        ],
      }),
    );

    expect(
      guard.canActivate(contextWithPermissions(['invoices:adminOverride'])),
    ).toBe(true);
  });

  it('skips permission checks for public routes', () => {
    const guard = new PermissionGuard(
      reflectorFor({
        [AUTH_PUBLIC_KEY]: true,
        [AUTH_PERMISSIONS_ALL_KEY]: ['users:read'],
      }),
    );

    expect(guard.canActivate(contextWithPermissions([]))).toBe(true);
  });
});

function reflectorFor(metadata: Record<string, unknown>): Reflector {
  return {
    getAllAndOverride: jest.fn((key: string) => metadata[key]),
  } as unknown as Reflector;
}

function contextWithPermissions(permissions: string[]): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        currentPrincipal: {
          userId: 'user-id',
          sessionId: 'session-id',
          email: 'user@example.com',
          roleKeys: [],
          permissions,
        },
      }),
    }),
  } as unknown as ExecutionContext;
}
