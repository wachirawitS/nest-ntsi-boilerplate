import { ApiProperty } from '@nestjs/swagger';
import { AuthTokensDto } from '../../application/dtos/auth-tokens.dto';
import { PrincipalDto } from '../../application/dtos/principal.dto';

export class PrincipalUserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'admin@example.com' })
  email!: string;

  @ApiProperty({ example: 'Nattasit' })
  firstName!: string;

  @ApiProperty({ example: 'Intarasuwan' })
  lastName!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class PrincipalResponseDto {
  @ApiProperty({ type: PrincipalUserResponseDto })
  user!: PrincipalUserResponseDto;

  @ApiProperty({ type: [String], example: ['admin'] })
  roles!: string[];

  @ApiProperty({ type: [String], example: ['users:read'] })
  permissions!: string[];

  static fromDto(principal: PrincipalDto): PrincipalResponseDto {
    return principal;
  }
}

export class AuthTokensResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ example: 900 })
  expiresIn!: number;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: 'Bearer';

  @ApiProperty({ type: PrincipalResponseDto })
  principal!: PrincipalResponseDto;

  static fromDto(tokens: AuthTokensDto): AuthTokensResponseDto {
    return tokens;
  }
}
