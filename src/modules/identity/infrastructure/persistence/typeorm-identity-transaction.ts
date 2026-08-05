import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { IdentityTransaction } from '../../domain/repositories/identity-transaction';

@Injectable()
export class TypeOrmIdentityTransactionContext {
  private readonly storage = new AsyncLocalStorage<EntityManager>();

  run<T>(manager: EntityManager, work: () => Promise<T>): Promise<T> {
    return this.storage.run(manager, work);
  }

  get manager(): EntityManager | undefined {
    return this.storage.getStore();
  }
}

@Injectable()
export class TypeOrmIdentityTransaction implements IdentityTransaction {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly context: TypeOrmIdentityTransactionContext,
  ) {}

  async run<T>(work: () => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) =>
      this.context.run(manager, work),
    );
  }
}
