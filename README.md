# NTSI Nest Boilerplate

Boilerplate สำหรับสร้าง backend ด้วย NestJS โดยตั้งใจให้เริ่มจาก **modular monolith** ก่อน แต่จัด boundary ให้ชัดพอที่จะ extract บาง module ออกไปเป็น microservice ได้ในอนาคต

แนวคิดหลักของ project นี้คือ:

- module เป็นเจ้าของ business domain และ persistence ของตัวเอง
- entity อยู่ใน module เจ้าของ ไม่รวมไว้กลาง
- module อื่นห้าม import ข้ามเข้าไปใน `domain` หรือ `infrastructure`
- การคุยข้าม module ต้องผ่าน public API หรือ event
- database object อยู่ภายใต้ owning domain ที่รับผิดชอบ

## Stack

- NestJS
- TypeScript
- Postgres
- TypeORM
- class-validator / class-transformer
- Swagger / OpenAPI
- Jest
- ESLint + Prettier
- Docker multi-stage build

## Project Structure

```txt
src/
  app.module.ts
  main.ts
  configs/
    typeorm.config.ts
  migrations/
    1783400000000-create-identity-users.ts
  modules/
    index.ts
    identity/
      identity.module.ts
      index.ts
      presentation/
        controllers/
        dtos/
      application/
        identity.facade.ts
        use-cases/
      domain/
        entities/
        errors/
        repositories/
      infrastructure/
        persistence/
```

## Module Structure

แต่ละ module ใช้ folder ตาม responsibility ไม่ใช่ตาม Nest artifact แบบ `controllers/services/dtos/entities` เป็น top-level

```txt
src/modules/{module-name}/
  {module-name}.module.ts
  index.ts
  presentation/
  application/
  domain/
  infrastructure/
```

เหตุผลคือ boilerplate นี้ไม่ได้ optimize แค่ CRUD เร็ว แต่ต้องการให้ module boundary อ่านออก, test ง่าย, และย้ายออกไปเป็น service ได้ง่ายขึ้น

## Folder Responsibilities

### `presentation`

ชั้นที่รับ request และแปลง response ออกไปให้ client

ใส่ของพวกนี้:

- controllers
- request DTOs
- response DTOs
- Swagger decorators
- validation decorators เช่น `@IsString()`, `@IsEmail()`, `@IsBoolean()`

ตัวอย่าง:

```txt
presentation/
  controllers/users.controller.ts
  dtos/create-user.request.dto.ts
  dtos/user.response.dto.ts
```

Controller ควรบาง ทำหน้าที่รับ input, เรียก use case, map error เป็น HTTP exception และ return response DTO

### `application`

ชั้นที่อธิบาย workflow ของระบบ หรือสิ่งที่ user/system ต้องการทำ

ใส่ของพวกนี้:

- use cases
- application services
- facades ที่ export ให้ module อื่นเรียก
- command/query handlers ถ้าเพิ่ม CQRS ภายหลัง

ตัวอย่าง:

```txt
application/
  identity.facade.ts
  use-cases/create-user.use-case.ts
  use-cases/get-user.use-case.ts
```

### `domain`

ชั้นของ business concept ที่ module นี้เป็นเจ้าของ

ใส่ของพวกนี้:

- entities
- value objects
- domain errors
- domain events
- repository interfaces/ports
- domain services เฉพาะกรณีที่ rule ไม่ได้อยู่ใน entity ตัวเดียว

ตัวอย่าง:

```txt
domain/
  entities/user.entity.ts
  errors/user-already-exists.error.ts
  repositories/user.repository.ts
```

Entity อยู่ตรงนี้เพราะถือว่าเป็น persistence model ที่ผูกกับ owning domain ของ module นั้น ห้ามย้ายไปรวมไว้ `src/entities`

### `infrastructure`

ชั้น implementation ที่คุยกับโลกภายนอก

ใส่ของพวกนี้:

- TypeORM repository implementation
- external API adapter
- message broker adapter
- file storage adapter
- cache adapter

ตัวอย่าง:

```txt
infrastructure/
  persistence/typeorm-user.repository.ts
```

`domain` อาจประกาศ interface ว่าอยาก save/find user อย่างไร ส่วน `infrastructure` เป็นคนบอกว่าทำจริงด้วย TypeORM/Postgres อย่างไร

## Use Case คืออะไร

Use case คือ class ที่แทน action หนึ่งของระบบ เช่น `CreateUserUseCase`, `GetUserUseCase`, `MarkInvoiceAsPaidUseCase`

