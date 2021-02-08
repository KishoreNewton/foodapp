import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { getConnection } from 'typeorm';

const GRAPHQL_ENDPOINT: '/graphql' = '/graphql';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  const EMAIL: string = process.env.AWS_SOURCE;

  describe('createAccount', () => {
    it('should create an account', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              createAccount(input: {
                email: "${EMAIL}",
                password: "password",
                role: Owner
              }) {
                ok
                error
              }
            }
        `
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  // it.todo('me');
});
