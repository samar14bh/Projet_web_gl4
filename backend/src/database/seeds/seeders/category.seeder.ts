import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../../clubs/entities/category.entity';

@Injectable()
export class CategorySeeder {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async seed(): Promise<Category[]> {
    const categories = [
      { name: 'Technologie', icon: 'bi-cpu' },
      { name: 'Business', icon: 'bi-briefcase' },
      { name: 'Arts & Culture', icon: 'bi-palette' },
      { name: 'Sport', icon: 'bi-trophy' },
      { name: 'Sciences', icon: 'bi-flask' },
      { name: 'Environnement', icon: 'bi-tree' },
    ];

    const createdCategories: Category[] = []; // ← AJOUTER le type

    for (const categoryData of categories) {
      const category = this.categoryRepository.create(categoryData);
      const saved = await this.categoryRepository.save(category);
      createdCategories.push(saved);
    }

    return createdCategories;
  }
}
