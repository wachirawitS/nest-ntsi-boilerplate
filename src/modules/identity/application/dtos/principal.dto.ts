import { UserEntity } from '../../domain/entities/user.entity';

export interface PrincipalDto {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
  roles: string[];
  permissions: string[];
}

export function toPrincipalDto(input: {
  user: UserEntity;
  roleKeys: string[];
  permissionKeys: string[];
}): PrincipalDto {
  return {
    user: {
      id: input.user.id,
      email: input.user.email,
      firstName: input.user.firstName,
      lastName: input.user.lastName,
      isActive: input.user.isActive,
    },
    roles: input.roleKeys,
    permissions: input.permissionKeys,
  };
}
