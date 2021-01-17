import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/creat-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/users.entity';
import { JwtService } from 'src/jwt/jwt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async createAccount({
    email,
    password,
    role
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return {
          ok: false,
          error: 'There is a user with the email already'
        };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: "Couldn't create account"
      };
    }
  }

  async login({
    email,
    password
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return {
          ok: false,
          error: 'User not found'
        };
      }
      const isCorrectPassword = await user.checkPassword(password);
      if (!isCorrectPassword) {
        return {
          ok: false,
          error: 'Wrong password'
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token
      };
    } catch (error) {
      return {
        ok: false,
        error
      };
    }
  }
  
  async findById(id: number): Promise<User> {
    return this.users.findOne({ id });
  }
}
