import { Injectable } from '@nestjs/common';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput
} from './dtos/create-paymente.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsSevice {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput
  ): Promise<CreatePaymentOutput> {
    const restaurant = await this.restaurants.findOne(restaurantId);

    if (restaurant.ownerId !== owner.id) {
      return {
        ok: false,
        error: 'You are not allowed to do this'
      };
    }

    await this.payments.save(
      this.payments.create({
        transactionId,
        user: owner,
        restaurant
      })
    );
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({ user });
      return {
        ok: true,
        payments
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load payments'
      };
    }
  }

  @Cron('30 * * * * *', {
    name: 'myJob'
  })
  async checkForPayments() {
    console.log('checking for payments...(cron)');
    const job = this.schedulerRegistry.getCronJob('myJob');
    console.log(job);
    job.stop();
  }

  @Interval(10000)
  async checkForPaymentsI() {
    console.log('checking for payments...(Interval)');
  }

  @Timeout(20000)
  afterStarts() {
    console.log('Congrats!');
  }
}