วิธีคิด:

- ถ้าเป็นสิ่งที่ user หรือระบบภายนอกสั่งให้ application ทำได้ ให้เป็น use case
- use case หนึ่งควรมีเป้าหมายชัดเจน
- use case คุม workflow, validation เชิง business, transaction boundary และเรียก repository/facade ที่จำเป็น
- controller ไม่ควรมี business workflow เอง

ตัวอย่าง:

```ts
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
```

ตัวอย่างการตัดสินใจ:

- `POST /users` ไม่ควรสร้าง user ใน controller โดยตรง
- controller เรียก `CreateUserUseCase`
- use case เช็ค email ซ้ำและสร้าง entity
- repository implementation เป็นเรื่องของ infrastructure

## Public API ของ Module

แต่ละ module ต้องมี public API ชัดเจนผ่าน `index.ts`

ตัวอย่าง:

```ts
export { IdentityModule } from './identity.module';
export { IdentityFacade } from './application/identity.facade';
```

Module อื่น import ได้เฉพาะของที่ module เจ้าของตั้งใจ export

ทำได้:

```ts
import { IdentityFacade } from '../identity';
```

ห้าม:

```ts
import { UserEntity } from '../identity/domain/entities/user.entity';
import { TypeOrmUserRepository } from '../identity/infrastructure/persistence/typeorm-user.repository';
```

เหตุผลคือถ้า module อื่นรู้จัก entity/repository ภายในของ `identity` มากเกินไป วันหนึ่งจะ extract `identity` ออกไปเป็น service ได้ยาก

## Cross-Module Communication

ใช้ hybrid approach:

- ถ้าต้องการคำตอบทันที ให้เรียกผ่าน facade ของ module เจ้าของ
- ถ้าเป็น side effect หรือ reaction ข้าม module ให้ใช้ event

ตัวอย่าง synchronous:

```ts
@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly identity: IdentityFacade) {}

  async execute(input: CreateOrderInput): Promise<void> {
    await this.identity.assertUserExists(input.userId);
    // create order
  }
}
```

ตัวอย่าง event:

```ts
export class UserCreatedEvent {
  constructor(public readonly userId: string) {}
}
```

ใช้ facade เมื่อ business flow ต้องรู้ผลทันที ใช้ event เมื่อ module อื่นแค่ต้อง react ต่อ

## Shared Rules

`shared` มีได้ แต่ต้องเล็กและไม่ใช่ business domain

อนุญาต:

```txt
shared/
  decorators/
  errors/
  filters/
  guards/
  interceptors/
  pipes/
  types/
  utils/
```

หลีกเลี่ยง:

```txt
shared/entities/
shared/repositories/
shared/services/
shared/dtos/
```

ถ้า concept มี owning domain ให้เก็บไว้ใน module เจ้าของ แล้ว expose ผ่าน facade, event หรือ explicit contract

## Database Rules

ใช้ Postgres + TypeORM และใช้ migration เท่านั้น

ห้ามใช้:

```ts
synchronize: true
```

### Schema by Owning Domain

Table ต้องอยู่ภายใต้ schema ของ owning domain

```txt
identity.users
billing.invoices
billing.invoice_lines
```

เหตุผล:

- เห็น data ownership จาก database
- migration อ่าน ownership ออก
- extract module เป็น service ได้ง่ายขึ้น
- ลดการ query/write ข้าม domain แบบไม่ตั้งใจ

### Naming Convention

Code และ API ใช้ `camelCase`

```ts
firstName: string;
createdAt: Date;
```

Database ใช้ `snake_case`

```txt
first_name
created_at
```

Entity ต้อง map ชัดเจน:

```ts
@Column({ name: 'first_name' })
firstName!: string;

@CreateDateColumn({ name: 'created_at' })
createdAt!: Date;
```

### Constraint and Index Naming

ใช้ owning domain prefix เสมอ

```txt
pk_identity_users
uq_identity_users_email
ix_identity_users_created_at
fk_billing_invoice_lines_invoice_id_invoices
chk_billing_invoices_total_amount_non_negative
```

## Migrations

Migration อยู่กลางที่ `src/migrations`

```txt
src/migrations/
  1783400000000-create-identity-users.ts
```

กฎ:

