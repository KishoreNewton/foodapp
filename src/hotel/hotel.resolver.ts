import { Resolver, Query, Args } from '@nestjs/graphql';
import { Hotel } from './entities/hotel.entity';

@Resolver(() => Hotel)
export class HotelResolver {
  @Query(() => [Hotel])
  hotels(@Args('veganOnly') veganOnly: boolean): Hotel[] {
    return [];
  }
}
