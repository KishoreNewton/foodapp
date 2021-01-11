import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

@ArgsType()
export class CreateHotelDto {
  @Field(() => String)
  @IsString()
  @Length(2, 25)
  name: string;

  @Field(() => Boolean)
  @IsBoolean()
  isVegan?: boolean;

  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => String)
  @IsString()
  ownerName: string;
}
