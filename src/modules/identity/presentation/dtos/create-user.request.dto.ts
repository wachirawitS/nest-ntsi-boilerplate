import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const roleKeyPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const permissionKeyPattern =
  /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*:[a-z][A-Za-z0-9]*$/;

export class CreateUserRequestDto {
  @ApiProperty({ example: 'user@example.com', maxLength: 320 })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: 'Nattasit', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Intarasuwan', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ minLength: 12, maxLength: 128 })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ type: [String], example: ['member'], required: false })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(roleKeyPattern, { each: true })
  roleKeys?: string[];

  @ApiProperty({ type: [String], example: [], required: false })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(permissionKeyPattern, { each: true })
  directPermissionKeys?: string[];
}
