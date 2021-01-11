import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from './entities/hotel.entity';
import { HotelResolver } from './hotel.resolver';
import { HotelService } from './hotel.service';

@Module({
    imports: [TypeOrmModule.forFeature([Hotel])],
    providers: [HotelResolver, HotelService]
})
export class HotelModule {}