- migration name ต้องมี owning domain เช่น `create-identity-users`
- migration ต้องสร้าง schema เอง เช่น `CREATE SCHEMA IF NOT EXISTS "identity"`
- migration ห้ามแก้ table ของ domain อื่นโดยไม่มีเหตุผลชัด
- auto-generated migration ต้อง review ชื่อ schema, table, column, index และ constraint ทุกครั้ง

คำสั่ง:

```bash
npm run migration:run
npm run migration:revert
```

สำหรับ compiled production build:

```bash
npm run migration:run:prod
npm run migration:revert:prod
```

## Validation and DTOs

Request DTO ใช้ `class-validator`

ตัวอย่าง:

```ts
export class CreateUserRequestDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;
}
```

Global validation เปิดใน `src/main.ts`

```ts
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
```

ผลคือ:

- field ที่ไม่ได้ประกาศใน DTO จะถูก reject
- input ถูก transform ตาม DTO เท่าที่ Nest/class-transformer รองรับ
- controller ได้ input ที่ผ่าน validation แล้ว

## Swagger

Swagger UI:

```txt
http://localhost:3000/api/docs
```

OpenAPI JSON:

```txt
http://localhost:3000/api/docs-json
```

ปิด Swagger ได้ด้วย:

```env
SWAGGER_ENABLED=false
```

DTO และ controller ควรใส่ Swagger decorators เพื่อให้ API docs อ่านง่าย

```ts
@ApiTags('Identity')
@Controller('users')
export class UsersController {}
```

```ts
@ApiProperty({ example: 'user@example.com', maxLength: 320 })
email!: string;
```

## Local Development

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run migration:run
npm run start:dev
```

Application:

```txt
http://localhost:3000
```

Swagger:

```txt
http://localhost:3000/api/docs
```

## Docker

Build image:

```bash
docker build -t nest-ntsi-boilerplate .
```

Run container:

```bash
docker run --rm -p 3000:3000 --env-file .env nest-ntsi-boilerplate
```

Dockerfile ใช้ multi-stage build:

```txt
deps      install dependencies ทั้งหมดสำหรับ build
build     compile TypeScript เป็น dist
prod-deps install production dependencies เท่านั้น
runner    copy dist + production node_modules แล้วรันด้วย non-root user
```

## Commands

```bash
npm run build
npm run lint
npm run format
npm test
npm run test:e2e
npm run migration:run
npm run migration:revert
npm run migration:run:prod
npm run migration:revert:prod
```

## How to Add a New Module

สมมติจะเพิ่ม `billing`

สร้าง structure:

```txt
src/modules/billing/
  billing.module.ts
  index.ts
  presentation/
    controllers/
    dtos/
  application/
    billing.facade.ts
    use-cases/
  domain/
    entities/
    errors/
    repositories/
  infrastructure/
    persistence/
```

วิธีคิด:

1. นิยามก่อนว่า `billing` เป็นเจ้าของ concept อะไร เช่น `Invoice`, `InvoiceLine`
2. วาง entity ไว้ใน `billing/domain/entities`
3. วาง repository interface ไว้ใน `billing/domain/repositories`
4. วาง TypeORM implementation ไว้ใน `billing/infrastructure/persistence`
5. วาง use case ตาม action จริง เช่น `CreateInvoiceUseCase`, `MarkInvoiceAsPaidUseCase`
6. วาง controller/DTO ไว้ใน `billing/presentation`
7. export เฉพาะ public API ผ่าน `billing/index.ts`
8. เพิ่ม migration ที่สร้าง schema/table ภายใต้ `billing`

ห้ามเริ่มจากการสร้าง `services` รวมทุกอย่างก่อน เพราะจะทำให้ business workflow, DB access และ HTTP concern ปนกันเร็ว

## Architecture Decisions

Architecture decisions อยู่ใน `docs/adr`

อ่านตามลำดับ:

- `0001-module-boundaries-and-entity-ownership.md`
- `0002-module-internal-structure.md`
- `0003-cross-module-communication.md`
- `0004-shared-kernel-limits.md`
- `0005-database-schema-by-owning-domain.md`
- `0006-code-and-database-naming.md`
- `0007-postgres-typeorm-migrations.md`
- `0008-central-migrations-with-domain-prefixes.md`
- `0009-database-object-naming.md`

Glossary ของ project อยู่ใน `CONTEXT.md`

## AI Agent Instructions

AI coding agents should read `AGENTS.md` before changing this repository. That file contains the enforceable rules for module boundaries, folder responsibilities, DTO validation, database naming, migrations, Swagger, Docker, and verification commands.
