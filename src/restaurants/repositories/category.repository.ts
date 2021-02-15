import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreateCategory(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const categroySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({ slug: categroySlug });

    if (!category) {
      category = await this.save(
        this.create({ slug: categroySlug, name: categoryName })
      );
    }
    return category;
  }
}
