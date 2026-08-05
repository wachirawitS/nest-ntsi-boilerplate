import { PrincipalDto } from './principal.dto';

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  principal: PrincipalDto;
}
