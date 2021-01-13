import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/creat-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>
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
          error: 'Worng password'
        };
      }
    } catch (error) {
      return {
        ok: false,
        error
      };
    }
  }
}
