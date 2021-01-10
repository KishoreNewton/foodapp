import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class HotelResolver {
  @Query(() => Boolean)
  isPizzaGood(): Boolean {
    return true;
  }
}
