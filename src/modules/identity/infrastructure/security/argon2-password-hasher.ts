import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PasswordHasher } from '../../application/security/password-hasher';

@Injectable()
export class Argon2PasswordHasher implements PasswordHasher {
  async hash(value: string): Promise<string> {
    return argon2.hash(value, { type: argon2.argon2id });
  }

  async verify(hash: string, value: string): Promise<boolean> {
    return argon2.verify(hash, value);
  }
}
