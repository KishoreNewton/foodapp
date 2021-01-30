import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { async } from 'rxjs';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn()
});

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn()
};

const mockMailService = {
  sendVerificationEmail: jest.fn()
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository()
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository()
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: MailService,
          useValue: mockMailService
        }
      ]
    }).compile();
    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Account', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0
    };
    it('Should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'abcd@mail.com'
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with the email already'
      });
    });

    it('should create a new user successfully', async () => {
      usersRepository.findOne.mockReturnValue(undefined);
      await service.createAccount(createAccountArgs);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  // it.todo('login');
  // it.todo('findById');
  // it.todo('editProfile');
  // it.todo('verifyEmail');
});
