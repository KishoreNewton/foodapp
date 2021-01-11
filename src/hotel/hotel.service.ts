import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHotelDto } from './dtos/create-hotel.dto';
import { Hotel } from './entities/hotel.entity';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel) private readonly hotels: Repository<Hotel>
  ) {}
  getAll(): Promise<Hotel[]> {
    return this.hotels.find();
  }
  createHotel(createHotelDto: CreateHotelDto): Promise<Hotel> {
    const newHotel = this.hotels.create(createHotelDto);
    return this.hotels.save(newHotel);
  }
}
