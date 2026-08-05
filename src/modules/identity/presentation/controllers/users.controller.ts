import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiEnvelopeResponse,
  ApiErrorResponseDto,
} from '../../../../shared/api';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { CreateUserRequestDto } from '../dtos/create-user.request.dto';
import { UserResponseDto } from '../dtos/user.response.dto';

@ApiTags('Identity')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUser: GetUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiEnvelopeResponse({ status: HttpStatus.CREATED, type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email is already registered',
    type: ApiErrorResponseDto,
  })
  async create(@Body() input: CreateUserRequestDto): Promise<UserResponseDto> {
    const user = await this.createUser.execute(input);

    return UserResponseDto.fromEntity(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiEnvelopeResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid user ID',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User was not found',
    type: ApiErrorResponseDto,
  })
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.getUser.execute(id);

    return UserResponseDto.fromEntity(user);
  }
}
