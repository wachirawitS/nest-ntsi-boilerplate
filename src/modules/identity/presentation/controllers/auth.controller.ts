import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import {
  ApiEnvelopeResponse,
  ApiErrorResponseDto,
  Authenticated,
  CurrentPrincipal,
  Public,
} from '../../../../shared/api';
import type { CurrentPrincipalContext } from '../../../../shared/api';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { GetCurrentPrincipalUseCase } from '../../application/use-cases/get-current-principal.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import {
  ChangePasswordRequestDto,
  LoginRequestDto,
  RefreshSessionRequestDto,
} from '../dtos/auth.request.dto';
import {
  AuthTokensResponseDto,
  PrincipalResponseDto,
} from '../dtos/auth.response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly login: LoginUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logout: LogoutUseCase,
    private readonly getCurrentPrincipal: GetCurrentPrincipalUseCase,
    private readonly changePassword: ChangePasswordUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiEnvelopeResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async loginUser(
    @Body() input: LoginRequestDto,
    @Req() request: Request,
  ): Promise<AuthTokensResponseDto> {
    const tokens = await this.login.execute({
      ...input,
      ipAddress: request.ip,
      userAgent: request.header('user-agent') ?? null,
    });

    return AuthTokensResponseDto.fromDto(tokens);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh an authenticated session' })
  @ApiEnvelopeResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async refresh(
    @Body() input: RefreshSessionRequestDto,
  ): Promise<AuthTokensResponseDto> {
    const tokens = await this.refreshSession.execute(input);

    return AuthTokensResponseDto.fromDto(tokens);
  }

  @Authenticated()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Log out current session' })
  async logoutCurrentSession(
    @CurrentPrincipal() principal: CurrentPrincipalContext,
  ): Promise<void> {
    await this.logout.execute({
      userId: principal.userId,
      sessionId: principal.sessionId,
    });
  }

  @Authenticated()
  @Get('me')
  @ApiOperation({ summary: 'Get current principal' })
  @ApiEnvelopeResponse({ type: PrincipalResponseDto })
  async getMe(
    @CurrentPrincipal() principal: CurrentPrincipalContext,
  ): Promise<PrincipalResponseDto> {
    const currentPrincipal = await this.getCurrentPrincipal.execute(
      principal.userId,
    );

    return PrincipalResponseDto.fromDto(currentPrincipal);
  }

  @Authenticated()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  @ApiEnvelopeResponse({ type: AuthTokensResponseDto })
  async changeCurrentPassword(
    @CurrentPrincipal() principal: CurrentPrincipalContext,
    @Body() input: ChangePasswordRequestDto,
  ): Promise<AuthTokensResponseDto> {
    const tokens = await this.changePassword.execute({
      userId: principal.userId,
      sessionId: principal.sessionId,
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    });

    return AuthTokensResponseDto.fromDto(tokens);
  }
}
