import { Module } from '@nestjs/common';
import { HotelResolver } from './hotel.resolver';

@Module({
    providers: [HotelResolver]
})
export class HotelModule {}
