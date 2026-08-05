import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  ApplicationError,
  AUTH_PUBLIC_KEY,
  CurrentPrincipalContext,
  ErrorCode,
} from '../../../../shared/api';
import { TokenIssuer } from '../../application/security/token-issuer';
import { ResolveCurrentPrincipalUseCase } from '../../application/use-cases/resolve-current-principal.use-case';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenIssuer: TokenIssuer,
    private readonly resolvePrincipal: ResolveCurrentPrincipalUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      AUTH_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { currentPrincipal?: CurrentPrincipalContext }>();
    const token = this.extractBearerToken(request);
    const claims = await this.tokenIssuer.verifyAccessToken(token);
    request.currentPrincipal = await this.resolvePrincipal.execute({
      userId: claims.sub,
      sessionId: claims.sid,
    });

    return true;
  }

  private extractBearerToken(request: Request): string {
    const authorization = request.header('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      throw new ApplicationError({
        code: ErrorCode.Unauthenticated,
        message: 'Authentication required',
      });
    }

    return authorization.slice('Bearer '.length);
  }
}
