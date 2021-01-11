import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { CreateHotelDto } from './dtos/create-hotel.dto';
import { Hotel } from './entities/hotel.entity';
import { HotelService } from './hotel.service';

@Resolver(() => Hotel)
export class HotelResolver {
  constructor(private readonly hotelService: HotelService) {}

  @Query(() => [Hotel])
  hotels(): Promise<Hotel[]> {
    return this.hotelService.getAll();
  }
  @Mutation(() => Boolean)
  async createHotel(@Args('input') createHotelDto: CreateHotelDto): Promise<boolean> {
    try {
      await this.hotelService.createHotel(createHotelDto);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
