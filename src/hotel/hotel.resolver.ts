import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { CreateHotelDto } from './dtos/create-hotel.dto';
import { Hotel } from './entities/hotel.entity';

@Resolver(() => Hotel)
export class HotelResolver {
  @Query(() => [Hotel])
  hotels(@Args('veganOnly') veganOnly: boolean): Hotel[] {
    return [];
  }
  @Mutation(() => Boolean)
  createHotel(
    @Args() createHotelInput: CreateHotelDto
  ): boolean {
    console.log(createHotelInput);
    return true;
  }
}
