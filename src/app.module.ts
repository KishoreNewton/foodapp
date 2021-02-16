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
import { JwtMiddleware } from './jwt/jwt.middleware';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { Dish } from './restaurants/entities/dish.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ user: req['user'] }),
      sortSchema: true,
      debug: true,
      playground: true
    }),
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
      entities: [User, Verification, Restaurant, Category, Dish, Order, OrderItem]
    }),
    UsersModule,
    RestaurantsModule,
    AuthModule,
    CommonModule,
    JwtModule.forRoot({
      privateKey: process.env.JWT_SECRET_KEY
    }),
    MailModule.forRoot({
      source: process.env.AWS_SOURCE
    })
  ],
  controllers: [],
  providers: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: 'graphql',
      method: RequestMethod.ALL
    });
  }
}
