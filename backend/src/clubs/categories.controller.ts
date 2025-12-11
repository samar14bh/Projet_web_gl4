import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

/**
 * Controller pour les catégories de clubs
 * Route de base: /api/categories
 */
@Controller('categories')
export class CategoriesController {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * GET /api/categories
   * Récupérer toutes les catégories
   */
  @Get()
  findAll() {
    return this.categoryRepository.find({
      order: { name: 'ASC' },
    });
  }
}
