import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput
} from './dtos/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput
} from './dtos/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const categroy = await this.categories.getOrCreateCategory(
        createRestaurantInput.categroyName
      );
      const categroyName = createRestaurantInput.categroyName
        .trim()
        .toLowerCase();
      const categorySlug = categroyName.replace(/ /g, '-');
      let category = await this.categories.findOne({ slug: categorySlug });

      if (!category) {
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categroyName })
        );
      }

      await this.restaurants.save(newRestaurant);

      return {
        ok: true
        // restaurantId: newRestaurant.id
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant'
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput
  ): Promise<EditRestaurantOutput> {
    try {
      const restraunt = await this.restaurants.findOne(
        editRestaurantInput.restaurantId
      );

      if (!restraunt) {
        return {
          ok: false,
          error: 'Restaurant not found'
        };
      }
      if (owner.id !== restraunt.ownerId) {
        return {
          ok: false,
          error: 'You cannot edit a restaurant that you do not own'
        };
      }

      let category: Category = null;
      if (editRestaurantInput.categroyName) {
        category = await this.categories.getOrCreateCategory(
          editRestaurantInput.categroyName
        );
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category })
        }
      ]);
      return {
        ok: true
      };
    } catch (err) {
      return {
        ok: false,
        error: 'Could not edit Restaurant'
      };
    }
  }
}
