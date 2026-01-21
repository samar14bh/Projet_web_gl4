import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Récupérer tous les utilisateurs
   */
  async findAll() {
    return this.userRepository.find({
      select: ['id', 'name', 'lastName', 'email', 'image'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'lastName', 'email', 'image'],
    });
  }
}
