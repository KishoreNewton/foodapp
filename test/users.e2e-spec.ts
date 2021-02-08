import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { getConnection } from 'typeorm';

const GRAPHQL_ENDPOINT: '/graphql' = '/graphql';

interface TestUser {
  email: string;
  password: string;
}

const testUser: TestUser = {
  email: process.env.AWS_SOURCE,
  password: '12345'
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  describe('createAccount', () => {
    it('should create an account', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              createAccount(input: {
                email: "${testUser.email}",
                password: "${testUser.password}",
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

    it('should fail if account already exists', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            createAccount(input: {
              email: "${testUser.email}",
              password: "${testUser.password}",
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
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            login(input: {
              email: "${testUser.email}",
              password: "${testUser.password}",
            }) {
              error
              token
              ok
            }
          }
        `
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { login }
            }
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
        });
    });

    it('should not be able to login with wrong credentials', async () => {
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: `
        mutation {
          login(input: {
            email: "${testUser.email}",
            password: "wrong.password",
          }) {
            error
            token
            ok
          }
        }
      `
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: { login }
          }
        } = res;
        expect(login.ok).toBe(false);
        expect(login.error).toBe("Wrong password");
        expect(login.token).toEqual(null);
      });
    });
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  // it.todo('me');
});
