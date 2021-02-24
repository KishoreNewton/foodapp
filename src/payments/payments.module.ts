import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Payment } from './entities/payment.entity';
import { PaymentsSevice } from './payments.service';
import { PaymentResolver } from './payments.resolver';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
  providers: [PaymentsSevice, PaymentResolver]
})
export class PaymentsModule {}
