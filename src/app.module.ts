import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/users.entity';
import { JwtModule } from './jwt/jwt.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { Dish } from './restaurants/entities/dish.entity';
import { Order } from './orders/entities/order.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { OrderItem } from './orders/entities/order-item.entity';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';

@Module({
  imports: [
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, connection }) => {
        const TOKEN_KEY = 'x-jwt';
        return {
          token: req ? req.headers[TOKEN_KEY] : connection.context['X-JWT']
        };
      },
      sortSchema: true,
      debug: true,
      playground: true
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database:
        process.env.NODE_ENV === 'test'
          ? process.env.DB_NAME_TEST
          : process.env.POSTGRES_DATABASE,
      synchronize: true,
      logging: true,
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment
      ]
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    RestaurantsModule,
    AuthModule,
    CommonModule,
    OrdersModule,
    PaymentsModule,
    JwtModule.forRoot({
      privateKey: process.env.JWT_SECRET_KEY
    }),
    MailModule.forRoot({
      source: process.env.AWS_SOURCE
    }),
    PaymentsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
