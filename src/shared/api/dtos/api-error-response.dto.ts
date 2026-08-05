import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ example: 'VALIDATION_FAILED' })
  code!: string;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiPropertyOptional()
  details?: unknown;
}

export class ApiResponseMetaDto {
  @ApiProperty({ example: '8efc77b2-7fd6-4fc8-a31f-eecf397a51d2' })
  requestId!: string;

  @ApiPropertyOptional({ format: 'date-time' })
  timestamp?: string;

  @ApiPropertyOptional({ example: '/users' })
  path?: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success!: false;

  @ApiProperty({ type: ApiErrorDto })
  error!: ApiErrorDto;

  @ApiProperty({ type: ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}
