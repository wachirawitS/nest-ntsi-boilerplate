import { UserEntity } from '../entities/user.entity';

export abstract class UserRepository {
  abstract save(user: UserEntity): Promise<UserEntity>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract list(): Promise<UserEntity[]>;
  abstract update(user: UserEntity): Promise<UserEntity>;
}
