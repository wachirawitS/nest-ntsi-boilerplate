import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserAlreadyExistsError } from '../../domain/errors/user-already-exists.error';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(input: CreateUserInput): Promise<UserEntity> {
    const normalizedEmail = input.email.toLowerCase();
    const existingUser = await this.users.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new UserAlreadyExistsError(normalizedEmail);
    }

    return this.users.save(
      UserEntity.create({
        ...input,
        email: normalizedEmail,
      }),
    );
  }
}
