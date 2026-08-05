import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.get(DataSource).runMigrations();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('x-request-id', 'test-request-id')
      .expect(200)
      .expect('x-request-id', 'test-request-id')
      .expect(({ body }) => {
        expect(body).toEqual({
          success: true,
          data: 'Hello World!',
          meta: {
            requestId: 'test-request-id',
          },
        });
      });
  });

  it('/users (POST) returns validation envelope', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('x-request-id', 'validation-request-id')
      .send({
        email: 'not-an-email',
        firstName: '',
        lastName: 'User',
      })
      .expect(400)
      .expect('x-request-id', 'validation-request-id')
      .expect(({ body }) => {
        expect(body).toEqual({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: expect.arrayContaining([
              {
                field: 'email',
                messages: expect.arrayContaining([
                  'email must be an email',
                ]) as unknown,
              },
              {
                field: 'firstName',
                messages: expect.arrayContaining([
                  'firstName must be longer than or equal to 1 characters',
                ]) as unknown,
              },
            ]) as unknown,
          },
          meta: {
            requestId: 'validation-request-id',
            timestamp: expect.any(String) as unknown,
            path: '/users',
          },
        });
      });
  });

  it('/users/:id (GET) returns domain error envelope', () => {
    const userId = '8efc77b2-7fd6-4fc8-a31f-eecf397a51d2';

    return request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('x-request-id', 'not-found-request-id')
      .expect(404)
      .expect('x-request-id', 'not-found-request-id')
      .expect(({ body }) => {
        expect(body).toEqual({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User was not found',
            details: { userId },
          },
          meta: {
            requestId: 'not-found-request-id',
            timestamp: expect.any(String) as unknown,
            path: `/users/${userId}`,
          },
        });
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
