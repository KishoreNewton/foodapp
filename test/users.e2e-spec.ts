import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

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
  let usersRepository: Repository<User>;
  let jwtToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
          jwtToken = login.token;
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
          expect(login.error).toBe('Wrong password');
          expect(login.token).toEqual(null);
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;

    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it('should see a user profile', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
          {
            userProfile(userId: ${userId}) {
              ok
              error
              user {
                id
              }
            }
          }
        `
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id }
                }
              }
            }
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });

    it('should not find a profile', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
          {
            userProfile(userId: 7778277) {
              ok
              error
              user {
                id
              }
            }
          }
        `
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user }
              }
            }
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('User not found');
          expect(user).toBe(null);
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
            {
              me {
                email
              }
            }
          `
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                me: { email }
              }
            }
          } = res;
          expect(email).toBe(testUser.email);
        });
    });

    it('should find fail to find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            {
              me {
                email
              }
            }
          `
        })
        .expect(200)
        .expect(res => {
          const {
            body: { errors }
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  // it.todo('me');
});
