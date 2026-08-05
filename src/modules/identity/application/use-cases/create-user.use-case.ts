import { Injectable } from '@nestjs/common';
import { EventBus } from '../../../../shared/events';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserAlreadyExistsError } from '../../domain/errors/user-already-exists.error';
import { UserCreatedEvent } from '../../domain/events/user-created.event';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly events: EventBus,
  ) {}

  async execute(input: CreateUserInput): Promise<UserEntity> {
    const normalizedEmail = input.email.toLowerCase();
    const existingUser = await this.users.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new UserAlreadyExistsError(normalizedEmail);
    }

    const user = await this.users.save(
      UserEntity.create({
        ...input,
        email: normalizedEmail,
      }),
    );

    this.events.publish(
      new UserCreatedEvent({
        userId: user.id,
        email: user.email,
      }),
    );

    return user;
  }
}
