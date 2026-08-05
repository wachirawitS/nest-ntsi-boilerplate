import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIdentityUsers1783400000000 implements MigrationInterface {
  name = 'CreateIdentityUsers1783400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "identity"');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query(`
      CREATE TABLE "identity"."users" (
        "id" uuid DEFAULT gen_random_uuid() NOT NULL,
        "email" varchar(320) NOT NULL,
        "first_name" varchar(100) NOT NULL,
        "last_name" varchar(100) NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamptz DEFAULT now() NOT NULL,
        "updated_at" timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT "pk_identity_users" PRIMARY KEY ("id"),
        CONSTRAINT "uq_identity_users_email" UNIQUE ("email")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "ix_identity_users_created_at" ON "identity"."users" ("created_at")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "identity"."ix_identity_users_created_at"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "identity"."users"');
    await queryRunner.query('DROP SCHEMA IF EXISTS "identity"');
  }
}
