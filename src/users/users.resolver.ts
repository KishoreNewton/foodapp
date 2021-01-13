import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput
} from './dtos/creat-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput
  ): Promise<CreateAccountOutput> {
    try {
      return this.userService.createAccount(
        createAccountInput
      );
    } catch (error) {
      return {
        error,
        ok: false
      };
    }
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      return this.userService.login(loginInput);
    } catch (error) {
      return {
        ok: false,
        error
      };
    }
  }
}
