import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdentityAuthRbac1783500000000 implements MigrationInterface {
  name = 'AddIdentityAuthRbac1783500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "identity"');
    await queryRunner.query(`
      CREATE TABLE "identity"."user_credentials" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "password_hash" text NOT NULL,
        "password_changed_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_identity_user_credentials" PRIMARY KEY ("id"),
        CONSTRAINT "uq_identity_user_credentials_user_id" UNIQUE ("user_id"),
        CONSTRAINT "fk_identity_user_credentials_user_id_users"
          FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "identity"."sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "refresh_token_secret_hash" text NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "last_used_at" timestamptz,
        "revoked_at" timestamptz,
        "revoked_reason" varchar(100),
        "ip_address" varchar(64),
        "user_agent" varchar(512),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_identity_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "fk_identity_sessions_user_id_users"
          FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "ix_identity_sessions_user_id" ON "identity"."sessions" ("user_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "ix_identity_sessions_expires_at" ON "identity"."sessions" ("expires_at")',
    );
    await queryRunner.query(`
      CREATE TABLE "identity"."permissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "key" varchar(160) NOT NULL,
        "description" varchar(255),
        "is_active" boolean NOT NULL DEFAULT true,
        "is_declared" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_identity_permissions" PRIMARY KEY ("id"),
        CONSTRAINT "uq_identity_permissions_key" UNIQUE ("key")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "identity"."roles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "key" varchar(100) NOT NULL,
        "name" varchar(120) NOT NULL,
        "is_system" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_identity_roles" PRIMARY KEY ("id"),
        CONSTRAINT "uq_identity_roles_key" UNIQUE ("key")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "identity"."role_permissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "pk_identity_role_permissions" PRIMARY KEY ("id"),
        CONSTRAINT "uq_identity_role_permissions_role_id_permission_id"
          UNIQUE ("role_id", "permission_id"),
        CONSTRAINT "fk_identity_role_permissions_role_id_roles"
          FOREIGN KEY ("role_id") REFERENCES "identity"."roles"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_identity_role_permissions_permission_id_permissions"
          FOREIGN KEY ("permission_id") REFERENCES "identity"."permissions"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "identity"."user_roles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "role_id" uuid NOT NULL,
        CONSTRAINT "pk_identity_user_roles" PRIMARY KEY ("id"),
        CONSTRAINT "uq_identity_user_roles_user_id_role_id"
          UNIQUE ("user_id", "role_id"),
        CONSTRAINT "fk_identity_user_roles_user_id_users"
          FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_identity_user_roles_role_id_roles"
          FOREIGN KEY ("role_id") REFERENCES "identity"."roles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "identity"."user_permissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "pk_identity_user_permissions" PRIMARY KEY ("id"),
        CONSTRAINT "uq_identity_user_permissions_user_id_permission_id"
          UNIQUE ("user_id", "permission_id"),
        CONSTRAINT "fk_identity_user_permissions_user_id_users"
          FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_identity_user_permissions_permission_id_permissions"
          FOREIGN KEY ("permission_id") REFERENCES "identity"."permissions"("id") ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TABLE IF EXISTS "identity"."user_permissions"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "identity"."user_roles"');
    await queryRunner.query(
      'DROP TABLE IF EXISTS "identity"."role_permissions"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "identity"."roles"');
    await queryRunner.query('DROP TABLE IF EXISTS "identity"."permissions"');
    await queryRunner.query(
      'DROP INDEX IF EXISTS "identity"."ix_identity_sessions_expires_at"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "identity"."ix_identity_sessions_user_id"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "identity"."sessions"');
    await queryRunner.query(
      'DROP TABLE IF EXISTS "identity"."user_credentials"',
    );
  }
}
