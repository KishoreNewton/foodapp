import { Field, InputType, OmitType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Hotel } from '../entities/hotel.entity';

@InputType()
export class CreateHotelDto extends OmitType(Hotel, ['id'], InputType) {

}
